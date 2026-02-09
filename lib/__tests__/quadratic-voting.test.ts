import { describe, it, expect } from "vitest";

/**
 * Tests for quadratic voting math used in castVote (governance.ts).
 * Quadratic voting: N votes costs N^2 credits; vote weight = sqrt(credits).
 */

function quadraticWeight(creditsSpent: number): number {
  return Math.sqrt(creditsSpent);
}

describe("quadratic voting weight", () => {
  it("1 credit = 1 vote weight", () => {
    expect(quadraticWeight(1)).toBe(1);
  });

  it("4 credits = 2 vote weight", () => {
    expect(quadraticWeight(4)).toBe(2);
  });

  it("9 credits = 3 vote weight", () => {
    expect(quadraticWeight(9)).toBe(3);
  });

  it("16 credits = 4 vote weight", () => {
    expect(quadraticWeight(16)).toBe(4);
  });

  it("non-perfect-square credits produce fractional weight", () => {
    // 5 credits = sqrt(5) ≈ 2.236
    const weight = quadraticWeight(5);
    expect(weight).toBeCloseTo(2.236, 2);
  });

  it("diminishing returns: doubling credits less than doubles weight", () => {
    const weight10 = quadraticWeight(10);
    const weight20 = quadraticWeight(20);
    // 20/10 = 2x credits, but weight ratio = sqrt(20)/sqrt(10) = sqrt(2) ≈ 1.41x
    expect(weight20 / weight10).toBeCloseTo(Math.sqrt(2), 5);
    expect(weight20 / weight10).toBeLessThan(2);
  });

  it("prevents tyranny of wealthy: 100 credits only gets 10x weight of 1 credit", () => {
    const weight1 = quadraticWeight(1);
    const weight100 = quadraticWeight(100);
    expect(weight100 / weight1).toBe(10);
    // Not 100x — that's the whole point of quadratic voting
  });

  it("is always positive for positive input", () => {
    for (let credits = 1; credits <= 100; credits++) {
      expect(quadraticWeight(credits)).toBeGreaterThan(0);
    }
  });

  it("is monotonically increasing", () => {
    let prevWeight = 0;
    for (let credits = 1; credits <= 100; credits++) {
      const weight = quadraticWeight(credits);
      expect(weight).toBeGreaterThan(prevWeight);
      prevWeight = weight;
    }
  });
});

describe("vote tally with quadratic weighting", () => {
  it("tallies correctly with integer rounding", () => {
    // Simulates the rounding behavior from castVote
    const votes = [
      { credits: 1, inFavor: true },
      { credits: 4, inFavor: true },
      { credits: 9, inFavor: false },
    ];

    let votesFor = 0;
    let votesAgainst = 0;

    for (const v of votes) {
      const weight = Math.round(quadraticWeight(v.credits));
      if (v.inFavor) {
        votesFor += weight;
      } else {
        votesAgainst += weight;
      }
    }

    // 1 credit -> weight 1, 4 credits -> weight 2 (for); 9 credits -> weight 3 (against)
    expect(votesFor).toBe(3);
    expect(votesAgainst).toBe(3);
  });

  it("handles mixed credit amounts", () => {
    const credits = [1, 2, 3, 5, 10, 25];
    const weights = credits.map((c) => Math.round(quadraticWeight(c)));
    // All weights should be reasonable positive integers
    expect(weights).toEqual([1, 1, 2, 2, 3, 5]);
  });
});
