"use server";

import { createClient, createServiceClient } from "@/lib/supabase/server";
import { xpForLevel } from "@/lib/types";
import type { SkillDomain } from "@/lib/types";

export async function getSkillProgress(userId?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "Unauthorized" };
  }

  const targetId = userId ?? user.id;
  const admin = createServiceClient();
  const { data: viewerProfile } = await admin
    .from("profiles")
    .select("community_id")
    .eq("id", user.id)
    .single();

  if (!viewerProfile?.community_id) {
    return { success: false as const, error: "Profile not found" };
  }

  // If viewing someone else's skills, check privacy tier
  if (targetId !== user.id) {
    const { data: targetProfile } = await admin
      .from("profiles")
      .select("privacy_tier, community_id")
      .eq("id", targetId)
      .single();

    if (!targetProfile) {
      return { success: false as const, error: "User not found" };
    }

    if (targetProfile.community_id !== viewerProfile.community_id) {
      return { success: false as const, error: "This user's skills are private" };
    }

    if (
      targetProfile.privacy_tier !== "open" &&
      targetProfile.privacy_tier !== "mentor"
    ) {
      return { success: false as const, error: "This user's skills are private" };
    }
  }

  const { data: skills, error } = await admin
    .from("skill_progress")
    .select("domain, total_xp, level, quests_completed, last_quest_at")
    .eq("user_id", targetId)
    .order("total_xp", { ascending: false });

  if (error) {
    return { success: false as const, error: "Failed to load skills" };
  }

  // Enrich with next-level info
  const enriched = (skills ?? []).map((s) => ({
    ...s,
    xpToNextLevel: xpForLevel(s.level),
    xpProgress: s.total_xp - xpNeededForLevel(s.level),
  }));

  return { success: true as const, skills: enriched };
}

/** Total XP needed to reach a given level */
function xpNeededForLevel(level: number): number {
  let total = 0;
  for (let i = 0; i < level; i++) {
    total += xpForLevel(i);
  }
  return total;
}

export async function getSkillSummary(userId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { domains: [], totalLevel: 0, primaryDomain: null };
  }

  const admin = createServiceClient();
  const { data: viewerProfile } = await admin
    .from("profiles")
    .select("community_id")
    .eq("id", user.id)
    .single();

  const { data: targetProfile } = await admin
    .from("profiles")
    .select("community_id, privacy_tier")
    .eq("id", userId)
    .single();

  if (!targetProfile) {
    return { domains: [], totalLevel: 0, primaryDomain: null };
  }

  if (userId !== user.id) {
    if (!viewerProfile?.community_id) {
      return { domains: [], totalLevel: 0, primaryDomain: null };
    }

    if (targetProfile.community_id !== viewerProfile.community_id) {
      return { domains: [], totalLevel: 0, primaryDomain: null };
    }

    if (targetProfile.privacy_tier === "ghost") {
      return { domains: [], totalLevel: 0, primaryDomain: null };
    }
  }

  const { data: skills } = await admin
    .from("skill_progress")
    .select("domain, level")
    .eq("user_id", userId)
    .order("level", { ascending: false });

  if (!skills || skills.length === 0) {
    return { domains: [], totalLevel: 0, primaryDomain: null };
  }

  return {
    domains: skills.map((s) => ({ domain: s.domain as SkillDomain, level: s.level })),
    totalLevel: skills.reduce((sum, s) => sum + s.level, 0),
    primaryDomain: skills[0].domain as SkillDomain,
  };
}
