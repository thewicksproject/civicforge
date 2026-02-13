import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createServiceClient: vi.fn(),
}));

import {
  processPendingDeletions,
  requestDeletion,
} from "@/lib/privacy/deletion";
import { createServiceClient } from "@/lib/supabase/server";

const mockedCreateServiceClient = vi.mocked(createServiceClient);

type QueryResult = { data: unknown; error: { message: string; code?: string } | null };

function createSelectQuery(result: QueryResult) {
  const query = {
    eq: vi.fn(() => query),
    in: vi.fn(() => query),
    order: vi.fn(() => query),
    limit: vi.fn(() => query),
    lt: vi.fn(() => query),
    maybeSingle: vi.fn(async () => result),
    single: vi.fn(async () => result),
    then: (onfulfilled?: (value: QueryResult) => unknown, onrejected?: (reason: unknown) => unknown) =>
      Promise.resolve(result).then(onfulfilled, onrejected),
  };
  return query;
}

function createUpdateQuery(result: QueryResult) {
  const query = {
    eq: vi.fn(() => query),
    in: vi.fn(() => query),
    select: vi.fn(() => query),
    maybeSingle: vi.fn(async () => result),
    then: (onfulfilled?: (value: QueryResult) => unknown, onrejected?: (reason: unknown) => unknown) =>
      Promise.resolve(result).then(onfulfilled, onrejected),
  };
  return query;
}

function createDeleteQuery(result: QueryResult) {
  const query = {
    eq: vi.fn(() => query),
    then: (onfulfilled?: (value: QueryResult) => unknown, onrejected?: (reason: unknown) => unknown) =>
      Promise.resolve(result).then(onfulfilled, onrejected),
  };
  return query;
}

describe("deletion pipeline", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns existing open deletion request (idempotent)", async () => {
    const from = vi.fn((table: string) => {
      if (table === "deletion_requests") {
        return {
          select: vi.fn(() =>
            createSelectQuery({
              data: {
                id: "req-1",
                subject_user_id: "user-1",
                status: "pending",
                requested_at: "2026-02-10T00:00:00.000Z",
              },
              error: null,
            })
          ),
        };
      }
      throw new Error(`Unexpected table: ${table}`);
    });

    mockedCreateServiceClient.mockReturnValue({ from } as never);

    const result = await requestDeletion("user-1");
    expect(result.alreadyPending).toBe(true);
    expect(result.requestId).toBe("req-1");
    expect(result.subjectUserId).toBe("user-1");
  });

  it("creates a new deletion request when none exists", async () => {
    const from = vi.fn((table: string) => {
      if (table !== "deletion_requests") {
        throw new Error(`Unexpected table: ${table}`);
      }

      return {
        select: vi.fn(() =>
          createSelectQuery({
            data: null,
            error: null,
          })
        ),
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(async () => ({
              data: {
                id: "req-2",
                subject_user_id: "user-2",
                status: "pending",
                requested_at: "2026-02-11T00:00:00.000Z",
              },
              error: null,
            })),
          })),
        })),
      };
    });

    mockedCreateServiceClient.mockReturnValue({ from } as never);

    const result = await requestDeletion("user-2");
    expect(result.alreadyPending).toBe(false);
    expect(result.requestId).toBe("req-2");
    expect(result.subjectUserId).toBe("user-2");
  });

  it("marks request failed when processing hits a partial failure", async () => {
    const from = vi
      .fn()
      // 1) fetch pending
      .mockImplementationOnce(() => ({
        select: vi.fn(() =>
          createSelectQuery({
            data: [
              {
                id: "req-3",
                subject_user_id: "user-3",
                status: "pending",
                requested_at: "2025-12-01T00:00:00.000Z",
                attempts: 0,
              },
            ],
            error: null,
          })
        ),
      }))
      // 2) acquire request
      .mockImplementationOnce(() => ({
        update: vi.fn(() =>
          createUpdateQuery({
            data: { id: "req-3", subject_user_id: "user-3" },
            error: null,
          })
        ),
      }))
      // 3) post_photos lookup fails
      .mockImplementationOnce(() => ({
        select: vi.fn(() =>
          createSelectQuery({
            data: null,
            error: { message: "db unavailable" },
          })
        ),
      }))
      // 4) mark failed
      .mockImplementationOnce(() => ({
        update: vi.fn(() =>
          createUpdateQuery({
            data: null,
            error: null,
          })
        ),
      }));

    mockedCreateServiceClient.mockReturnValue({
      from,
      storage: {
        from: vi.fn(() => ({
          remove: vi.fn(async () => ({ error: null })),
        })),
      },
      auth: {
        admin: {
          deleteUser: vi.fn(async () => ({ error: null })),
        },
      },
    } as never);

    const results = await processPendingDeletions();
    expect(results).toHaveLength(1);
    expect(results[0].status).toBe("failed");
    expect(results[0].requestId).toBe("req-3");
    expect(results[0].reason).toContain("post_photos_lookup_failed");
  });

  it("completes request when all deletion steps succeed", async () => {
    const from = vi
      .fn()
      // 1) fetch pending
      .mockImplementationOnce(() => ({
        select: vi.fn(() =>
          createSelectQuery({
            data: [
              {
                id: "req-4",
                subject_user_id: "user-4",
                status: "pending",
                requested_at: "2025-12-01T00:00:00.000Z",
                attempts: 1,
              },
            ],
            error: null,
          })
        ),
      }))
      // 2) acquire request
      .mockImplementationOnce(() => ({
        update: vi.fn(() =>
          createUpdateQuery({
            data: { id: "req-4", subject_user_id: "user-4" },
            error: null,
          })
        ),
      }))
      // 3) no photos
      .mockImplementationOnce(() => ({
        select: vi.fn(() =>
          createSelectQuery({
            data: [],
            error: null,
          })
        ),
      }))
      // 4) delete profile
      .mockImplementationOnce(() => ({
        delete: vi.fn(() =>
          createDeleteQuery({
            data: null,
            error: null,
          })
        ),
      }))
      // 5) mark complete
      .mockImplementationOnce(() => ({
        update: vi.fn(() =>
          createUpdateQuery({
            data: { id: "req-4" },
            error: null,
          })
        ),
      }));

    mockedCreateServiceClient.mockReturnValue({
      from,
      storage: {
        from: vi.fn(() => ({
          remove: vi.fn(async () => ({ error: null })),
        })),
      },
      auth: {
        admin: {
          deleteUser: vi.fn(async () => ({ error: null })),
        },
      },
    } as never);

    const results = await processPendingDeletions();
    expect(results).toEqual([
      {
        requestId: "req-4",
        subjectUserId: "user-4",
        status: "completed",
      },
    ]);
  });
});
