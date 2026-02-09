import { createAnthropic } from "@ai-sdk/anthropic";
import { generateObject, generateText } from "ai";
import { type ZodType } from "zod";
import { datamark, sanitizeOutput } from "./sanitize";
import {
  PostExtractionSchema,
  MatchResultSchema,
  ModerationResultSchema,
  QuestExtractionSchema,
  QuestMatchResultSchema,
  GovernanceAnalysisSchema,
  type PostExtraction,
  type MatchResult,
  type ModerationResult,
  type QuestExtraction,
  type QuestMatchResult,
  type GovernanceAnalysis,
} from "./schemas";
import {
  POST_EXTRACTION_PROMPT,
  MATCHING_PROMPT,
  MODERATION_PROMPT,
  QUEST_EXTRACTION_PROMPT,
  QUEST_MATCHING_PROMPT,
  ADVOCATE_PROMPT,
  GOVERNANCE_ANALYSIS_PROMPT,
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

// ---------------------------------------------------------------------------
// Ascendant AI Functions
// ---------------------------------------------------------------------------

/**
 * Extract structured quest data from natural language input.
 * Input is datamarked to prevent prompt injection.
 */
export async function extractQuest(
  rawUserText: string
): Promise<QuestExtraction> {
  const markedText = datamark(rawUserText);
  const result = await generate(
    QUEST_EXTRACTION_PROMPT,
    `Convert this into a structured quest:\n\n${markedText}`,
    QuestExtractionSchema
  );

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
  };
}

/**
 * Match open quests to a user based on their skills, availability, and interests.
 * SECURITY: Only structured data enters this context — never raw user text.
 */
export async function matchQuests(
  userProfile: {
    user_id: string;
    skills: string[];
    skill_domains: Array<{ domain: string; level: number }>;
    availability: string | null;
  },
  openQuests: Array<{
    quest_id: string;
    title: string;
    description: string;
    difficulty: string;
    skill_domains: string[];
    posted_by: string;
    urgency: string | null;
  }>
): Promise<QuestMatchResult> {
  const userMessage = `User profile:
Skills: ${userProfile.skills.join(", ")}
Skill domains: ${userProfile.skill_domains.map((d) => `${d.domain} (level ${d.level})`).join(", ")}
Availability: ${userProfile.availability ?? "not specified"}

Open quests:
${openQuests.map((q) => `- ID: ${q.quest_id}, Title: ${q.title}, Difficulty: ${q.difficulty}, Domains: ${q.skill_domains.join(", ")}, Posted by: ${q.posted_by}, Urgency: ${q.urgency ?? "normal"}`).join("\n")}`;

  return generate(QUEST_MATCHING_PROMPT, userMessage, QuestMatchResultSchema);
}

/**
 * Personal AI advocate chat.
 * Generates a natural language response with optional system actions.
 * Uses generateText for more natural conversational flow.
 */
export async function advocateChat(
  userMessage: string,
  context: {
    profile: {
      display_name: string;
      renown_tier: number;
      skill_domains: Array<{ domain: string; level: number }>;
      guild_memberships: string[];
    };
    recentActivity: string;
    activeQuests: string;
  }
): Promise<string> {
  const contextBlock = `
USER CONTEXT (private — do not share):
Name: ${context.profile.display_name}
Renown tier: ${context.profile.renown_tier}
Skills: ${context.profile.skill_domains.map((d) => `${d.domain} (level ${d.level})`).join(", ") || "none yet"}
Guilds: ${context.profile.guild_memberships.join(", ") || "none yet"}

RECENT NEIGHBORHOOD ACTIVITY:
${context.recentActivity || "No recent activity"}

ACTIVE QUESTS:
${context.activeQuests || "No active quests"}`;

  const markedMessage = datamark(userMessage);

  const { text } = await generateText({
    model: anthropic(MODEL),
    system: ADVOCATE_PROMPT + "\n\n" + contextBlock,
    prompt: `User says: ${markedMessage}`,
  });

  return sanitizeOutput(text);
}

/**
 * Analyze a governance proposal for a specific user.
 * SECURITY: Proposal text is datamarked; analysis is structured.
 */
export async function analyzeProposal(
  proposal: {
    title: string;
    description: string;
    category: string;
    vote_type: string;
    votes_for: number;
    votes_against: number;
  },
  userContext: {
    renown_tier: number;
    guild_memberships: string[];
    skill_domains: Array<{ domain: string; level: number }>;
  }
): Promise<GovernanceAnalysis> {
  const markedDescription = datamark(proposal.description);

  const userMessage = `Proposal to analyze:
Title: ${proposal.title}
Description: ${markedDescription}
Category: ${proposal.category}
Vote type: ${proposal.vote_type}
Current votes: ${proposal.votes_for} for, ${proposal.votes_against} against

User context:
Renown tier: ${userContext.renown_tier}
Guilds: ${userContext.guild_memberships.join(", ") || "none"}
Skill domains: ${userContext.skill_domains.map((d) => `${d.domain} (level ${d.level})`).join(", ") || "none"}`;

  return generate(
    GOVERNANCE_ANALYSIS_PROMPT,
    userMessage,
    GovernanceAnalysisSchema
  );
}
