/**
 * Template Seeder
 *
 * Takes a game_templates.config JSONB blob and creates child rows
 * (quest types, skill domains, recognition tiers, recognition sources)
 * for a new game design draft.
 *
 * Used by createFromTemplate() and forkActiveDesign().
 */

import { createServiceClient } from "@/lib/supabase/server";
import {
  QuestTypeSchema,
  SkillDomainSchema,
  RecognitionTierSchema,
  RecognitionSourceSchema,
} from "./schemas";

export interface TemplateConfig {
  quest_types: Array<{
    slug: string;
    label: string;
    description?: string | null;
    validation_method: string;
    validation_threshold: number;
    recognition_type?: string;
    base_recognition: number;
    narrative_prompt?: string | null;
    cooldown_hours?: number;
    max_party_size?: number;
  }>;
  skill_domains: Array<{
    slug: string;
    label: string;
    description?: string | null;
    examples?: string[];
    color?: string | null;
    icon?: string | null;
  }>;
  recognition_tiers: Array<{
    tier_number: number;
    name: string;
    threshold_type?: string;
    threshold_value: number;
    additional_requirements?: Record<string, unknown> | null;
    unlocks?: string[];
    color?: string | null;
  }>;
  recognition_sources: Array<{
    source_type: string;
    amount: number;
    max_per_day?: number | null;
  }>;
}

export interface SeedResult {
  questTypeCount: number;
  skillDomainCount: number;
  recognitionTierCount: number;
  recognitionSourceCount: number;
  errors: string[];
}

/**
 * Validate a template config blob against the Zod schemas.
 * Returns an array of error messages (empty = valid).
 */
export function validateTemplateConfig(config: TemplateConfig): string[] {
  const errors: string[] = [];

  for (const [i, qt] of config.quest_types.entries()) {
    const result = QuestTypeSchema.safeParse({
      slug: qt.slug,
      label: qt.label,
      description: qt.description ?? null,
      validationMethod: qt.validation_method,
      validationThreshold: qt.validation_threshold,
      recognitionType: qt.recognition_type ?? "xp",
      baseRecognition: qt.base_recognition,
      narrativePrompt: qt.narrative_prompt ?? null,
      cooldownHours: qt.cooldown_hours ?? 0,
      maxPartySize: qt.max_party_size ?? 1,
      sortOrder: i,
    });
    if (!result.success) {
      errors.push(`Quest type ${i} (${qt.slug}): ${result.error.issues[0].message}`);
    }
  }

  for (const [i, sd] of config.skill_domains.entries()) {
    const result = SkillDomainSchema.safeParse({
      slug: sd.slug,
      label: sd.label,
      description: sd.description ?? null,
      examples: sd.examples ?? [],
      color: sd.color ?? null,
      icon: sd.icon ?? null,
      visibilityDefault: "private",
      sortOrder: i,
    });
    if (!result.success) {
      errors.push(`Skill domain ${i} (${sd.slug}): ${result.error.issues[0].message}`);
    }
  }

  for (const [i, rt] of config.recognition_tiers.entries()) {
    const result = RecognitionTierSchema.safeParse({
      tierNumber: rt.tier_number,
      name: rt.name,
      thresholdType: rt.threshold_type ?? "points",
      thresholdValue: rt.threshold_value,
      additionalRequirements: rt.additional_requirements ?? null,
      unlocks: rt.unlocks ?? [],
      color: rt.color ?? null,
    });
    if (!result.success) {
      errors.push(`Recognition tier ${i} (${rt.name}): ${result.error.issues[0].message}`);
    }
  }

  for (const [i, rs] of config.recognition_sources.entries()) {
    const result = RecognitionSourceSchema.safeParse({
      sourceType: rs.source_type,
      amount: rs.amount,
      maxPerDay: rs.max_per_day ?? null,
    });
    if (!result.success) {
      errors.push(`Recognition source ${i}: ${result.error.issues[0].message}`);
    }
  }

  return errors;
}

/**
 * Seed child rows for a game design from a template config.
 * Assumes the game_design row already exists.
 */
export async function seedFromTemplate(
  gameDesignId: string,
  config: TemplateConfig,
): Promise<SeedResult> {
  const validationErrors = validateTemplateConfig(config);
  if (validationErrors.length > 0) {
    return {
      questTypeCount: 0,
      skillDomainCount: 0,
      recognitionTierCount: 0,
      recognitionSourceCount: 0,
      errors: validationErrors,
    };
  }

  const admin = createServiceClient();

  // Insert quest types
  const questTypeRows = config.quest_types.map((qt, i) => ({
    game_design_id: gameDesignId,
    slug: qt.slug,
    label: qt.label,
    description: qt.description ?? null,
    validation_method: qt.validation_method,
    validation_threshold: qt.validation_threshold,
    recognition_type: qt.recognition_type ?? "xp",
    base_recognition: qt.base_recognition,
    narrative_prompt: qt.narrative_prompt ?? null,
    cooldown_hours: qt.cooldown_hours ?? 0,
    max_party_size: qt.max_party_size ?? 1,
    sort_order: i,
    color: null as string | null,
    icon: null as string | null,
  }));

  const skillDomainRows = config.skill_domains.map((sd, i) => ({
    game_design_id: gameDesignId,
    slug: sd.slug,
    label: sd.label,
    description: sd.description ?? null,
    examples: sd.examples ?? [],
    color: sd.color ?? null,
    icon: sd.icon ?? null,
    visibility_default: "private" as const,
    sort_order: i,
  }));

  const tierRows = config.recognition_tiers.map((rt) => ({
    game_design_id: gameDesignId,
    tier_number: rt.tier_number,
    name: rt.name,
    threshold_type: rt.threshold_type ?? "points",
    threshold_value: rt.threshold_value,
    additional_requirements: rt.additional_requirements ?? null,
    unlocks: rt.unlocks ?? [],
    color: rt.color ?? null,
  }));

  const sourceRows = config.recognition_sources.map((rs) => ({
    game_design_id: gameDesignId,
    source_type: rs.source_type,
    amount: rs.amount,
    max_per_day: rs.max_per_day ?? null,
  }));

  const errors: string[] = [];

  const [qtRes, sdRes, rtRes, rsRes] = await Promise.all([
    admin.from("game_quest_types").insert(questTypeRows),
    admin.from("game_skill_domains").insert(skillDomainRows),
    admin.from("game_recognition_tiers").insert(tierRows),
    admin.from("game_recognition_sources").insert(sourceRows),
  ]);

  if (qtRes.error) errors.push(`Quest types: ${qtRes.error.message}`);
  if (sdRes.error) errors.push(`Skill domains: ${sdRes.error.message}`);
  if (rtRes.error) errors.push(`Recognition tiers: ${rtRes.error.message}`);
  if (rsRes.error) errors.push(`Recognition sources: ${rsRes.error.message}`);

  return {
    questTypeCount: qtRes.error ? 0 : questTypeRows.length,
    skillDomainCount: sdRes.error ? 0 : skillDomainRows.length,
    recognitionTierCount: rtRes.error ? 0 : tierRows.length,
    recognitionSourceCount: rsRes.error ? 0 : sourceRows.length,
    errors,
  };
}
