import { describe, it, expect } from "vitest";

/**
 * Pure logic tests for community matching and privacy tier display rules.
 * These test the logic patterns used in page guards and server actions.
 */

// Community matching logic (same pattern used across server actions)
function isCommunityMatch(
  userCommunityId: string | null,
  resourceCommunityId: string | null
): boolean {
  if (!userCommunityId || !resourceCommunityId) return false;
  return userCommunityId === resourceCommunityId;
}

// Privacy tier display logic (used in profile/[userId]/page.tsx)
type PrivacyTier = "ghost" | "quiet" | "open" | "mentor";

function getProfileVisibility(
  privacyTier: PrivacyTier,
  isOwnProfile: boolean
) {
  return {
    showBio:
      isOwnProfile || privacyTier === "open" || privacyTier === "mentor",
    showSkills:
      isOwnProfile || privacyTier === "open" || privacyTier === "mentor",
    showDomainSummary: isOwnProfile || privacyTier !== "ghost",
    showEndorsements:
      isOwnProfile || privacyTier === "open" || privacyTier === "mentor",
  };
}

describe("Community matching", () => {
  it("allows access when communities match", () => {
    expect(isCommunityMatch("n-1", "n-1")).toBe(true);
  });

  it("denies access when communities differ", () => {
    expect(isCommunityMatch("n-1", "n-2")).toBe(false);
  });

  it("denies access when user has no community", () => {
    expect(isCommunityMatch(null, "n-1")).toBe(false);
  });

  it("denies access when resource has no community", () => {
    expect(isCommunityMatch("n-1", null)).toBe(false);
  });

  it("denies access when both are null", () => {
    expect(isCommunityMatch(null, null)).toBe(false);
  });
});

describe("Privacy tier display rules", () => {
  describe("ghost tier (viewing other's profile)", () => {
    const vis = getProfileVisibility("ghost", false);

    it("hides bio", () => expect(vis.showBio).toBe(false));
    it("hides skills", () => expect(vis.showSkills).toBe(false));
    it("hides domain summary", () =>
      expect(vis.showDomainSummary).toBe(false));
    it("hides endorsements", () =>
      expect(vis.showEndorsements).toBe(false));
  });

  describe("quiet tier (viewing other's profile)", () => {
    const vis = getProfileVisibility("quiet", false);

    it("hides bio", () => expect(vis.showBio).toBe(false));
    it("hides skills", () => expect(vis.showSkills).toBe(false));
    it("shows domain summary", () =>
      expect(vis.showDomainSummary).toBe(true));
    it("hides endorsements", () =>
      expect(vis.showEndorsements).toBe(false));
  });

  describe("open tier (viewing other's profile)", () => {
    const vis = getProfileVisibility("open", false);

    it("shows bio", () => expect(vis.showBio).toBe(true));
    it("shows skills", () => expect(vis.showSkills).toBe(true));
    it("shows domain summary", () =>
      expect(vis.showDomainSummary).toBe(true));
    it("shows endorsements", () =>
      expect(vis.showEndorsements).toBe(true));
  });

  describe("mentor tier (viewing other's profile)", () => {
    const vis = getProfileVisibility("mentor", false);

    it("shows bio", () => expect(vis.showBio).toBe(true));
    it("shows skills", () => expect(vis.showSkills).toBe(true));
    it("shows domain summary", () =>
      expect(vis.showDomainSummary).toBe(true));
    it("shows endorsements", () =>
      expect(vis.showEndorsements).toBe(true));
  });

  describe("own profile (any tier)", () => {
    for (const tier of ["ghost", "quiet", "open", "mentor"] as const) {
      describe(`${tier} tier viewing own profile`, () => {
        const vis = getProfileVisibility(tier, true);

        it("shows bio", () => expect(vis.showBio).toBe(true));
        it("shows skills", () => expect(vis.showSkills).toBe(true));
        it("shows domain summary", () =>
          expect(vis.showDomainSummary).toBe(true));
        it("shows endorsements", () =>
          expect(vis.showEndorsements).toBe(true));
      });
    }
  });
});
