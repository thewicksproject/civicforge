"use server";

import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import {
  QUEST_DIFFICULTY_TIERS,
  CATEGORY_TO_DOMAIN,
  type QuestDifficulty,
} from "@/lib/types";
import { resolveGameConfig } from "@/lib/game-config/resolver";
import { UUID_FORMAT } from "@/lib/utils";

const QuestSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must be at most 100 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must be at most 2000 characters"),
  difficulty: z.enum(["spark", "ember", "flame", "blaze", "inferno"] as const),
  skill_domains: z
    .array(
      z.enum([
        "craft",
        "green",
        "care",
        "bridge",
        "signal",
        "hearth",
        "weave",
      ] as const)
    )
    .min(1)
    .max(3),
  max_party_size: z.number().int().min(1).max(30).default(1),
  is_emergency: z.boolean().default(false),
  scheduled_for: z.string().datetime({ offset: true }).nullable().optional(),
});

export async function createQuest(data: {
  title: string;
  description: string;
  difficulty: string;
  skill_domains: string[];
  max_party_size?: number;
  is_emergency?: boolean;
  scheduled_for?: string | null;
  post_id?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "You must be logged in" };
  }

  const parsed = QuestSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0].message };
  }

  const admin = createServiceClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("community_id, renown_tier")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.community_id) {
    return { success: false as const, error: "Profile not found" };
  }

  if (profile.renown_tier < 2) {
    return {
      success: false as const,
      error: "You must be a Neighbor (Renown Tier 2) or higher to create quests",
    };
  }

  let safePostId: string | null = null;
  if (data.post_id) {
    const postIdParsed = z.string().regex(UUID_FORMAT).safeParse(data.post_id);
    if (!postIdParsed.success) {
      return { success: false as const, error: "Invalid post ID" };
    }

    const { data: post, error: postError } = await admin
      .from("posts")
      .select("id, community_id, hidden")
      .eq("id", postIdParsed.data)
      .single();

    if (postError || !post || post.hidden) {
      return { success: false as const, error: "Post not found" };
    }

    if (post.community_id !== profile.community_id) {
      return { success: false as const, error: "Post is not in your community" };
    }

    safePostId = post.id;
  }

  const difficulty = parsed.data.difficulty as QuestDifficulty;

  // Resolve game config for this community (dynamic quest types)
  const gameConfig = await resolveGameConfig(profile.community_id);
  const questType = gameConfig.questTypes.find(
    (t) => t.slug === difficulty,
  );

  // Fall back to hardcoded constants if quest type not found in game config
  const diffConfig = questType ?? {
    validationMethod: QUEST_DIFFICULTY_TIERS[difficulty].validationMethod,
    baseRecognition: QUEST_DIFFICULTY_TIERS[difficulty].baseXp,
    validationThreshold: difficulty === "spark" ? 0 : difficulty === "ember" ? 1 : difficulty === "flame" ? 1 : difficulty === "blaze" ? 3 : 5,
  };

  const { data: quest, error } = await admin.from("quests").insert({
    post_id: safePostId,
    community_id: profile.community_id,
    created_by: user.id,
    title: parsed.data.title,
    description: parsed.data.description,
    difficulty: parsed.data.difficulty,
    validation_method: questType?.validationMethod ?? QUEST_DIFFICULTY_TIERS[difficulty].validationMethod,
    skill_domains: parsed.data.skill_domains,
    xp_reward: questType?.baseRecognition ?? QUEST_DIFFICULTY_TIERS[difficulty].baseXp,
    max_party_size: parsed.data.max_party_size,
    is_emergency: parsed.data.is_emergency,
    requested_by_other: safePostId !== null,
    validation_threshold: diffConfig.validationThreshold,
    scheduled_for: parsed.data.scheduled_for ?? null,
    // Game Designer FKs
    game_design_id: gameConfig.isClassicFallback ? null : gameConfig.gameDesignId,
    quest_type_id: questType && !gameConfig.isClassicFallback ? questType.id : null,
  }).select("id").single();

  if (error) {
    return { success: false as const, error: "Failed to create quest" };
  }

  // Log to audit
  await admin.from("audit_log").insert({
    user_id: user.id,
    action: "quest.create",
    resource_type: "quest",
    resource_id: quest.id,
    metadata: { difficulty, skill_domains: parsed.data.skill_domains },
  });

  return { success: true as const, questId: quest.id };
}

/**
 * Create a quest from an existing post (V2 -> V2.5 bridge).
 * Maps post category to skill domains automatically.
 */
