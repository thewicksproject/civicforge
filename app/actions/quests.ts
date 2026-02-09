"use server";

import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import {
  QUEST_DIFFICULTY_TIERS,
  CATEGORY_TO_DOMAIN,
  type QuestDifficulty,
} from "@/lib/types";

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
  max_party_size: z.number().int().min(1).max(10).default(1),
  is_emergency: z.boolean().default(false),
});

export async function createQuest(data: {
  title: string;
  description: string;
  difficulty: string;
  skill_domains: string[];
  max_party_size?: number;
  is_emergency?: boolean;
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
    .select("neighborhood_id, renown_tier")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.neighborhood_id) {
    return { success: false as const, error: "Profile not found" };
  }

  if (profile.renown_tier < 2) {
    return {
      success: false as const,
      error: "You must be a Neighbor (Renown Tier 2) or higher to create quests",
    };
  }

  const difficulty = parsed.data.difficulty as QuestDifficulty;
  const diffConfig = QUEST_DIFFICULTY_TIERS[difficulty];

  const { data: quest, error } = await admin.from("quests").insert({
    post_id: data.post_id ?? null,
    neighborhood_id: profile.neighborhood_id,
    created_by: user.id,
    title: parsed.data.title,
    description: parsed.data.description,
    difficulty: parsed.data.difficulty,
    validation_method: diffConfig.validationMethod,
    skill_domains: parsed.data.skill_domains,
    xp_reward: diffConfig.baseXp,
    max_party_size: parsed.data.max_party_size,
    is_emergency: parsed.data.is_emergency,
    requested_by_other: !!data.post_id,
    validation_threshold:
      difficulty === "spark"
        ? 0
        : difficulty === "ember"
          ? 1
          : difficulty === "flame"
            ? 1
            : difficulty === "blaze"
              ? 3
              : 5,
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

  const { data: post } = await admin
    .from("posts")
    .select("id, title, description, category, skills_relevant, urgency, author_id, neighborhood_id")
    .eq("id", postId)
    .single();

  if (!post) {
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

  // W1: Neighborhood scoping
  const { data: userProfile } = await admin
    .from("profiles")
    .select("neighborhood_id")
    .eq("id", user.id)
    .single();

  if (!userProfile?.neighborhood_id) {
    return { success: false as const, error: "Profile not found" };
  }

  const { data: quest } = await admin
    .from("quests")
    .select("id, status, max_party_size, created_by, neighborhood_id")
    .eq("id", questId)
    .single();

  if (!quest) {
    return { success: false as const, error: "Quest not found" };
  }

  if (quest.neighborhood_id !== userProfile.neighborhood_id) {
    return { success: false as const, error: "Quest is not in your neighborhood" };
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

  // Create party if multi-person
  if (quest.max_party_size > 1) {
    const { data: party } = await admin
      .from("parties")
      .insert({
        quest_id: questId,
        created_by: user.id,
      })
      .select("id")
      .single();

    if (party) {
      await admin.from("party_members").insert({
        party_id: party.id,
        user_id: user.id,
      });
    }
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

  const { data: quest } = await admin
    .from("quests")
    .select("id, status, difficulty, validation_method, validation_threshold, skill_domains, xp_reward, created_by, max_party_size")
    .eq("id", questId)
    .single();

  if (!quest) {
    return { success: false as const, error: "Quest not found" };
  }

  if (quest.status !== "in_progress" && quest.status !== "claimed") {
    return { success: false as const, error: "Quest is not in progress" };
  }

  // C10: Claimer verification — ensure current user is a participant
  if (quest.max_party_size > 1) {
    // Multi-person: check party membership
    const { data: partyMember } = await admin
      .from("parties")
      .select("id, party_members!inner(user_id)")
      .eq("quest_id", questId)
      .eq("party_members.user_id", user.id)
      .limit(1)
      .single();

    if (!partyMember) {
      return { success: false as const, error: "Only party members can complete this quest" };
    }
  } else {
    // Solo: the claimer is not the author (claimQuest already prevents self-claim)
    if (quest.created_by === user.id) {
      return { success: false as const, error: "Cannot complete your own quest" };
    }
  }

  // Self-report quests (Spark) complete immediately
  if (quest.validation_method === "self_report") {
    await admin
      .from("quests")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", questId);

    // Award XP
    await awardQuestXp(admin, user.id, quest);

    return { success: true as const, status: "completed" };
  }

  // Other quests enter pending_validation
  await admin
    .from("quests")
    .update({ status: "pending_validation" })
    .eq("id", questId);

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

  // W1: Neighborhood scoping
  const { data: userProfile } = await admin
    .from("profiles")
    .select("neighborhood_id, renown_tier")
    .eq("id", user.id)
    .single();

  if (!userProfile?.neighborhood_id) {
    return { success: false as const, error: "Profile not found" };
  }

  const { data: quest } = await admin
    .from("quests")
    .select("id, status, validation_count, validation_threshold, skill_domains, xp_reward, created_by, neighborhood_id")
    .eq("id", questId)
    .single();

  if (!quest || quest.status !== "pending_validation") {
    return { success: false as const, error: "Quest is not pending validation" };
  }

  if (quest.neighborhood_id !== userProfile.neighborhood_id) {
    return { success: false as const, error: "Quest is not in your neighborhood" };
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

    // RPC returns { new_count, threshold, status }
    const result = rpcResult as { new_count: number; threshold: number; status: string };

    // Check if threshold met and quest was just completed by the RPC
    if (result.status === "completed") {
      await awardQuestXp(admin, quest.created_by, quest);
    }
  }

  return { success: true as const };
}

/** Award skill XP for a completed quest (internal, uses service client) */
async function awardQuestXp(
  admin: ReturnType<typeof createServiceClient>,
  userId: string,
  quest: {
    skill_domains: string[];
    xp_reward: number;
    created_by: string;
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

  // Award renown: +1 per quest, +0.5 per endorsement received (handled elsewhere)
  try {
    await admin.rpc("increment_renown", {
      p_user_id: userId,
      p_amount: 1,
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

export async function getNeighborhoodQuests(neighborhoodId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "Unauthorized" };
  }

  const admin = createServiceClient();

  // W1: Verify user belongs to this neighborhood
  const { data: userProfile } = await admin
    .from("profiles")
    .select("neighborhood_id")
    .eq("id", user.id)
    .single();

  if (userProfile?.neighborhood_id !== neighborhoodId) {
    return { success: false as const, error: "Not your neighborhood" };
  }

  const { data: quests, error } = await admin
    .from("quests")
    .select(`
      id, title, description, difficulty, status, skill_domains,
      xp_reward, max_party_size, is_emergency, created_at,
      created_by, profiles!quests_created_by_fkey(display_name, avatar_url, renown_tier)
    `)
    .eq("neighborhood_id", neighborhoodId)
    .in("status", ["open", "claimed", "in_progress", "pending_validation"])
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return { success: false as const, error: "Failed to load quests" };
  }

  return { success: true as const, quests: quests ?? [] };
}
