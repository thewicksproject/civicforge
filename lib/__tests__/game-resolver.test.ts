import { describe, it, expect, vi, beforeEach } from "vitest";
import { invalidateAllGameConfigs } from "../game-config/resolver";

// Mock createServiceClient before importing the module under test
vi.mock("@/lib/supabase/server", () => ({
  createServiceClient: vi.fn(() => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            limit: () => ({
              maybeSingle: () => Promise.resolve({ data: null, error: null }),
            }),
          }),
        }),
      }),
    }),
  })),
}));

describe("resolveGameConfig — Classic fallback", () => {
  beforeEach(() => {
    invalidateAllGameConfigs();
  });

  async function getConfig() {
    // Dynamic import so the mock is applied
    const { resolveGameConfig } = await import("../game-config/resolver");
    return resolveGameConfig("test-community-id");
  }

  it("returns isClassicFallback = true when no game design exists", async () => {
    const config = await getConfig();
    expect(config.isClassicFallback).toBe(true);
  });

  it("returns 5 quest types (spark → inferno)", async () => {
    const config = await getConfig();
    expect(config.questTypes).toHaveLength(5);
    const slugs = config.questTypes.map((qt) => qt.slug);
    expect(slugs).toEqual(["spark", "ember", "flame", "blaze", "inferno"]);
  });

  it("returns correct base XP values", async () => {
    const config = await getConfig();
    const xpBySlug = Object.fromEntries(
      config.questTypes.map((qt) => [qt.slug, qt.baseRecognition]),
    );
    expect(xpBySlug).toEqual({
      spark: 5,
      ember: 15,
      flame: 35,
      blaze: 75,
      inferno: 150,
    });
  });

  it("returns 7 skill domains, all with visibilityDefault 'private'", async () => {
    const config = await getConfig();
    expect(config.skillDomains).toHaveLength(7);
    for (const domain of config.skillDomains) {
      expect(domain.visibilityDefault).toBe("private");
    }
  });

  it("returns 5 recognition tiers with correct thresholds", async () => {
    const config = await getConfig();
    expect(config.recognitionTiers).toHaveLength(5);
    const thresholds = config.recognitionTiers.map((rt) => rt.thresholdValue);
    expect(thresholds).toEqual([0, 0, 50, 200, 500]);
  });

  it("returns 3 recognition sources", async () => {
    const config = await getConfig();
    expect(config.recognitionSources).toHaveLength(3);
    const types = config.recognitionSources.map((rs) => rs.sourceType);
    expect(types).toContain("quest_completion");
    expect(types).toContain("endorsement_given");
    expect(types).toContain("endorsement_received");
  });

  it("has sunsetAt approximately 2 years from now", async () => {
    const config = await getConfig();
    const sunset = new Date(config.sunsetAt);
    const now = new Date();
    const diffMs = sunset.getTime() - now.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    // Should be roughly 730 days (2 years), allow ±5 days margin
    expect(diffDays).toBeGreaterThan(725);
    expect(diffDays).toBeLessThan(735);
  });

  it("has name 'Classic CivicForge'", async () => {
    const config = await getConfig();
    expect(config.name).toBe("Classic CivicForge");
  });
});
