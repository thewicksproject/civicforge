import { createAnthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";
import { type ZodType } from "zod";
import { datamark, sanitizeOutput } from "./sanitize";
import {
  PostExtractionSchema,
  MatchResultSchema,
  ModerationResultSchema,
  type PostExtraction,
  type MatchResult,
  type ModerationResult,
} from "./schemas";
import {
  POST_EXTRACTION_PROMPT,
  MATCHING_PROMPT,
  MODERATION_PROMPT,
} from "./prompts";

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = "claude-sonnet-4-5-20250929";

async function generate<T>(
  systemPrompt: string,
  userMessage: string,
  schema: ZodType<T>
): Promise<T> {
  const { object } = await generateObject({
    model: anthropic(MODEL),
    schema,
    system: systemPrompt,
    prompt: userMessage,
  });
  return object;
}

/**
 * Extract structured post data from natural language input.
 * Input is datamarked to prevent prompt injection.
 */
export async function extractPost(
  rawUserText: string
): Promise<PostExtraction> {
  const markedText = datamark(rawUserText);
  const result = await generate(
    POST_EXTRACTION_PROMPT,
    `Extract a structured post from this user input:\n\n${markedText}`,
    PostExtractionSchema
  );

  // Sanitize text fields in output
  return {
    ...result,
    title: sanitizeOutput(result.title),
    description: sanitizeOutput(result.description),
    location_hint: result.location_hint
      ? sanitizeOutput(result.location_hint)
      : null,
    available_times: result.available_times
      ? sanitizeOutput(result.available_times)
      : null,
    skills_relevant: result.skills_relevant.map(sanitizeOutput),
  };
}

/**
 * Find matching profiles for a post.
 * SECURITY: Only structured data enters this context — never raw user text.
 */
export async function findMatches(
  post: {
    title: string;
    category: string;
    skills_relevant: string[];
    urgency: string | null;
    available_times: string | null;
  },
  profiles: Array<{
    user_id: string;
    display_name: string;
    skills: string[];
    reputation_score: number;
  }>
): Promise<MatchResult> {
  const userMessage = `Post to match:
Title: ${post.title}
Category: ${post.category}
Skills needed: ${post.skills_relevant.join(", ")}
Urgency: ${post.urgency ?? "not specified"}
Availability: ${post.available_times ?? "not specified"}

Available profiles:
${profiles.map((p) => `- ID: ${p.user_id}, Skills: ${p.skills.join(", ")}, Reputation: ${p.reputation_score}`).join("\n")}`;

  return generate(MATCHING_PROMPT, userMessage, MatchResultSchema);
}

/**
 * Moderate content for safety.
 * Input is datamarked to prevent prompt injection.
 */
export async function moderateContent(
  rawText: string
): Promise<ModerationResult> {
  const markedText = datamark(rawText);
  return generate(
    MODERATION_PROMPT,
    `Evaluate this content:\n\n${markedText}`,
    ModerationResultSchema
  );
}
