export type PostType = "need" | "offer";
export type PostStatus = "active" | "in_progress" | "completed" | "expired";
export type UrgencyLevel = "low" | "medium" | "high";
export type ResponseStatus = "pending" | "accepted" | "declined";
export type MembershipStatus = "pending" | "approved" | "denied";
export type DeletionStatus = "pending" | "processing" | "completed";
export type ReviewStatus = "none" | "pending_review" | "approved" | "rejected";

export type ConsentType =
  | "terms_of_service"
  | "privacy_policy"
  | "ai_processing"
  | "phone_verification";

// ---------------------------------------------------------------------------
// V2 Legacy Renown Tiers (backward-compatible)
// ---------------------------------------------------------------------------

export type RenownLegacyTier = 1 | 2 | 3;

export const RENOWN_TIER_LABELS: Record<RenownLegacyTier, string> = {
  1: "Neighbor",
  2: "Confirmed",
  3: "Verified",
};

// ---------------------------------------------------------------------------
// Ascendant: Renown Tiers (5-tier system)
// ---------------------------------------------------------------------------

export type RenownTier = 1 | 2 | 3 | 4 | 5;

export interface RenownTierConfig {
  name: string;
  description: string;
  renownRequired: number;
  color: string;
}

export const RENOWN_TIERS: Record<RenownTier, RenownTierConfig> = {
  1: {
    name: "Newcomer",
    description: "Browse, post needs, respond, receive help",
    renownRequired: 0,
    color: "muted-foreground",
  },
  2: {
    name: "Neighbor",
    description: "Post offers, create quests, join parties, earn skill XP",
    renownRequired: 0,
    color: "offer",
  },
  3: {
    name: "Pillar",
    description: "Create guilds, moderate, propose seasonal quests",
    renownRequired: 50,
    color: "golden-hour",
  },
  4: {
    name: "Keeper",
    description: "Governance council, propose rule changes, mentor",
    renownRequired: 200,
    color: "horizon",
  },
  5: {
    name: "Founder",
    description: "Cross-neighborhood coordination, system governance",
    renownRequired: 500,
    color: "need",
  },
};

// ---------------------------------------------------------------------------
// Ascendant: Quest Difficulty Tiers
// ---------------------------------------------------------------------------

export type QuestDifficulty = "spark" | "ember" | "flame" | "blaze" | "inferno";

export interface QuestDifficultyConfig {
  label: string;
  tier: number;
  validationMethod: QuestValidationMethod;
  description: string;
  baseXp: number;
}

export type QuestValidationMethod =
  | "self_report"
  | "peer_confirm"
  | "photo_and_peer"
  | "community_vote"
  | "community_vote_and_evidence";

export const QUEST_DIFFICULTY_TIERS: Record<QuestDifficulty, QuestDifficultyConfig> = {
  spark: {
    label: "Spark",
    tier: 1,
    validationMethod: "self_report",
    description: "Quick, simple tasks like picking up litter or checking on a neighbor",
    baseXp: 5,
  },
  ember: {
    label: "Ember",
    tier: 2,
    validationMethod: "peer_confirm",
    description: "Tasks needing one peer to confirm, like helping someone move a couch",
    baseXp: 15,
  },
  flame: {
    label: "Flame",
    tier: 3,
    validationMethod: "photo_and_peer",
    description: "Substantial tasks with photo evidence, like repairing a fence",
    baseXp: 35,
  },
  blaze: {
    label: "Blaze",
    tier: 4,
    validationMethod: "community_vote",
    description: "Multi-person efforts requiring 3+ community votes to validate",
    baseXp: 75,
  },
  inferno: {
    label: "Inferno",
    tier: 5,
    validationMethod: "community_vote_and_evidence",
    description: "Major projects spanning weeks with documented outcomes",
    baseXp: 150,
  },
};

// ---------------------------------------------------------------------------
// Ascendant: Skill Domains ("Essences")
// ---------------------------------------------------------------------------

export type SkillDomain =
  | "craft"
  | "green"
  | "care"
  | "bridge"
  | "signal"
  | "hearth"
  | "weave";

export interface SkillDomainConfig {
  label: string;
  description: string;
  examples: string[];
  color: string;
  icon: string;
}

export const SKILL_DOMAINS: Record<SkillDomain, SkillDomainConfig> = {
  craft: {
    label: "Craft",
    description: "Building, repairing, and creating physical things",
    examples: ["Home repair", "Woodworking", "Electrical", "Plumbing", "Sewing"],
    color: "rose-clay",
    icon: "Hammer",
  },
  green: {
    label: "Green",
    description: "Nurturing growing things and stewarding the environment",
    examples: ["Gardening", "Landscaping", "Composting", "Urban farming"],
    color: "meadow",
    icon: "Leaf",
  },
  care: {
    label: "Care",
    description: "Supporting people through presence and attention",
    examples: ["Childcare", "Eldercare", "Pet care", "Crisis support", "Tutoring"],
    color: "horizon",
    icon: "Heart",
  },
  bridge: {
    label: "Bridge",
    description: "Moving people and things where they need to go",
    examples: ["Transportation", "Moving help", "Delivery", "Errands"],
    color: "golden-hour",
    icon: "Truck",
  },
  signal: {
    label: "Signal",
    description: "Connecting people through information and technology",
    examples: ["Tech help", "Communications", "Translation", "Teaching"],
    color: "horizon",
    icon: "Radio",
  },
  hearth: {
    label: "Hearth",
    description: "Gathering people together through food and fellowship",
    examples: ["Cooking", "Meal prep", "Event hosting", "Community gathering"],
    color: "rose-clay",
    icon: "Flame",
  },
  weave: {
    label: "Weave",
    description: "Coordinating people and processes toward shared goals",
    examples: ["Coordination", "Project management", "Conflict resolution", "Governance"],
    color: "golden-hour",
    icon: "Network",
  },
};

