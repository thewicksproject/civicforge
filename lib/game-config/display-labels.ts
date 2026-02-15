/**
 * Human-friendly display labels for game-config enum values.
 * Keeps the raw snake_case values in the DB / Zod schemas but presents
 * warm, readable text in the UI.
 */

export const VALIDATION_METHOD_LABELS: Record<string, string> = {
  self_report: "Self-reported",
  peer_confirm: "Confirmed by a peer",
  photo_and_peer: "Photo + peer confirmation",
  community_vote: "Community vote",
  community_vote_and_evidence: "Community vote with evidence",
};

export const RECOGNITION_TYPE_LABELS: Record<string, string> = {
  xp: "Experience points",
  narrative: "Narrative reflection",
  badge: "Badge",
  endorsement_prompt: "Endorsement prompt",
  none: "None",
};

export const THRESHOLD_TYPE_LABELS: Record<string, string> = {
  points: "renown points",
  quests_completed: "quests completed",
  endorsements: "endorsements",
  time_in_community: "months in community",
  composite: "combined criteria",
};

export const SOURCE_TYPE_LABELS: Record<string, string> = {
  quest_completion: "Completing a quest",
  endorsement_given: "Endorsing a neighbor",
  endorsement_received: "Receiving an endorsement",
  mentoring: "Mentoring",
};

export const VISIBILITY_LABELS: Record<string, string> = {
  private: "Private by default",
  opt_in: "Opt-in",
  summary_only: "Summary only",
};

export const CEREMONY_LEVEL_LABELS: Record<string, string> = {
  minimal: "Lightweight",
  medium: "Balanced",
  high: "Ceremonial",
};

export const QUANTIFICATION_LEVEL_LABELS: Record<string, string> = {
  none: "Story-driven",
  minimal: "Light tracking",
  moderate: "Balanced tracking",
  detailed: "Detailed tracking",
};

/** Fallback: turn "some_enum_value" into "Some enum value". */
export function humanizeEnum(value: string): string {
  return value
    .replace(/_/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase());
}

/** Look up a human label, falling back to `humanizeEnum`. */
export function displayLabel(
  map: Record<string, string>,
  value: string,
): string {
  return map[value] ?? humanizeEnum(value);
}
