import { describe, expect, it } from "vitest";
import {
  CATEGORY_TO_DOMAIN,
  POST_CATEGORIES,
  SKILL_DOMAINS,
  QUEST_DIFFICULTY_TIERS,
  RENOWN_TIERS,
  type SkillDomain,
  type QuestDifficulty,
  type RenownTier,
} from "@/lib/types";

describe("CATEGORY_TO_DOMAIN", () => {
  it("maps every POST_CATEGORIES value to a domain array", () => {
    for (const category of POST_CATEGORIES) {
      expect(CATEGORY_TO_DOMAIN).toHaveProperty(category.value);
      expect(CATEGORY_TO_DOMAIN[category.value].length).toBeGreaterThan(0);
    }
  });

  it("only maps to valid SKILL_DOMAINS keys", () => {
    const validDomains = Object.keys(SKILL_DOMAINS);
    for (const domains of Object.values(CATEGORY_TO_DOMAIN)) {
      for (const domain of domains) {
        expect(validDomains).toContain(domain);
      }
    }
  });
});

describe("SKILL_DOMAINS", () => {
  it("has exactly 7 domains", () => {
    expect(Object.keys(SKILL_DOMAINS)).toHaveLength(7);
  });

  it("contains all expected domain keys", () => {
    const expected: SkillDomain[] = ["craft", "green", "care", "bridge", "signal", "hearth", "weave"];
    for (const domain of expected) {
      expect(SKILL_DOMAINS).toHaveProperty(domain);
    }
  });

  it("each domain has required config properties", () => {
    for (const config of Object.values(SKILL_DOMAINS)) {
      expect(config).toHaveProperty("label");
      expect(config).toHaveProperty("description");
      expect(config).toHaveProperty("examples");
      expect(config).toHaveProperty("color");
      expect(config).toHaveProperty("icon");
      expect(config.examples.length).toBeGreaterThan(0);
    }
  });
});

describe("QUEST_DIFFICULTY_TIERS", () => {
  const difficulties: QuestDifficulty[] = ["spark", "ember", "flame", "blaze", "inferno"];

  it("has 5 tiers", () => {
    expect(Object.keys(QUEST_DIFFICULTY_TIERS)).toHaveLength(5);
  });

  it("has monotonically increasing baseXp", () => {
    let prevXp = 0;
    for (const difficulty of difficulties) {
      const xp = QUEST_DIFFICULTY_TIERS[difficulty].baseXp;
      expect(xp).toBeGreaterThan(prevXp);
      prevXp = xp;
    }
  });

  it("has monotonically increasing tier numbers", () => {
    let prevTier = 0;
    for (const difficulty of difficulties) {
      const tier = QUEST_DIFFICULTY_TIERS[difficulty].tier;
      expect(tier).toBeGreaterThan(prevTier);
      prevTier = tier;
    }
  });

  it("each tier has a validation method", () => {
    for (const config of Object.values(QUEST_DIFFICULTY_TIERS)) {
      expect(config.validationMethod).toBeTruthy();
    }
  });
});

describe("RENOWN_TIERS", () => {
  const tiers: RenownTier[] = [1, 2, 3, 4, 5];

  it("has 5 tiers", () => {
    expect(Object.keys(RENOWN_TIERS)).toHaveLength(5);
  });

  it("has monotonically non-decreasing renownRequired", () => {
    let prevRequired = -1;
    for (const tier of tiers) {
      const required = RENOWN_TIERS[tier].renownRequired;
      expect(required).toBeGreaterThanOrEqual(prevRequired);
      prevRequired = required;
    }
  });

  it("no tier has negative renownRequired (anti-dystopia)", () => {
    for (const tier of tiers) {
      expect(RENOWN_TIERS[tier].renownRequired).toBeGreaterThanOrEqual(0);
    }
  });

  it("each tier has a name and description", () => {
    for (const tier of tiers) {
      expect(RENOWN_TIERS[tier].name).toBeTruthy();
      expect(RENOWN_TIERS[tier].description).toBeTruthy();
    }
  });
});
