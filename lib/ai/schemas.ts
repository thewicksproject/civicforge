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
    .describe("Neighborhood-level location hint only. NEVER include precise addresses."),
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
