/**
 * Platform guardrails for game designs.
 * These are immutable — no community game design can override them.
 * Enforced at both database (CHECK constraints) and server action (validation) layers.
 */

export const GUARDRAILS = {
  // Max limits to prevent complexity explosion
  MAX_QUEST_TYPES: 20,
  MAX_SKILL_DOMAINS: 15,
  MAX_RECOGNITION_TIERS: 7,
  MIN_RECOGNITION_TIERS: 2,

  // Sunset enforcement
  MAX_SUNSET_YEARS: 2,
  MIN_SUNSET_MONTHS: 3,

  // Anti-farming
  MIN_COOLDOWN_HOURS: 0, // 0 is allowed; communities set their own
  MAX_RECOGNITION_PER_DAY: 500, // hard cap on daily recognition points

  // Privacy: skills are never fully public
  ALLOWED_VISIBILITY_DEFAULTS: ["private", "opt_in", "summary_only"] as const,

  // Recognition can never be decremented by others
  // (enforced in server actions, not configurable)
} as const;

export interface GameDesignValidationError {
  field: string;
  message: string;
}

export function validateGameDesignGuardrails(design: {
  sunsetAt: Date | string;
  questTypeCount?: number;
  skillDomainCount?: number;
  recognitionTierCount?: number;
}): GameDesignValidationError[] {
  const errors: GameDesignValidationError[] = [];

  // Sunset enforcement
  const sunsetDate = typeof design.sunsetAt === "string"
    ? new Date(design.sunsetAt)
    : design.sunsetAt;
  const now = new Date();

  const minSunset = new Date(now);
  minSunset.setMonth(minSunset.getMonth() + GUARDRAILS.MIN_SUNSET_MONTHS);

  const maxSunset = new Date(now);
  maxSunset.setFullYear(maxSunset.getFullYear() + GUARDRAILS.MAX_SUNSET_YEARS);

  if (sunsetDate < minSunset) {
    errors.push({
      field: "sunsetAt",
      message: `Game design must last at least ${GUARDRAILS.MIN_SUNSET_MONTHS} months`,
    });
  }

  if (sunsetDate > maxSunset) {
    errors.push({
      field: "sunsetAt",
      message: `Game design cannot exceed ${GUARDRAILS.MAX_SUNSET_YEARS} years`,
    });
  }

  // Count limits
  if (design.questTypeCount !== undefined) {
    if (design.questTypeCount > GUARDRAILS.MAX_QUEST_TYPES) {
      errors.push({
        field: "questTypes",
        message: `Maximum ${GUARDRAILS.MAX_QUEST_TYPES} quest types allowed`,
      });
    }
  }

  if (design.skillDomainCount !== undefined) {
    if (design.skillDomainCount > GUARDRAILS.MAX_SKILL_DOMAINS) {
      errors.push({
        field: "skillDomains",
        message: `Maximum ${GUARDRAILS.MAX_SKILL_DOMAINS} skill domains allowed`,
      });
    }
  }

  if (design.recognitionTierCount !== undefined) {
    if (design.recognitionTierCount < GUARDRAILS.MIN_RECOGNITION_TIERS) {
      errors.push({
        field: "recognitionTiers",
        message: `At least ${GUARDRAILS.MIN_RECOGNITION_TIERS} recognition tiers required`,
      });
    }
    if (design.recognitionTierCount > GUARDRAILS.MAX_RECOGNITION_TIERS) {
      errors.push({
        field: "recognitionTiers",
        message: `Maximum ${GUARDRAILS.MAX_RECOGNITION_TIERS} recognition tiers allowed`,
      });
    }
  }

  return errors;
}

export function validateVisibilityDefault(
  visibility: string,
): boolean {
  return (GUARDRAILS.ALLOWED_VISIBILITY_DEFAULTS as readonly string[]).includes(
    visibility,
  );
}

export function validateRecognitionSourceAmount(
  amount: number,
  maxPerDay: number | null,
): GameDesignValidationError[] {
  const errors: GameDesignValidationError[] = [];

  if (amount < 0) {
    errors.push({
      field: "amount",
      message: "Recognition amount cannot be negative",
    });
  }

  if (maxPerDay !== null && maxPerDay > GUARDRAILS.MAX_RECOGNITION_PER_DAY) {
    errors.push({
      field: "maxPerDay",
      message: `Daily recognition cap cannot exceed ${GUARDRAILS.MAX_RECOGNITION_PER_DAY}`,
    });
  }

  return errors;
}