export async function createQuestFromPost(postId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "You must be logged in" };
  }

  const admin = createServiceClient();

  const postIdParsed = z.string().regex(UUID_FORMAT).safeParse(postId);
  if (!postIdParsed.success) {
    return { success: false as const, error: "Invalid post ID" };
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("community_id")
    .eq("id", user.id)
    .single();

  if (!profile?.community_id) {
    return { success: false as const, error: "Profile not found" };
  }

  const { data: post } = await admin
    .from("posts")
    .select("id, title, description, category, skills_relevant, urgency, author_id, community_id")
    .eq("id", postIdParsed.data)
    .single();

  if (!post || post.community_id !== profile.community_id) {
    return { success: false as const, error: "Post not found" };
  }

  // Map V2 category to skill domains
  const domains = CATEGORY_TO_DOMAIN[post.category] ?? ["weave"];

  // Auto-detect difficulty from urgency
  const difficulty: QuestDifficulty =
    post.urgency === "high" ? "ember" : "spark";

  return createQuest({
    title: post.title,
    description: post.description,
    difficulty,
    skill_domains: domains,
    post_id: post.id,
  });
}

export async function claimQuest(questId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "You must be logged in" };
  }

  const admin = createServiceClient();

  // W1: Community scoping
  const { data: userProfile } = await admin
    .from("profiles")
    .select("community_id")
    .eq("id", user.id)
    .single();

  if (!userProfile?.community_id) {
    return { success: false as const, error: "Profile not found" };
  }

  const { data: quest } = await admin
    .from("quests")
    .select("id, status, max_party_size, created_by, community_id")
    .eq("id", questId)
    .single();

  if (!quest) {
    return { success: false as const, error: "Quest not found" };
  }

  if (quest.community_id !== userProfile.community_id) {
    return { success: false as const, error: "Quest is not in your community" };
  }

  if (quest.status !== "open") {
    return { success: false as const, error: "Quest is no longer available" };
  }

  if (quest.created_by === user.id) {
    return { success: false as const, error: "Cannot claim your own quest" };
  }

  // C5: Optimistic lock — only update if still "open" to prevent TOCTOU race
  const newStatus = quest.max_party_size > 1 ? "claimed" : "in_progress";
  const { data: updated } = await admin
    .from("quests")
    .update({ status: newStatus })
    .eq("id", questId)
    .eq("status", "open")
    .select("id")
    .single();

  if (!updated) {
    return { success: false as const, error: "Quest is no longer available" };
  }

  // Track claimers for both solo and party quests.
  // Every claimed quest should have at least one party membership row.
  let partyId: string | null = null;
  const { data: existingParty } = await admin
    .from("parties")
    .select("id")
    .eq("quest_id", questId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  partyId = existingParty?.id ?? null;

  if (!partyId) {
    const { data: party, error: partyError } = await admin
      .from("parties")
      .insert({
        quest_id: questId,
        created_by: user.id,
      })
      .select("id")
      .single();

    if (partyError || !party) {
      await admin
        .from("quests")
        .update({ status: "open" })
        .eq("id", questId)
        .eq("status", newStatus);
      return { success: false as const, error: "Failed to claim quest" };
    }

    partyId = party.id;
  }

  const { error: memberError } = await admin.from("party_members").insert({
    party_id: partyId,
    user_id: user.id,
  });

  if (memberError && memberError.code !== "23505") {
    await admin
      .from("quests")
      .update({ status: "open" })
      .eq("id", questId)
      .eq("status", newStatus);
    return { success: false as const, error: "Failed to claim quest" };
  }

  return { success: true as const };
}

export async function joinParty(questId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "You must be logged in" };
  }

  const admin = createServiceClient();

  const { data: userProfile } = await admin
    .from("profiles")
    .select("community_id")
    .eq("id", user.id)
    .single();

  if (!userProfile?.community_id) {
    return { success: false as const, error: "Profile not found" };
  }

  const { data: quest } = await admin
    .from("quests")
    .select("id, status, max_party_size, created_by, community_id")
    .eq("id", questId)
    .single();

  if (!quest) {
    return { success: false as const, error: "Quest not found" };
  }

  if (quest.community_id !== userProfile.community_id) {
    return { success: false as const, error: "Quest is not in your community" };
  }

  if (quest.status !== "claimed") {
    return { success: false as const, error: "This quest is not accepting party members" };
  }

  if (quest.created_by === user.id) {
    return { success: false as const, error: "Cannot join your own quest" };
  }

  // Find the party for this quest
  const { data: party } = await admin
    .from("parties")
    .select("id")
    .eq("quest_id", questId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!party) {
    return { success: false as const, error: "No party found for this quest" };
  }

  // Check party capacity
  const { count } = await admin
    .from("party_members")
    .select("id", { count: "exact", head: true })
    .eq("party_id", party.id);

  if ((count ?? 0) >= quest.max_party_size) {
    return { success: false as const, error: "This quest's party is full" };
  }

  // Insert party member (unique index prevents double-joining)
  const { error: memberError } = await admin.from("party_members").insert({
    party_id: party.id,
    user_id: user.id,
  });

  if (memberError) {
    if (memberError.code === "23505") {
      return { success: false as const, error: "You have already joined this quest" };
    }
    return { success: false as const, error: "Failed to join quest" };
  }

  return { success: true as const };
}

