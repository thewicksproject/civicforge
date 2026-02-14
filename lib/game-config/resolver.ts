/**
 * Game Config Resolver
 *
 * Central resolver: resolveGameConfig(communityId) → ResolvedGameConfig
 *
 * Looks up the active game_designs row for a community, joins to all child
 * tables, and returns a typed config object. Falls back to hardcoded Classic
 * constants if no game design exists (defensive).
 */

import { createServiceClient } from "@/lib/supabase/server";
import {
  QUEST_DIFFICULTY_TIERS,
  SKILL_DOMAINS,
  RENOWN_TIERS,
  type QuestDifficulty,
  type SkillDomain,
  type RenownTier,
} from "@/lib/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ResolvedQuestType {
  id: string;
  slug: string;
  label: string;
  description: string | null;
  validationMethod: string;
  validationThreshold: number;
  recognitionType: string;
  baseRecognition: number;
  narrativePrompt: string | null;
  cooldownHours: number;
  maxPartySize: number;
  sortOrder: number;
  color: string | null;
  icon: string | null;
}

export interface ResolvedSkillDomain {
  id: string;
  slug: string;
  label: string;
  description: string | null;
  examples: string[];
  color: string | null;
  icon: string | null;
  visibilityDefault: string;
  sortOrder: number;
}

export interface ResolvedRecognitionTier {
  id: string;
  tierNumber: number;
  name: string;
  thresholdType: string;
  thresholdValue: number;
  additionalRequirements: Record<string, unknown> | null;
  unlocks: string[];
  color: string | null;
}

export interface ResolvedRecognitionSource {
  id: string;
  sourceType: string;
  amount: number;
  maxPerDay: number | null;
}

export interface ResolvedGameConfig {
  gameDesignId: string;
  name: string;
  description: string | null;
  valueStatement: string;
  designRationale: string;
  version: number;
  sunsetAt: string;
  questTypes: ResolvedQuestType[];
  skillDomains: ResolvedSkillDomain[];
  recognitionTiers: ResolvedRecognitionTier[];
  recognitionSources: ResolvedRecognitionSource[];
  isClassicFallback: boolean;
}

// ---------------------------------------------------------------------------
// Classic fallback (built from hardcoded constants)
// ---------------------------------------------------------------------------

function buildClassicFallback(): ResolvedGameConfig {
  const questTypes: ResolvedQuestType[] = (
    Object.entries(QUEST_DIFFICULTY_TIERS) as [QuestDifficulty, (typeof QUEST_DIFFICULTY_TIERS)[QuestDifficulty]][]
  ).map(([slug, config], i) => ({
    id: `classic-qt-${slug}`,
    slug,
    label: config.label,
    description: config.description,
    validationMethod: config.validationMethod,
    validationThreshold: slug === "spark" ? 0 : slug === "ember" ? 1 : slug === "flame" ? 1 : slug === "blaze" ? 3 : 5,
    recognitionType: "xp",
    baseRecognition: config.baseXp,
    narrativePrompt: null,
    cooldownHours: 0,
    maxPartySize: slug === "blaze" || slug === "inferno" ? 5 : 1,
    sortOrder: i,
    color: null,
    icon: null,
  }));

  const skillDomains: ResolvedSkillDomain[] = (
    Object.entries(SKILL_DOMAINS) as [SkillDomain, (typeof SKILL_DOMAINS)[SkillDomain]][]
  ).map(([slug, config], i) => ({
    id: `classic-sd-${slug}`,
    slug,
    label: config.label,
    description: config.description,
    examples: config.examples,
    color: config.color,
    icon: config.icon,
    visibilityDefault: "private",
    sortOrder: i,
  }));

  const recognitionTiers: ResolvedRecognitionTier[] = (
    Object.entries(RENOWN_TIERS) as [string, (typeof RENOWN_TIERS)[RenownTier]][]
  ).map(([tier, config]) => ({
    id: `classic-rt-${tier}`,
    tierNumber: Number(tier),
    name: config.name,
    thresholdType: "points",
    thresholdValue: config.renownRequired,
    additionalRequirements: Number(tier) === 3 ? { vouches_required: 2 } : null,
    unlocks: [config.description],
    color: config.color,
  }));

  const recognitionSources: ResolvedRecognitionSource[] = [
    { id: "classic-rs-quest", sourceType: "quest_completion", amount: 1, maxPerDay: null },
    { id: "classic-rs-endorse-give", sourceType: "endorsement_given", amount: 0.5, maxPerDay: null },
    { id: "classic-rs-endorse-receive", sourceType: "endorsement_received", amount: 1, maxPerDay: null },
  ];

  const twoYearsFromNow = new Date();
  twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2);

  return {
    gameDesignId: "classic-fallback",
    name: "Classic CivicForge",
    description: "The original CivicForge coordination game with escalating trust and multidimensional growth.",
    valueStatement: "We believe communities grow through mutual aid, progressive trust, and the recognition that everyone has something valuable to contribute across many domains of life.",
    designRationale: "Five difficulty tiers create a natural progression from quick individual actions to ambitious community projects. Seven skill domains ensure no single path is valued above others. Five reputation tiers unlock increasing responsibility without ever punishing inactivity.",
    version: 1,
    sunsetAt: twoYearsFromNow.toISOString(),
    questTypes,
    skillDomains,
    recognitionTiers,
    recognitionSources,
    isClassicFallback: true,
  };
}

