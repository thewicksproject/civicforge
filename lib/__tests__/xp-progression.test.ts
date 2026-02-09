import { describe, it, expect } from "vitest";
import { xpForLevel, levelFromXp, SKILL_XP_BASE } from "../types";

describe("xpForLevel", () => {
  it("returns correct XP for level 0", () => {
    // BASE * ln(0 + 2) = 100 * ln(2) ≈ 69
    expect(xpForLevel(0)).toBe(Math.round(SKILL_XP_BASE * Math.log(2)));
  });

  it("returns correct XP for level 1", () => {
    // BASE * ln(1 + 2) = 100 * ln(3) ≈ 110
    expect(xpForLevel(1)).toBe(Math.round(SKILL_XP_BASE * Math.log(3)));
  });

  it("increases with level (logarithmic growth)", () => {
    const level0 = xpForLevel(0);
    const level1 = xpForLevel(1);
    const level5 = xpForLevel(5);
    const level10 = xpForLevel(10);

    expect(level1).toBeGreaterThan(level0);
    expect(level5).toBeGreaterThan(level1);
    expect(level10).toBeGreaterThan(level5);
  });

  it("grows logarithmically (diminishing increments)", () => {
    const diff01 = xpForLevel(1) - xpForLevel(0);
    const diff910 = xpForLevel(10) - xpForLevel(9);
    // Logarithmic growth means later increments are smaller
    expect(diff01).toBeGreaterThan(diff910);
  });

  it("never returns negative or zero", () => {
    for (let i = 0; i < 50; i++) {
      expect(xpForLevel(i)).toBeGreaterThan(0);
    }
  });
});

describe("levelFromXp", () => {
  it("returns 0 for 0 XP", () => {
    expect(levelFromXp(0)).toBe(0);
  });

  it("returns 0 for XP below level 0 threshold", () => {
    expect(levelFromXp(xpForLevel(0) - 1)).toBe(0);
  });

  it("returns 1 when exactly enough XP for level 1", () => {
    const xpNeeded = xpForLevel(0); // XP needed to pass level 0 -> level 1
    expect(levelFromXp(xpNeeded)).toBe(1);
  });

  it("returns correct level for accumulated XP", () => {
    // Accumulate XP for levels 0, 1, 2
    const totalXp = xpForLevel(0) + xpForLevel(1) + xpForLevel(2);
    expect(levelFromXp(totalXp)).toBe(3);
  });

  it("handles large XP values", () => {
    // Very high XP should produce a reasonable level
    const level = levelFromXp(10000);
    expect(level).toBeGreaterThan(0);
    expect(level).toBeLessThan(100); // Sanity check
  });

  it("is monotonically increasing", () => {
    let prevLevel = 0;
    for (let xp = 0; xp <= 5000; xp += 50) {
      const level = levelFromXp(xp);
      expect(level).toBeGreaterThanOrEqual(prevLevel);
      prevLevel = level;
    }
  });

  it("round-trips: levelFromXp(sum of xpForLevel(0..n-1)) = n", () => {
    for (let targetLevel = 0; targetLevel <= 10; targetLevel++) {
      let totalXp = 0;
      for (let i = 0; i < targetLevel; i++) {
        totalXp += xpForLevel(i);
      }
      expect(levelFromXp(totalXp)).toBe(targetLevel);
    }
  });
});
