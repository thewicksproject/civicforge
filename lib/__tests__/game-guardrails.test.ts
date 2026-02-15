import { describe, it, expect } from "vitest";
import {
  GUARDRAILS,
  validateGameDesignGuardrails,
  validateVisibilityDefault,
  validateRecognitionSourceAmount,
} from "../game-config/guardrails";

describe("validateGameDesignGuardrails", () => {
  function sunsetFromNow(offsetMs: number): Date {
    return new Date(Date.now() + offsetMs);
  }

  const MS_PER_DAY = 24 * 60 * 60 * 1000;

  // Use a generous margin: "3 months" ≈ 92 days, "2 years" ≈ 730 days
  // The implementation uses setMonth / setFullYear, so we approximate with days.

  it("accepts sunset at exact 3-month minimum boundary", () => {
    // 93 days is safely past any 3-month boundary
    const sunset = sunsetFromNow(93 * MS_PER_DAY);
    const errors = validateGameDesignGuardrails({ sunsetAt: sunset });
    expect(errors.filter((e) => e.field === "sunsetAt")).toHaveLength(0);
  });

  it("rejects sunset 1 day before 3-month minimum", () => {
    // 85 days is safely before any 3-month boundary
    const sunset = sunsetFromNow(85 * MS_PER_DAY);
    const errors = validateGameDesignGuardrails({ sunsetAt: sunset });
    expect(errors.some((e) => e.field === "sunsetAt")).toBe(true);
  });

  it("accepts sunset at exact 2-year maximum boundary", () => {
    // Just under 2 years (729 days)
    const sunset = sunsetFromNow(729 * MS_PER_DAY);
    const errors = validateGameDesignGuardrails({ sunsetAt: sunset });
    expect(errors.filter((e) => e.field === "sunsetAt")).toHaveLength(0);
  });

  it("rejects sunset 1 day after 2-year maximum", () => {
    // 732 days is safely past any 2-year boundary
    const sunset = sunsetFromNow(732 * MS_PER_DAY);
    const errors = validateGameDesignGuardrails({ sunsetAt: sunset });
    expect(errors.some((e) => e.field === "sunsetAt")).toBe(true);
  });

  it("accepts sunset as ISO string", () => {
    const sunset = sunsetFromNow(180 * MS_PER_DAY);
    const errors = validateGameDesignGuardrails({ sunsetAt: sunset.toISOString() });
    expect(errors.filter((e) => e.field === "sunsetAt")).toHaveLength(0);
  });

  // Quest type count
  it("accepts quest type count at max (20)", () => {
    const sunset = sunsetFromNow(180 * MS_PER_DAY);
    const errors = validateGameDesignGuardrails({ sunsetAt: sunset, questTypeCount: 20 });
    expect(errors.filter((e) => e.field === "questTypes")).toHaveLength(0);
  });

  it("rejects quest type count above max (21)", () => {
    const sunset = sunsetFromNow(180 * MS_PER_DAY);
    const errors = validateGameDesignGuardrails({ sunsetAt: sunset, questTypeCount: 21 });
    expect(errors.some((e) => e.field === "questTypes")).toBe(true);
  });

  // Skill domain count
  it("accepts skill domain count at max (15)", () => {
    const sunset = sunsetFromNow(180 * MS_PER_DAY);
    const errors = validateGameDesignGuardrails({ sunsetAt: sunset, skillDomainCount: 15 });
    expect(errors.filter((e) => e.field === "skillDomains")).toHaveLength(0);
  });

  it("rejects skill domain count above max (16)", () => {
    const sunset = sunsetFromNow(180 * MS_PER_DAY);
    const errors = validateGameDesignGuardrails({ sunsetAt: sunset, skillDomainCount: 16 });
    expect(errors.some((e) => e.field === "skillDomains")).toBe(true);
  });

  // Recognition tier count
  it("accepts recognition tier count at min (2)", () => {
    const sunset = sunsetFromNow(180 * MS_PER_DAY);
    const errors = validateGameDesignGuardrails({ sunsetAt: sunset, recognitionTierCount: 2 });
    expect(errors.filter((e) => e.field === "recognitionTiers")).toHaveLength(0);
  });

  it("rejects recognition tier count below min (1)", () => {
    const sunset = sunsetFromNow(180 * MS_PER_DAY);
    const errors = validateGameDesignGuardrails({ sunsetAt: sunset, recognitionTierCount: 1 });
    expect(errors.some((e) => e.field === "recognitionTiers")).toBe(true);
  });

  it("accepts recognition tier count at max (7)", () => {
    const sunset = sunsetFromNow(180 * MS_PER_DAY);
    const errors = validateGameDesignGuardrails({ sunsetAt: sunset, recognitionTierCount: 7 });
    expect(errors.filter((e) => e.field === "recognitionTiers")).toHaveLength(0);
  });

  it("rejects recognition tier count above max (8)", () => {
    const sunset = sunsetFromNow(180 * MS_PER_DAY);
    const errors = validateGameDesignGuardrails({ sunsetAt: sunset, recognitionTierCount: 8 });
    expect(errors.some((e) => e.field === "recognitionTiers")).toBe(true);
  });

  it("returns all errors when multiple violations present", () => {
    const sunset = sunsetFromNow(1 * MS_PER_DAY); // too soon
    const errors = validateGameDesignGuardrails({
      sunsetAt: sunset,
      questTypeCount: 25,
      skillDomainCount: 20,
      recognitionTierCount: 0,
    });
    expect(errors.length).toBeGreaterThanOrEqual(4);
    const fields = errors.map((e) => e.field);
    expect(fields).toContain("sunsetAt");
    expect(fields).toContain("questTypes");
    expect(fields).toContain("skillDomains");
    expect(fields).toContain("recognitionTiers");
  });
});