// Cache: communityId → config (cleared on game design changes)
const configCache = new Map<string, { config: ResolvedGameConfig; fetchedAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Resolve the active game configuration for a community.
 *
 * Looks up the active game_designs row, joins child tables, and returns a
 * typed config. Falls back to hardcoded Classic constants if no game design exists.
 */
export async function resolveGameConfig(
  communityId: string,
): Promise<ResolvedGameConfig> {
  // Check cache
  const cached = configCache.get(communityId);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.config;
  }

  const admin = createServiceClient();

  // Find the active game design for this community
  const { data: design } = await admin
    .from("game_designs")
    .select("*")
    .eq("community_id", communityId)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (!design) {
    // No game design exists — return Classic fallback
    const fallback = buildClassicFallback();
    configCache.set(communityId, { config: fallback, fetchedAt: Date.now() });
    return fallback;
  }

  // Fetch all child tables in parallel
  const [questTypesRes, skillDomainsRes, tiersRes, sourcesRes] = await Promise.all([
    admin
      .from("game_quest_types")
      .select("*")
      .eq("game_design_id", design.id)
      .order("sort_order"),
    admin
      .from("game_skill_domains")
      .select("*")
      .eq("game_design_id", design.id)
      .order("sort_order"),
    admin
      .from("game_recognition_tiers")
      .select("*")
      .eq("game_design_id", design.id)
      .order("tier_number"),
    admin
      .from("game_recognition_sources")
      .select("*")
      .eq("game_design_id", design.id),
  ]);

  const config: ResolvedGameConfig = {
    gameDesignId: design.id,
    name: design.name,
    description: design.description,
    valueStatement: design.value_statement,
    designRationale: design.design_rationale,
    version: design.version,
    sunsetAt: design.sunset_at,
    questTypes: (questTypesRes.data ?? []).map((qt) => ({
      id: qt.id,
      slug: qt.slug,
      label: qt.label,
      description: qt.description,
      validationMethod: qt.validation_method,
      validationThreshold: qt.validation_threshold,
      recognitionType: qt.recognition_type,
      baseRecognition: qt.base_recognition,
      narrativePrompt: qt.narrative_prompt,
      cooldownHours: qt.cooldown_hours,
      maxPartySize: qt.max_party_size,
      sortOrder: qt.sort_order,
      color: qt.color,
      icon: qt.icon,
    })),
    skillDomains: (skillDomainsRes.data ?? []).map((sd) => ({
      id: sd.id,
      slug: sd.slug,
      label: sd.label,
      description: sd.description,
      examples: sd.examples ?? [],
      color: sd.color,
      icon: sd.icon,
      visibilityDefault: sd.visibility_default,
      sortOrder: sd.sort_order,
    })),
    recognitionTiers: (tiersRes.data ?? []).map((rt) => ({
      id: rt.id,
      tierNumber: rt.tier_number,
      name: rt.name,
      thresholdType: rt.threshold_type,
      thresholdValue: rt.threshold_value,
      additionalRequirements: rt.additional_requirements as Record<string, unknown> | null,
      unlocks: rt.unlocks ?? [],
      color: rt.color,
    })),
    recognitionSources: (sourcesRes.data ?? []).map((rs) => ({
      id: rs.id,
      sourceType: rs.source_type,
      amount: rs.amount,
      maxPerDay: rs.max_per_day,
    })),
    isClassicFallback: false,
  };

  configCache.set(communityId, { config, fetchedAt: Date.now() });
  return config;
}

/** Invalidate the cache for a community (call after game design changes) */
export function invalidateGameConfig(communityId: string): void {
  configCache.delete(communityId);
}

/** Invalidate all cached game configs */
export function invalidateAllGameConfigs(): void {
  configCache.clear();
}