export async function completeQuest(questId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "You must be logged in" };
  }

  const admin = createServiceClient();

  const { data: userProfile } = await admin
    .from("profiles")
    .select("community_id")
    .eq("id", user.id)
    .single();

  if (!userProfile?.community_id) {
    return { success: false as const, error: "Profile not found" };
  }

  const { data: quest } = await admin
    .from("quests")
    .select("id, status, difficulty, validation_method, validation_threshold, skill_domains, xp_reward, max_party_size, community_id")
    .eq("id", questId)
    .single();

  if (!quest) {
    return { success: false as const, error: "Quest not found" };
  }

  if (quest.status !== "in_progress" && quest.status !== "claimed") {
    return { success: false as const, error: "Quest is not in progress" };
  }

  if (quest.community_id !== userProfile.community_id) {
    return { success: false as const, error: "Quest is not in your community" };
  }

  const { data: partyMember } = await admin
    .from("parties")
    .select("id, party_members!inner(user_id)")
    .eq("quest_id", questId)
    .eq("party_members.user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!partyMember) {
    return { success: false as const, error: "Only quest participants can complete this quest" };
  }

  // Self-report quests (Spark) complete immediately
  if (quest.validation_method === "self_report") {
    const { data: completed } = await admin
      .from("quests")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", questId)
      .in("status", ["in_progress", "claimed"])
      .select("id")
      .maybeSingle();

    if (!completed) {
      return { success: false as const, error: "Quest is no longer in progress" };
    }

    await awardQuestXpToParticipants(admin, questId, quest);

    return { success: true as const, status: "completed" };
  }

  // Other quests enter pending_validation
  const { data: pending } = await admin
    .from("quests")
    .update({ status: "pending_validation" })
    .eq("id", questId)
    .in("status", ["in_progress", "claimed"])
    .select("id")
    .maybeSingle();

  if (!pending) {
    return { success: false as const, error: "Quest is no longer in progress" };
  }

  return { success: true as const, status: "pending_validation" };
}

export async function validateQuest(
  questId: string,
  approved: boolean,
  message?: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "You must be logged in" };
  }

  const admin = createServiceClient();

  // W1: Community scoping
  const { data: userProfile } = await admin
    .from("profiles")
    .select("community_id, renown_tier")
    .eq("id", user.id)
    .single();

  if (!userProfile?.community_id) {
    return { success: false as const, error: "Profile not found" };
  }

  const { data: quest } = await admin
    .from("quests")
    .select("id, status, validation_count, validation_threshold, skill_domains, xp_reward, created_by, community_id")
    .eq("id", questId)
    .single();

  if (!quest || quest.status !== "pending_validation") {
    return { success: false as const, error: "Quest is not pending validation" };
  }

  if (quest.community_id !== userProfile.community_id) {
    return { success: false as const, error: "Quest is not in your community" };
  }

  if (quest.created_by === user.id) {
    return { success: false as const, error: "Cannot validate your own quest" };
  }

  // Record the validation
  const { error } = await admin.from("quest_validations").insert({
    quest_id: questId,
    validator_id: user.id,
    approved,
    message: message ?? null,
  });

  if (error) {
    if (error.code === "23505") {
      return { success: false as const, error: "You already validated this quest" };
    }
    return { success: false as const, error: "Failed to submit validation" };
  }

  // C6: Use atomic RPC to increment validation count (prevents drift)
  if (approved) {
    const { data: rpcResult, error: rpcError } = await admin.rpc(
      "increment_quest_validation",
      { p_quest_id: questId }
    );

    if (rpcError) {
      return { success: false as const, error: "Failed to update validation count" };
    }

    const rpcRow = Array.isArray(rpcResult) ? rpcResult[0] : rpcResult;
    const result = rpcRow as { new_count?: number; threshold?: number } | null;
    const newCount = Number(result?.new_count ?? 0);
    const threshold = Number(result?.threshold ?? quest.validation_threshold);

    if (newCount >= threshold) {
      const { data: completed } = await admin
        .from("quests")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", questId)
        .eq("status", "pending_validation")
        .select("id")
        .maybeSingle();

      if (completed) {
        await awardQuestXpToParticipants(admin, questId, quest);
      }
    }
  }

  return { success: true as const };
}