describe("validateVisibilityDefault", () => {
  it('accepts "private"', () => {
    expect(validateVisibilityDefault("private")).toBe(true);
  });

  it('accepts "opt_in"', () => {
    expect(validateVisibilityDefault("opt_in")).toBe(true);
  });

  it('accepts "summary_only"', () => {
    expect(validateVisibilityDefault("summary_only")).toBe(true);
  });

  it('rejects "public"', () => {
    expect(validateVisibilityDefault("public")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(validateVisibilityDefault("")).toBe(false);
  });
});

describe("validateRecognitionSourceAmount", () => {
  it("accepts amount of 0", () => {
    const errors = validateRecognitionSourceAmount(0, null);
    expect(errors).toHaveLength(0);
  });

  it("accepts positive amount", () => {
    const errors = validateRecognitionSourceAmount(10, null);
    expect(errors).toHaveLength(0);
  });

  it("rejects negative amount", () => {
    const errors = validateRecognitionSourceAmount(-1, null);
    expect(errors.some((e) => e.field === "amount")).toBe(true);
  });

  it("accepts maxPerDay of null (unlimited)", () => {
    const errors = validateRecognitionSourceAmount(1, null);
    expect(errors.filter((e) => e.field === "maxPerDay")).toHaveLength(0);
  });

  it("accepts maxPerDay at cap (500)", () => {
    const errors = validateRecognitionSourceAmount(1, 500);
    expect(errors.filter((e) => e.field === "maxPerDay")).toHaveLength(0);
  });

  it("rejects maxPerDay above cap (501)", () => {
    const errors = validateRecognitionSourceAmount(1, 501);
    expect(errors.some((e) => e.field === "maxPerDay")).toBe(true);
  });
});

describe("anti-dystopia invariants", () => {
  it("ALLOWED_VISIBILITY_DEFAULTS never includes 'public'", () => {
    expect(
      (GUARDRAILS.ALLOWED_VISIBILITY_DEFAULTS as readonly string[]).includes("public"),
    ).toBe(false);
  });

  it("MAX_RECOGNITION_PER_DAY exists and is finite", () => {
    expect(GUARDRAILS.MAX_RECOGNITION_PER_DAY).toBeDefined();
    expect(Number.isFinite(GUARDRAILS.MAX_RECOGNITION_PER_DAY)).toBe(true);
  });
});