// ---------------------------------------------------------------------------
// Ascendant: Privacy Tiers
// ---------------------------------------------------------------------------

export type PrivacyTier = "ghost" | "quiet" | "open" | "mentor";

export const PRIVACY_TIERS: Record<PrivacyTier, { label: string; description: string }> = {
  ghost: { label: "Ghost", description: "Badge only — minimal visibility" },
  quiet: { label: "Quiet", description: "Tier + domain summary visible (default)" },
  open: { label: "Open", description: "Full profile visible to neighborhood" },
  mentor: { label: "Mentor", description: "Full profile + availability for mentoring" },
};

// ---------------------------------------------------------------------------
// Ascendant: Guild & Governance Types
// ---------------------------------------------------------------------------

export type GuildRole = "member" | "steward";

export type ProposalStatus = "draft" | "deliberation" | "voting" | "passed" | "rejected" | "expired";

export type VoteType = "quadratic" | "approval" | "liquid_delegate";

export type ProposalCategory =
  | "charter_amendment"
  | "quest_template"
  | "threshold_change"
  | "seasonal_quest"
  | "rule_change"
  | "guild_charter"
  | "federation"
  | "other";

// ---------------------------------------------------------------------------
// Ascendant: Category -> Domain Mapping
// ---------------------------------------------------------------------------

/** Maps V2 post categories to Ascendant skill domains for backward compatibility */
export const CATEGORY_TO_DOMAIN: Record<string, SkillDomain[]> = {
  home_repair: ["craft"],
  yard_garden: ["green"],
  childcare: ["care"],
  pet_care: ["care"],
  transportation: ["bridge"],
  tech_help: ["signal"],
  cooking_meals: ["hearth"],
  tutoring: ["signal", "care"],
  moving: ["bridge", "craft"],
  errands: ["bridge"],
  companionship: ["care", "hearth"],
  other: ["weave"],
};

// ---------------------------------------------------------------------------
// Post Categories (V2, unchanged)
// ---------------------------------------------------------------------------

export interface PostCategory {
  value: string;
  label: string;
  color: string;
}

export const POST_CATEGORIES: PostCategory[] = [
  { value: "home_repair", label: "Home Repair", color: "rose-clay" },
  { value: "yard_garden", label: "Yard & Garden", color: "meadow" },
  { value: "childcare", label: "Childcare", color: "horizon" },
  { value: "pet_care", label: "Pet Care", color: "meadow" },
  { value: "transportation", label: "Transportation", color: "horizon" },
  { value: "tech_help", label: "Tech Help", color: "horizon" },
  { value: "cooking_meals", label: "Cooking & Meals", color: "rose-clay" },
  { value: "tutoring", label: "Tutoring", color: "horizon" },
  { value: "moving", label: "Moving Help", color: "rose-clay" },
  { value: "errands", label: "Errands", color: "meadow" },
  { value: "companionship", label: "Companionship", color: "golden-hour" },
  { value: "other", label: "Other", color: "golden-hour" },
];

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const MAX_PHOTOS_PER_POST = 4;
export const MAX_PHOTO_SIZE_MB = 5;
export const MAX_PHOTO_SIZE_BYTES = MAX_PHOTO_SIZE_MB * 1024 * 1024;
export const PHOTO_MAX_WIDTH = 1200;
export const THUMBNAIL_WIDTH = 300;
export const JPEG_QUALITY = 80;

export const AI_RATE_LIMIT_PER_MINUTE = 10;
export const AI_DAILY_TOKEN_BUDGET = 100_000;
export const PROFILE_LOOKUP_RATE_LIMIT_PER_HOUR = 30;
export const FLAG_THRESHOLD_HIDE = 3;
export const NEW_ACCOUNT_REVIEW_POST_COUNT = 3;

// Ascendant constants
export const QUEST_ANTI_FARMING_COOLDOWN_HOURS = 24;
export const QUEST_DIMINISHING_RETURNS_WINDOW_DAYS = 7;
export const QUEST_SCARCITY_BONUS_CAP = 1.3;
export const QUEST_REQUESTED_BY_OTHER_MULTIPLIER = 1.5;
export const GUILD_STEWARD_TERM_MONTHS = 6;
export const GUILD_STEWARD_MAX_CONSECUTIVE_TERMS = 2;
export const GUILD_CHARTER_DEFAULT_SUNSET_YEARS = 1;
export const NEIGHBORHOOD_CHARTER_SUNSET_YEARS = 2;
export const RENOWN_DECAY_RATE_PER_MONTH = 0.02;
export const RENOWN_CAP_PER_TIER: Record<RenownTier, number> = {
  1: 0,
  2: 49,
  3: 199,
  4: 499,
  5: 999,
};

// Skill XP logarithmic progression: XP needed = BASE * ln(level + 1)
export const SKILL_XP_BASE = 100;

/** Calculate XP needed for next level using logarithmic curve */
export function xpForLevel(level: number): number {
  return Math.round(SKILL_XP_BASE * Math.log(level + 2));
}

/** Calculate level from total XP */
export function levelFromXp(totalXp: number): number {
  let level = 0;
  let xpNeeded = 0;
  while (xpNeeded + xpForLevel(level) <= totalXp) {
    xpNeeded += xpForLevel(level);
    level++;
  }
  return level;
}
