import { describe, it, expect } from "vitest";
import {
  isSameCommunity,
  canModerateCommunityResource,
} from "../security/authorization";

describe("isSameCommunity", () => {
  it("returns true when both community IDs match", () => {
    expect(isSameCommunity("community-a", "community-a")).toBe(true);
  });

  it("returns false when community IDs differ", () => {
    expect(isSameCommunity("community-a", "community-b")).toBe(false);
  });

  it("returns false when actor community is missing", () => {
    expect(isSameCommunity(null, "community-a")).toBe(false);
  });

  it("returns false when resource community is missing", () => {
    expect(isSameCommunity("community-a", undefined)).toBe(false);
  });
});

describe("canModerateCommunityResource", () => {
  it("allows Tier 3 moderator in same community", () => {
    expect(
      canModerateCommunityResource({
        renownTier: 3,
        moderatorCommunityId: "community-a",
        resourceCommunityId: "community-a",
      })
    ).toBe(true);
  });

  it("denies Tier 3 moderator across communities", () => {
    expect(
      canModerateCommunityResource({
        renownTier: 3,
        moderatorCommunityId: "community-a",
        resourceCommunityId: "community-b",
      })
    ).toBe(false);
  });

  it("denies Tier 2 user even in same community", () => {
    expect(
      canModerateCommunityResource({
        renownTier: 2,
        moderatorCommunityId: "community-a",
        resourceCommunityId: "community-a",
      })
    ).toBe(false);
  });

  it("denies when moderator has no community", () => {
    expect(
      canModerateCommunityResource({
        renownTier: 4,
        moderatorCommunityId: null,
        resourceCommunityId: "community-a",
      })
    ).toBe(false);
  });
});
