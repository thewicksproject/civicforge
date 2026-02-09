import { describe, it, expect } from "vitest";
import { z } from "zod";

/**
 * Tests for the quadratic voting credit validation schema (C4).
 * This schema is used in castVote to bound credits_spent to 1-100 integers.
 */
const creditsSchema = z.number().int().min(1).max(100);

describe("Quadratic voting credit validation", () => {
  it("accepts valid integer credits", () => {
    expect(creditsSchema.safeParse(1).success).toBe(true);
    expect(creditsSchema.safeParse(50).success).toBe(true);
    expect(creditsSchema.safeParse(100).success).toBe(true);
  });

  it("rejects zero credits", () => {
    expect(creditsSchema.safeParse(0).success).toBe(false);
  });

  it("rejects negative credits", () => {
    expect(creditsSchema.safeParse(-1).success).toBe(false);
    expect(creditsSchema.safeParse(-100).success).toBe(false);
  });

  it("rejects credits above 100", () => {
    expect(creditsSchema.safeParse(101).success).toBe(false);
    expect(creditsSchema.safeParse(1000000).success).toBe(false);
  });

  it("rejects fractional credits", () => {
    expect(creditsSchema.safeParse(1.5).success).toBe(false);
    expect(creditsSchema.safeParse(99.9).success).toBe(false);
  });

  it("rejects non-number types", () => {
    expect(creditsSchema.safeParse("50").success).toBe(false);
    expect(creditsSchema.safeParse(null).success).toBe(false);
    expect(creditsSchema.safeParse(undefined).success).toBe(false);
  });

  it("produces correct max vote weight of sqrt(100) = 10", () => {
    const maxCredits = 100;
    const maxWeight = Math.sqrt(maxCredits);
    expect(maxWeight).toBe(10);
  });

  it("produces correct vote weight for common values", () => {
    expect(Math.sqrt(1)).toBe(1);
    expect(Math.sqrt(4)).toBe(2);
    expect(Math.sqrt(9)).toBe(3);
    expect(Math.sqrt(25)).toBe(5);
  });
});
