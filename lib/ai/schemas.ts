import { z } from "zod";

/** Schema for AI-extracted post structure from natural language input */
export const PostExtractionSchema = z.object({
  title: z.string().min(5).max(100).describe("A clear, concise title for the post"),
  description: z
    .string()
    .min(10)
    .max(2000)
    .describe("A helpful description of the need or offer"),
  category: z
    .enum([
      "home_repair",
      "yard_garden",
      "childcare",
      "pet_care",
      "transportation",
      "tech_help",
      "cooking_meals",
      "tutoring",
      "moving",
      "errands",
      "companionship",
      "other",
    ])
    .describe("The most relevant category"),
  type: z.enum(["need", "offer"]).describe("Whether this is a need or an offer to help"),
  skills_relevant: z
    .array(z.string().max(50))
    .max(5)
    .describe("Relevant skills or keywords"),
  urgency: z
    .enum(["low", "medium", "high"])
    .nullable()
    .describe("How urgent this is, null if unclear"),
  available_times: z
    .string()
    .max(200)
    .nullable()
    .describe("When the person is available, null if not mentioned"),
  location_hint: z
    .string()
    .max(100)
    .nullable()
    .describe("Community-level location hint only. NEVER include precise addresses."),
});

export type PostExtraction = z.infer<typeof PostExtractionSchema>;

/** Schema for AI matching results */
export const MatchResultSchema = z.object({
  matches: z.array(
    z.object({
      user_id: z.string().uuid(),
      score: z.number().min(0).max(1),
      reason: z.string().max(200).describe("Brief explanation of why this is a good match"),
    })
  ),
});

export type MatchResult = z.infer<typeof MatchResultSchema>;

/** Schema for content moderation */
export const ModerationResultSchema = z.object({
  safe: z.boolean().describe("Whether the content is safe to post"),
  reason: z
    .string()
    .max(200)
    .nullable()
    .describe("Reason if flagged, null if safe"),
  category: z
    .enum(["safe", "spam", "harassment", "inappropriate", "scam", "dangerous"])
    .describe("Content category"),
});

export type ModerationResult = z.infer<typeof ModerationResultSchema>;

// ---------------------------------------------------------------------------
// Ascendant Schemas
// ---------------------------------------------------------------------------

/** Schema for AI-extracted quest structure from natural language input */
export const QuestExtractionSchema = z.object({
  title: z
    .string()
    .min(5)
    .max(100)
    .describe("A clear, concise quest title"),
  description: z
    .string()
    .min(10)
    .max(2000)
    .describe("What needs to be done"),
  difficulty: z
    .enum(["spark", "ember", "flame", "blaze", "inferno"])
    .describe("Quest difficulty tier based on scope and validation needed"),
  skill_domains: z
    .array(z.enum(["craft", "green", "care", "bridge", "signal", "hearth", "weave"]))
    .min(1)
    .max(3)
    .describe("Relevant skill domains for this quest"),
  max_party_size: z
    .number()
    .int()
    .min(1)
    .max(10)
    .describe("How many people could work on this"),
  urgency: z
    .enum(["low", "medium", "high"])
    .nullable()
    .describe("How urgent this is, null if unclear"),
  available_times: z
    .string()
    .max(200)
    .nullable()
    .describe("When the person is available, null if not mentioned"),
  location_hint: z
    .string()
    .max(100)
    .nullable()
    .describe("Community-level location hint only. NEVER include precise addresses."),
});

export type QuestExtraction = z.infer<typeof QuestExtractionSchema>;

/** Schema for quest matching results (matching quests TO a user) */
export const QuestMatchResultSchema = z.object({
  matches: z.array(
    z.object({
      quest_id: z.string().uuid(),
      score: z.number().min(0).max(1),
      reason: z
        .string()
        .max(300)
        .describe("Narrative reason why this quest fits this person"),
    })
  ),
});

export type QuestMatchResult = z.infer<typeof QuestMatchResultSchema>;

/** Schema for AI advocate chat responses */
export const AdvocateResponseSchema = z.object({
  message: z
    .string()
    .max(2000)
    .describe("Response to the user in warm, direct tone"),
  actions: z
    .array(
      z.object({
        type: z.enum([
          "create_quest",
          "find_quests",
          "summarize_activity",
          "analyze_proposal",
          "manage_privacy",
          "flag_concern",
          "none",
        ]),
        data: z.record(z.string(), z.unknown()).optional().describe("Structured action data"),
      })
    )
    .max(3)
    .describe("System actions to take based on the conversation"),
});

export type AdvocateResponse = z.infer<typeof AdvocateResponseSchema>;

/** Schema for governance proposal analysis */
export const GovernanceAnalysisSchema = z.object({
  summary: z
    .string()
    .max(500)
    .describe("Plain language summary of what the proposal does"),
  who_benefits: z
    .string()
    .max(300)
    .describe("Which community members or groups benefit most"),
  who_bears_cost: z
    .string()
    .max(300)
    .describe("Which community members or groups might be disadvantaged"),
  power_check: z.object({
    concentrates_power: z.boolean(),
    concerns: z
      .string()
      .max(300)
      .nullable()
      .describe("Specific power concentration concerns, null if none"),
  }),
  user_impact: z
    .string()
    .max(300)
    .describe("How this specifically affects the user"),
});

export type GovernanceAnalysis = z.infer<typeof GovernanceAnalysisSchema>;
