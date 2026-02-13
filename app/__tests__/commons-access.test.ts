import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createServiceClient: vi.fn(),
}));

import { getCommonsData } from "@/app/actions/commons";
import { createServiceClient } from "@/lib/supabase/server";

const mockedCreateServiceClient = vi.mocked(createServiceClient);

function profileLookupClient(communityId: string | null) {
  const from = vi.fn((table: string) => {
    if (table !== "profiles") {
      throw new Error(`Unexpected table access in scoped test: ${table}`);
    }
    const query = {
      eq: vi.fn(() => query),
      single: vi.fn(async () => ({ data: { community_id: communityId }, error: null })),
    };
    return {
      select: vi.fn(() => query),
    };
  });
  return { from };
}

describe("commons access scoping", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns fully suppressed data when viewer has no community", async () => {
    mockedCreateServiceClient.mockReturnValue(profileLookupClient(null) as never);

    const data = await getCommonsData("viewer-1");
    expect(data.community).toBeNull();
    expect(data.communities).toEqual([]);
    expect(data.domainDistribution).toEqual([]);
    expect(data.privacy.smallGroupSuppressed).toBe(true);
  });

  it("returns empty scoped data for cross-community requests", async () => {
    const client = profileLookupClient("community-1");
    mockedCreateServiceClient.mockReturnValue(client as never);

    const data = await getCommonsData("viewer-2", "community-2");
    expect(data.community).toBeNull();
    expect(data.communities).toEqual([]);
    expect(data.governanceMetrics.totalProposals).toBe(0);
    expect(client.from).toHaveBeenCalledTimes(1);
  });
});
