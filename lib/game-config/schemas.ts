/**
 * Zod validation schemas for game design editing.
 * Enforces guardrails at field level so invalid data is caught
 * before it reaches the database.
 */

import { z } from "zod";
import { GUARDRAILS } from "./guardrails";

// ---------------------------------------------------------------------------
// Child row schemas
// ---------------------------------------------------------------------------

export const QuestTypeSchema = z.object({
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(50, "Slug must be at most 50 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes"),
  label: z
    .string()
    .min(1, "Label is required")
    .max(100, "Label must be at most 100 characters"),
  description: z.string().max(500).nullable().optional(),
  validationMethod: z.enum([
    "self_report",
    "peer_confirm",
    "photo_and_peer",
    "community_vote",
    "community_vote_and_evidence",
  ]),
  validationThreshold: z.number().int().min(0).max(100).default(0),
  recognitionType: z.enum(["xp", "narrative", "badge", "endorsement_prompt", "none"]).default("xp"),
  baseRecognition: z.number().int().min(0).max(1000).default(5),
  narrativePrompt: z.string().max(500).nullable().optional(),
  cooldownHours: z.number().int().min(GUARDRAILS.MIN_COOLDOWN_HOURS).max(168).default(0),
  maxPartySize: z.number().int().min(1).max(10).default(1),
  sortOrder: z.number().int().min(0).default(0),
  color: z.string().max(50).nullable().optional(),
  icon: z.string().max(50).nullable().optional(),
});

export const SkillDomainSchema = z.object({
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(50, "Slug must be at most 50 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes"),
  label: z
    .string()
    .min(1, "Label is required")
    .max(100, "Label must be at most 100 characters"),
  description: z.string().max(500).nullable().optional(),
  examples: z.array(z.string().max(100)).max(10).default([]),
  color: z.string().max(50).nullable().optional(),
  icon: z.string().max(50).nullable().optional(),
  visibilityDefault: z.enum(["private", "opt_in", "summary_only"]).default("private"),
  sortOrder: z.number().int().min(0).default(0),
});

export const RecognitionTierSchema = z.object({
  tierNumber: z.number().int().min(1).max(GUARDRAILS.MAX_RECOGNITION_TIERS),
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must be at most 50 characters"),
  thresholdType: z.enum(["points", "quests_completed", "endorsements", "time_in_community", "composite"]).default("points"),
  thresholdValue: z.number().int().min(0).max(10000).default(0),
  additionalRequirements: z.record(z.string(), z.unknown()).nullable().optional(),
  unlocks: z.array(z.string().max(200)).max(10).default([]),
  color: z.string().max(50).nullable().optional(),
});

export const RecognitionSourceSchema = z.object({
  sourceType: z.enum(["quest_completion", "endorsement_given", "endorsement_received", "mentoring"]),
  amount: z.number().min(0, "Amount cannot be negative"),
  maxPerDay: z
    .number()
    .int()
    .max(GUARDRAILS.MAX_RECOGNITION_PER_DAY, `Daily cap cannot exceed ${GUARDRAILS.MAX_RECOGNITION_PER_DAY}`)
    .nullable()
    .optional(),
});

// ---------------------------------------------------------------------------
// Top-level draft schema
// ---------------------------------------------------------------------------

export const GameDesignDraftSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name must be at most 100 characters"),
  description: z.string().max(1000).nullable().optional(),
  valueStatement: z
    .string()
    .min(10, "Value statement must be at least 10 characters")
    .max(2000, "Value statement must be at most 2000 characters"),
  designRationale: z
    .string()
    .min(10, "Design rationale must be at least 10 characters")
    .max(5000, "Design rationale must be at most 5000 characters"),
  sunsetAt: z.string().datetime({ message: "Must be a valid ISO date" }),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type QuestTypeInput = z.infer<typeof QuestTypeSchema>;
export type SkillDomainInput = z.infer<typeof SkillDomainSchema>;
export type RecognitionTierInput = z.infer<typeof RecognitionTierSchema>;
export type RecognitionSourceInput = z.infer<typeof RecognitionSourceSchema>;
export type GameDesignDraftInput = z.infer<typeof GameDesignDraftSchema>;
