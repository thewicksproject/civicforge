import { describe, it, expect } from "vitest";
import {
  QuestTypeSchema,
  SkillDomainSchema,
  RecognitionTierSchema,
  RecognitionSourceSchema,
  GameDesignDraftSchema,
} from "../game-config/schemas";

describe("QuestTypeSchema", () => {
  const valid = {
    slug: "spark",
    label: "Spark",
    validationMethod: "self_report" as const,
    validationThreshold: 0,
    baseRecognition: 5,
    sortOrder: 0,
  };

  it("accepts valid quest type", () => {
    expect(QuestTypeSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects empty slug", () => {
    expect(QuestTypeSchema.safeParse({ ...valid, slug: "" }).success).toBe(false);
  });

  it("rejects invalid slug format", () => {
    expect(QuestTypeSchema.safeParse({ ...valid, slug: "Has Spaces" }).success).toBe(false);
  });

  it("rejects negative cooldown hours", () => {
    expect(QuestTypeSchema.safeParse({ ...valid, cooldownHours: -1 }).success).toBe(false);
  });

  it("rejects party size > 10", () => {
    expect(QuestTypeSchema.safeParse({ ...valid, maxPartySize: 11 }).success).toBe(false);
  });

  it("rejects party size < 1", () => {
    expect(QuestTypeSchema.safeParse({ ...valid, maxPartySize: 0 }).success).toBe(false);
  });

  it("accepts all valid recognition types", () => {
    for (const type of ["xp", "narrative", "badge", "endorsement_prompt", "none"]) {
      expect(QuestTypeSchema.safeParse({ ...valid, recognitionType: type }).success).toBe(true);
    }
  });
});

describe("SkillDomainSchema", () => {
  const valid = {
    slug: "craft",
    label: "Craft",
    visibilityDefault: "private" as const,
    sortOrder: 0,
  };

  it("accepts valid skill domain", () => {
    expect(SkillDomainSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects 'public' visibility (anti-dystopia guardrail)", () => {
    expect(SkillDomainSchema.safeParse({ ...valid, visibilityDefault: "public" }).success).toBe(false);
  });

  it("accepts 'opt_in' visibility", () => {
    expect(SkillDomainSchema.safeParse({ ...valid, visibilityDefault: "opt_in" }).success).toBe(true);
  });

  it("accepts 'summary_only' visibility", () => {
    expect(SkillDomainSchema.safeParse({ ...valid, visibilityDefault: "summary_only" }).success).toBe(true);
  });

  it("accepts examples array", () => {
    expect(
      SkillDomainSchema.safeParse({ ...valid, examples: ["Cooking", "Baking"] }).success,
    ).toBe(true);
  });

  it("rejects > 10 examples", () => {
    const examples = Array.from({ length: 11 }, (_, i) => `Example ${i}`);
    expect(SkillDomainSchema.safeParse({ ...valid, examples }).success).toBe(false);
  });
});

describe("RecognitionTierSchema", () => {
  const valid = {
    tierNumber: 1,
    name: "Newcomer",
    thresholdValue: 0,
  };

  it("accepts valid tier", () => {
    expect(RecognitionTierSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects tier number 0", () => {
    expect(RecognitionTierSchema.safeParse({ ...valid, tierNumber: 0 }).success).toBe(false);
  });

  it("rejects tier number > MAX_RECOGNITION_TIERS (7)", () => {
    expect(RecognitionTierSchema.safeParse({ ...valid, tierNumber: 8 }).success).toBe(false);
  });

  it("rejects empty name", () => {
    expect(RecognitionTierSchema.safeParse({ ...valid, name: "" }).success).toBe(false);
  });

  it("accepts additionalRequirements", () => {
    expect(
      RecognitionTierSchema.safeParse({
        ...valid,
        additionalRequirements: { vouches_required: 2 },
      }).success,
    ).toBe(true);
  });
});

describe("RecognitionSourceSchema", () => {
  it("accepts valid source", () => {
    const result = RecognitionSourceSchema.safeParse({
      sourceType: "quest_completion",
      amount: 1,
      maxPerDay: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative amount", () => {
    const result = RecognitionSourceSchema.safeParse({
      sourceType: "quest_completion",
      amount: -1,
      maxPerDay: null,
    });
    expect(result.success).toBe(false);
  });

  it("rejects maxPerDay above guardrail (500)", () => {
    const result = RecognitionSourceSchema.safeParse({
      sourceType: "quest_completion",
      amount: 1,
      maxPerDay: 501,
    });
    expect(result.success).toBe(false);
  });

  it("accepts maxPerDay at guardrail (500)", () => {
    const result = RecognitionSourceSchema.safeParse({
      sourceType: "quest_completion",
      amount: 1,
      maxPerDay: 500,
    });
    expect(result.success).toBe(true);
  });

  it("accepts all valid source types", () => {
    for (const type of ["quest_completion", "endorsement_given", "endorsement_received", "mentoring"]) {
      expect(
        RecognitionSourceSchema.safeParse({ sourceType: type, amount: 1 }).success,
      ).toBe(true);
    }
  });
});

describe("GameDesignDraftSchema", () => {
  const valid = {
    name: "Test Design",
    valueStatement: "A meaningful value statement for testing.",
    designRationale: "We chose these rules because testing is important.",
    sunsetAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  };

  it("accepts valid draft", () => {
    expect(GameDesignDraftSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects name < 3 chars", () => {
    expect(GameDesignDraftSchema.safeParse({ ...valid, name: "AB" }).success).toBe(false);
  });

  it("rejects value statement < 10 chars", () => {
    expect(GameDesignDraftSchema.safeParse({ ...valid, valueStatement: "Short" }).success).toBe(false);
  });

  it("rejects invalid ISO date", () => {
    expect(GameDesignDraftSchema.safeParse({ ...valid, sunsetAt: "not-a-date" }).success).toBe(false);
  });
});
