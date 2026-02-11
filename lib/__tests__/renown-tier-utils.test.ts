import { describe, expect, it } from "vitest";
import { getRenownTierName, toRenownTier } from "@/lib/types";

describe("renown tier utilities", () => {
  it("normalizes unknown values to tier 1", () => {
    expect(toRenownTier(undefined)).toBe(1);
    expect(toRenownTier(null)).toBe(1);
    expect(toRenownTier(0)).toBe(1);
    expect(toRenownTier(6)).toBe(1);
  });

  it("keeps valid tiers 1-5", () => {
    expect(toRenownTier(1)).toBe(1);
    expect(toRenownTier(2)).toBe(2);
    expect(toRenownTier(3)).toBe(3);
    expect(toRenownTier(4)).toBe(4);
    expect(toRenownTier(5)).toBe(5);
  });

  it("returns 5-tier names for normalized values", () => {
    expect(getRenownTierName(1)).toBe("Newcomer");
    expect(getRenownTierName(4)).toBe("Keeper");
    expect(getRenownTierName(5)).toBe("Founder");
    expect(getRenownTierName(999)).toBe("Newcomer");
  });
});
