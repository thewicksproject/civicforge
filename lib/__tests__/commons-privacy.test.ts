import { describe, expect, it } from "vitest";
import {
  getCommonsPrivacyFlags,
  sanitizeCommunityGrowthSeries,
  suppressCount,
} from "@/lib/commons/privacy";

describe("commons privacy helpers", () => {
  it("suppresses counts below k-threshold", () => {
    expect(suppressCount(0)).toBe(0);
    expect(suppressCount(1)).toBe(0);
    expect(suppressCount(2)).toBe(0);
    expect(suppressCount(3)).toBe(3);
    expect(suppressCount(7)).toBe(7);
  });

  it("computes privacy flags from community member counts", () => {
    expect(getCommonsPrivacyFlags(null)).toEqual({
      growthHidden: false,
      smallGroupSuppressed: false,
    });

    expect(getCommonsPrivacyFlags(2)).toEqual({
      growthHidden: true,
      smallGroupSuppressed: true,
    });

    expect(getCommonsPrivacyFlags(5)).toEqual({
      growthHidden: true,
      smallGroupSuppressed: false,
    });

    expect(getCommonsPrivacyFlags(12)).toEqual({
      growthHidden: false,
      smallGroupSuppressed: false,
    });
  });

  it("sanitizes growth series with suppressed weekly values and safe cumulative totals", () => {
    const sanitized = sanitizeCommunityGrowthSeries([
      { week: "2026-01-05", value: 1, secondary: 1 },
      { week: "2026-01-12", value: 3, secondary: 4 },
      { week: "2026-01-19", value: 2, secondary: 6 },
      { week: "2026-01-26", value: 5, secondary: 11 },
    ]);

    expect(sanitized).toEqual([
      { week: "2026-01-05", value: 0, secondary: 0 },
      { week: "2026-01-12", value: 3, secondary: 3 },
      { week: "2026-01-19", value: 0, secondary: 3 },
      { week: "2026-01-26", value: 5, secondary: 8 },
    ]);
  });
});
