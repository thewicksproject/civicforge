import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
  createServiceClient: vi.fn(),
}));

import { redeemInvitation } from "@/app/actions/invitations";
import { createClient, createServiceClient } from "@/lib/supabase/server";

type ProfileRow = {
  id: string;
  community_id: string | null;
  renown_tier: number;
  updated_at?: string;
};

type InvitationRow = {
  id: string;
  code: string;
  community_id: string;
  used_by: string | null;
  expires_at: string;
};

type TableName = "profiles" | "invitations";
type Filter =
  | { kind: "eq"; column: string; value: unknown }
  | { kind: "is"; column: string; value: unknown }
  | { kind: "gt"; column: string; value: unknown };

type FakeDb = {
  profiles: ProfileRow[];
  invitations: InvitationRow[];
  failProfileUpdate?: boolean;
  beforeInvitationClaim?: ((db: FakeDb) => void) | null;
};

class FakeQueryBuilder {
  private operation: "select" | "update" | null = null;
  private updatePatch: Record<string, unknown> | null = null;
  private selectedColumns = "*";
  private calledSelect = false;
  private readonly filters: Filter[] = [];

  constructor(
    private readonly db: FakeDb,
    private readonly table: TableName
  ) {}

  select(columns = "*") {
    this.calledSelect = true;
    this.selectedColumns = columns;
    if (!this.operation) {
      this.operation = "select";
    }
    return this;
  }

  update(patch: Record<string, unknown>) {
    this.operation = "update";
    this.updatePatch = { ...patch };
    return this;
  }

  eq(column: string, value: unknown) {
    this.filters.push({ kind: "eq", column, value });
    return this;
  }

  is(column: string, value: unknown) {
    this.filters.push({ kind: "is", column, value });
    return this;
  }

  gt(column: string, value: unknown) {
    this.filters.push({ kind: "gt", column, value });
    return this;
  }

  single() {
    return Promise.resolve(this.execute(true));
  }

  then<TResult1 = unknown, TResult2 = never>(
    onfulfilled?:
      | ((value: { data: unknown; error: { message: string } | null }) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ) {
    return Promise.resolve(this.execute(false)).then(onfulfilled, onrejected);
  }

  private execute(single: boolean) {
    if (this.operation === "update") {
      return this.executeUpdate(single);
    }
    return this.executeSelect(single);
  }

  private executeSelect(single: boolean) {
    const rows = this.currentTableRows().filter((row) => this.matches(row));
    const selected = rows.map((row) => this.project(row));

    if (single) {
      if (selected.length !== 1) {
        return { data: null, error: { message: "Row not found" } };
      }
      return { data: selected[0], error: null };
    }

    return { data: selected, error: null };
  }

  private executeUpdate(single: boolean) {
    if (!this.updatePatch) {
      return { data: null, error: { message: "Missing update payload" } };
    }

    const isInvitationClaim =
      this.table === "invitations" &&
      this.updatePatch.used_by != null &&
      this.filters.some(
        (filter) =>
          filter.kind === "is" &&
          filter.column === "used_by" &&
          filter.value === null
      );

    if (isInvitationClaim && this.db.beforeInvitationClaim) {
      const hook = this.db.beforeInvitationClaim;
      this.db.beforeInvitationClaim = null;
      hook(this.db);
    }

    if (this.table === "profiles" && this.db.failProfileUpdate) {
      return { data: null, error: { message: "Simulated profile update failure" } };
    }

    const matchedRows = this.currentTableRows().filter((row) => this.matches(row));

    for (const row of matchedRows) {
      Object.assign(row, this.updatePatch);
    }

    if (!this.calledSelect && !single) {
      return { data: null, error: null };
    }

    const selected = matchedRows.map((row) => this.project(row));
    if (single) {
      if (selected.length !== 1) {
        return { data: null, error: { message: "No rows updated" } };
      }
      return { data: selected[0], error: null };
    }

    return { data: selected, error: null };
  }

  private currentTableRows() {
    return this.table === "profiles" ? this.db.profiles : this.db.invitations;
  }

  private matches(row: Record<string, unknown>) {
    return this.filters.every((filter) => {
      const rowValue = row[filter.column];
      if (filter.kind === "eq" || filter.kind === "is") {
        return rowValue === filter.value;
      }

      if (rowValue == null || typeof filter.value !== "string") {
        return false;
      }

      const rowTime = new Date(String(rowValue)).getTime();
      const filterTime = new Date(filter.value).getTime();
      return rowTime > filterTime;
    });
  }

  private project(row: Record<string, unknown>) {
    if (this.selectedColumns === "*") {
      return { ...row };
    }

    if (!this.selectedColumns.trim()) {
      return { ...row };
    }

    const projection: Record<string, unknown> = {};
    for (const column of this.selectedColumns.split(",").map((item) => item.trim())) {
      projection[column] = row[column];
    }
    return projection;
  }
}

class FakeAdminClient {
  constructor(private readonly db: FakeDb) {}

  from(table: string) {
    if (table !== "profiles" && table !== "invitations") {
      throw new Error(`Unsupported table in test client: ${table}`);
    }
    return new FakeQueryBuilder(this.db, table);
  }
}

const mockedCreateClient = vi.mocked(createClient);
const mockedCreateServiceClient = vi.mocked(createServiceClient);

function setupScenario({
  userId,
  profiles,
  invitations,
  failProfileUpdate = false,
  beforeInvitationClaim = null,
}: {
  userId: string;
  profiles: ProfileRow[];
  invitations: InvitationRow[];
  failProfileUpdate?: boolean;
  beforeInvitationClaim?: ((db: FakeDb) => void) | null;
}) {
  const db: FakeDb = {
    profiles: structuredClone(profiles),
    invitations: structuredClone(invitations),
    failProfileUpdate,
    beforeInvitationClaim,
  };

  mockedCreateClient.mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: userId } },
      }),
    },
  } as never);

  mockedCreateServiceClient.mockReturnValue(new FakeAdminClient(db) as never);

  return db;
}