async function getQuestParticipantIds(
  admin: ReturnType<typeof createServiceClient>,
  questId: string
): Promise<string[]> {
  const { data: parties } = await admin
    .from("parties")
    .select("id")
    .eq("quest_id", questId);

  const partyIds = (parties ?? []).map((p) => p.id);
  if (partyIds.length === 0) return [];

  const { data: members } = await admin
    .from("party_members")
    .select("user_id")
    .in("party_id", partyIds);

  return Array.from(new Set((members ?? []).map((m) => m.user_id)));
}

async function awardQuestXpToParticipants(
  admin: ReturnType<typeof createServiceClient>,
  questId: string,
  quest: {
    skill_domains: string[];
    xp_reward: number;
    community_id?: string;
  }
) {
  const participantIds = await getQuestParticipantIds(admin, questId);
  if (participantIds.length === 0) return;

  for (const participantId of participantIds) {
    await awardQuestXp(admin, participantId, quest);
  }
}

/** Award skill XP for a completed quest (internal, uses service client) */
async function awardQuestXp(
  admin: ReturnType<typeof createServiceClient>,
  userId: string,
  quest: {
    skill_domains: string[];
    xp_reward: number;
    community_id?: string;
  }
) {
  const xpPerDomain = Math.round(
    quest.xp_reward / Math.max(quest.skill_domains.length, 1)
  );

  for (const domain of quest.skill_domains) {
    // Upsert skill progress
    const { data: existing } = await admin
      .from("skill_progress")
      .select("id, total_xp, level, quests_completed")
      .eq("user_id", userId)
      .eq("domain", domain)
      .single();

    if (existing) {
      const newXp = existing.total_xp + xpPerDomain;
      const newLevel = calculateLevel(newXp);
      await admin
        .from("skill_progress")
        .update({
          total_xp: newXp,
          level: newLevel,
          quests_completed: existing.quests_completed + 1,
          last_quest_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else {
      const newLevel = calculateLevel(xpPerDomain);
      await admin.from("skill_progress").insert({
        user_id: userId,
        domain,
        total_xp: xpPerDomain,
        level: newLevel,
        quests_completed: 1,
        last_quest_at: new Date().toISOString(),
      });
    }
  }

  // Award renown using game config recognition sources
  // Default: +1 per quest completion (configurable per community game design)
  let renownAmount = 1;
  if (quest.community_id) {
    try {
      const config = await resolveGameConfig(quest.community_id);
      const questSource = config.recognitionSources.find(
        (s) => s.sourceType === "quest_completion",
      );
      if (questSource) renownAmount = questSource.amount;
    } catch {
      // Fall back to default
    }
  }

  try {
    await admin.rpc("increment_renown", {
      p_user_id: userId,
      p_amount: renownAmount,
    });
  } catch {
    // RPC may not exist yet
  }
}

/** Logarithmic level calculation (matching types.ts formula) */
function calculateLevel(totalXp: number): number {
  const BASE = 100;
  let level = 0;
  let xpNeeded = 0;
  while (xpNeeded + Math.round(BASE * Math.log(level + 2)) <= totalXp) {
    xpNeeded += Math.round(BASE * Math.log(level + 2));
    level++;
  }
  return level;
}

export async function getCommunityQuests(communityId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "Unauthorized" };
  }

  const admin = createServiceClient();

  // W1: Verify user belongs to this community
  const { data: userProfile } = await admin
    .from("profiles")
    .select("community_id")
    .eq("id", user.id)
    .single();

  if (userProfile?.community_id !== communityId) {
    return { success: false as const, error: "Not your community" };
  }

  const { data: quests, error } = await admin
    .from("quests")
    .select(`
      id, title, description, difficulty, status, skill_domains,
      xp_reward, max_party_size, is_emergency, scheduled_for, created_at,
      created_by, profiles!quests_created_by_fkey(display_name, avatar_url, renown_tier)
    `)
    .eq("community_id", communityId)
    .in("status", ["open", "claimed", "in_progress", "pending_validation"])
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return { success: false as const, error: "Failed to load quests" };
  }

  return { success: true as const, quests: quests ?? [] };
}