function futureIso() {
  return new Date(Date.now() + 60_000).toISOString();
}

function pastIso() {
  return new Date(Date.now() - 60_000).toISOString();
}

describe("redeemInvitation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Case A: upgrades user already in the same community", async () => {
    const db = setupScenario({
      userId: "user-1",
      profiles: [
        { id: "user-1", community_id: "community-a", renown_tier: 1 },
      ],
      invitations: [
        {
          id: "invite-1",
          code: "ABCDEFGH",
          community_id: "community-a",
          used_by: null,
          expires_at: futureIso(),
        },
      ],
    });

    const result = await redeemInvitation("abcdefgh");

    expect(result.success).toBe(true);
    expect(db.invitations[0].used_by).toBe("user-1");
    expect(db.profiles[0].community_id).toBe("community-a");
    expect(db.profiles[0].renown_tier).toBe(2);
  });

  it("Case B: joins invitation community and upgrades when user has no community", async () => {
    const db = setupScenario({
      userId: "user-1",
      profiles: [{ id: "user-1", community_id: null, renown_tier: 1 }],
      invitations: [
        {
          id: "invite-1",
          code: "ABCDEFGH",
          community_id: "community-a",
          used_by: null,
          expires_at: futureIso(),
        },
      ],
    });

    const result = await redeemInvitation("ABCDEFGH");

    expect(result.success).toBe(true);
    expect(db.invitations[0].used_by).toBe("user-1");
    expect(db.profiles[0].community_id).toBe("community-a");
    expect(db.profiles[0].renown_tier).toBe(2);
  });

  it("Case C: rejects user from a different community and leaves invitation unused", async () => {
    const db = setupScenario({
      userId: "user-1",
      profiles: [
        { id: "user-1", community_id: "community-b", renown_tier: 1 },
      ],
      invitations: [
        {
          id: "invite-1",
          code: "ABCDEFGH",
          community_id: "community-a",
          used_by: null,
          expires_at: futureIso(),
        },
      ],
    });

    const result = await redeemInvitation("ABCDEFGH");

    expect(result.success).toBe(false);
    expect(result.error).toContain("different community");
    expect(db.invitations[0].used_by).toBeNull();
    expect(db.profiles[0].community_id).toBe("community-b");
    expect(db.profiles[0].renown_tier).toBe(1);
  });

  it("Case D: rejects already-used invitations", async () => {
    const db = setupScenario({
      userId: "user-1",
      profiles: [{ id: "user-1", community_id: null, renown_tier: 1 }],
      invitations: [
        {
          id: "invite-1",
          code: "ABCDEFGH",
          community_id: "community-a",
          used_by: "another-user",
          expires_at: futureIso(),
        },
      ],
    });

    const result = await redeemInvitation("ABCDEFGH");

    expect(result.success).toBe(false);
    expect(result.error).toBe("This invitation has already been used");
    expect(db.invitations[0].used_by).toBe("another-user");
  });

  it("Case E: rejects expired invitations", async () => {
    const db = setupScenario({
      userId: "user-1",
      profiles: [{ id: "user-1", community_id: null, renown_tier: 1 }],
      invitations: [
        {
          id: "invite-1",
          code: "ABCDEFGH",
          community_id: "community-a",
          used_by: null,
          expires_at: pastIso(),
        },
      ],
    });

    const result = await redeemInvitation("ABCDEFGH");

    expect(result.success).toBe(false);
    expect(result.error).toBe("This invitation has expired");
    expect(db.invitations[0].used_by).toBeNull();
  });

  it("Case F: fails claim when code is consumed concurrently (deterministic race simulation)", async () => {
    const db = setupScenario({
      userId: "user-1",
      profiles: [{ id: "user-1", community_id: null, renown_tier: 1 }],
      invitations: [
        {
          id: "invite-1",
          code: "ABCDEFGH",
          community_id: "community-a",
          used_by: null,
          expires_at: futureIso(),
        },
      ],
      beforeInvitationClaim: (state) => {
        state.invitations[0].used_by = "race-winner";
      },
    });

    const result = await redeemInvitation("ABCDEFGH");

    expect(result.success).toBe(false);
    expect(result.error).toBe("Failed to redeem invitation");
    expect(db.invitations[0].used_by).toBe("race-winner");
    expect(db.profiles[0].community_id).toBeNull();
    expect(db.profiles[0].renown_tier).toBe(1);
  });

  it("Case G: rolls invitation claim back when profile update fails", async () => {
    const db = setupScenario({
      userId: "user-1",
      profiles: [{ id: "user-1", community_id: null, renown_tier: 1 }],
      invitations: [
        {
          id: "invite-1",
          code: "ABCDEFGH",
          community_id: "community-a",
          used_by: null,
          expires_at: futureIso(),
        },
      ],
      failProfileUpdate: true,
    });

    const result = await redeemInvitation("ABCDEFGH");

    expect(result.success).toBe(false);
    expect(result.error).toContain("Failed to update profile");
    expect(db.invitations[0].used_by).toBeNull();
    expect(db.profiles[0].community_id).toBeNull();
    expect(db.profiles[0].renown_tier).toBe(1);
  });
});
