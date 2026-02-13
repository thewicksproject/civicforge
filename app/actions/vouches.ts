"use server";

import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";

const MONTHLY_VOUCH_LIMIT = 10;

const VouchSchema = z.object({
  to_user: z.string().uuid(),
  message: z.string().max(500).optional(),
});

export async function createVouch(data: {
  to_user: string;
  message?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "You must be logged in" };
  }

  const parsed = VouchSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0].message };
  }

  if (parsed.data.to_user === user.id) {
    return { success: false as const, error: "Cannot vouch for yourself" };
  }

  const admin = createServiceClient();

  // Load voucher profile
  const { data: fromProfile } = await admin
    .from("profiles")
    .select("community_id, renown_tier")
    .eq("id", user.id)
    .single();

  if (!fromProfile?.community_id || fromProfile.renown_tier < 3) {
    return { success: false as const, error: "Only Pillars (Tier 3+) can vouch" };
  }

  // Load target profile
  const { data: toProfile } = await admin
    .from("profiles")
    .select("community_id, renown_tier, renown_score")
    .eq("id", parsed.data.to_user)
    .single();

  if (!toProfile?.community_id) {
    return { success: false as const, error: "Profile not found" };
  }

  if (fromProfile.community_id !== toProfile.community_id) {
    return { success: false as const, error: "Cannot vouch for someone in a different community" };
  }

  if (toProfile.renown_tier >= 3) {
    return { success: false as const, error: "This person is already a Pillar" };
  }

  if (toProfile.renown_tier < 2) {
    return { success: false as const, error: "Target must be at least Tier 2 (Neighbor)" };
  }

  if (toProfile.renown_score < 50) {
    return { success: false as const, error: "Target needs at least 50 renown to be vouched for" };
  }

  // Check for existing vouch
  const { data: existingVouch } = await admin
    .from("vouches")
    .select("id")
    .eq("from_user", user.id)
    .eq("to_user", parsed.data.to_user)
    .limit(1)
    .single();

  if (existingVouch) {
    return { success: false as const, error: "You have already vouched for this person" };
  }

  // Check monthly rate limit
  const currentMonth = new Date().toISOString().slice(0, 7) + "-01"; // YYYY-MM-01
  const { data: usage } = await admin
    .from("vouch_usage")
    .select("count")
    .eq("user_id", user.id)
    .eq("month", currentMonth)
    .single();

  if (usage && usage.count >= MONTHLY_VOUCH_LIMIT) {
    return { success: false as const, error: "Monthly vouch limit reached (10 per month)" };
  }

  // Insert the vouch
  const { error: vouchError } = await admin.from("vouches").insert({
    from_user: user.id,
    to_user: parsed.data.to_user,
    community_id: fromProfile.community_id,
    message: parsed.data.message ?? null,
  });

  if (vouchError) {
    if (vouchError.code === "23505") {
      return { success: false as const, error: "You have already vouched for this person" };
    }
    return { success: false as const, error: "Failed to create vouch" };
  }

  // Increment monthly usage counter
  if (usage) {
    await admin
      .from("vouch_usage")
      .update({ count: usage.count + 1 })
      .eq("user_id", user.id)
      .eq("month", currentMonth);
  } else {
    await admin.from("vouch_usage").insert({
      user_id: user.id,
      month: currentMonth,
      count: 1,
    });
  }

  // Check if target now qualifies for Tier 3 promotion
  let promoted = false;
  try {
    const { data: promoteResult } = await admin.rpc("check_and_promote_tier3", {
      p_user_id: parsed.data.to_user,
    });
    promoted = promoteResult === true;
  } catch {
    // Fallback: check and promote manually
    const { count } = await admin
      .from("vouches")
      .select("id", { count: "exact", head: true })
      .eq("to_user", parsed.data.to_user);

    if ((count ?? 0) >= 2 && toProfile.renown_score >= 50) {
      await admin
        .from("profiles")
        .update({ renown_tier: 3 })
        .eq("id", parsed.data.to_user)
        .eq("renown_tier", 2);
      promoted = true;
    }
  }

  // Audit log the vouch (and promotion if applicable)
  await admin.from("audit_log").insert({
    user_id: user.id,
    action: promoted ? "vouch_and_promote_tier3" : "vouch",
    resource_type: "profile",
    resource_id: parsed.data.to_user,
    metadata: {
      message: parsed.data.message ?? null,
      promoted,
    },
  });

  return { success: true as const, promoted };
}

export async function getVouchesForUser(userId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "Unauthorized", vouches: [] };
  }

  const admin = createServiceClient();

  // Community scoping
  const { data: viewerProfile } = await admin
    .from("profiles")
    .select("community_id")
    .eq("id", user.id)
    .single();

  const { data: targetProfile } = await admin
    .from("profiles")
    .select("community_id")
    .eq("id", userId)
    .single();

  if (!targetProfile?.community_id) {
    return { success: false as const, error: "Profile not found", vouches: [] };
  }

  const isOwnProfile = user.id === userId;
  if (!isOwnProfile && viewerProfile?.community_id !== targetProfile.community_id) {
    return { success: false as const, error: "Profile not found", vouches: [] };
  }

  const { data: vouches, error } = await admin
    .from("vouches")
    .select(`
      id, message, created_at,
      from_user, profiles!vouches_from_user_fkey(display_name, avatar_url)
    `)
    .eq("to_user", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    return { success: false as const, error: "Failed to load vouches", vouches: [] };
  }

  return { success: true as const, vouches: vouches ?? [] };
}

export async function canUserVouch(targetUserId: string): Promise<{
  canVouch: boolean;
  reason: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { canVouch: false, reason: "Not logged in" };
  }

  if (user.id === targetUserId) {
    return { canVouch: false, reason: "Cannot vouch for yourself" };
  }

  const admin = createServiceClient();

  const { data: fromProfile } = await admin
    .from("profiles")
    .select("community_id, renown_tier")
    .eq("id", user.id)
    .single();

  if (!fromProfile?.community_id || fromProfile.renown_tier < 3) {
    return { canVouch: false, reason: "Only Pillars (Tier 3+) can vouch" };
  }

  const { data: toProfile } = await admin
    .from("profiles")
    .select("community_id, renown_tier, renown_score")
    .eq("id", targetUserId)
    .single();

  if (!toProfile?.community_id) {
    return { canVouch: false, reason: "Profile not found" };
  }

  if (fromProfile.community_id !== toProfile.community_id) {
    return { canVouch: false, reason: "Different community" };
  }

  if (toProfile.renown_tier >= 3) {
    return { canVouch: false, reason: "Already a Pillar" };
  }

  if (toProfile.renown_tier < 2) {
    return { canVouch: false, reason: "Must be at least Tier 2" };
  }

  if (toProfile.renown_score < 50) {
    return { canVouch: false, reason: "Needs at least 50 renown" };
  }

  // Check existing vouch
  const { data: existingVouch } = await admin
    .from("vouches")
    .select("id")
    .eq("from_user", user.id)
    .eq("to_user", targetUserId)
    .limit(1)
    .single();

  if (existingVouch) {
    return { canVouch: false, reason: "Already vouched" };
  }

  // Check monthly limit
  const currentMonth = new Date().toISOString().slice(0, 7) + "-01";
  const { data: usage } = await admin
    .from("vouch_usage")
    .select("count")
    .eq("user_id", user.id)
    .eq("month", currentMonth)
    .single();

  if (usage && usage.count >= MONTHLY_VOUCH_LIMIT) {
    return { canVouch: false, reason: "Monthly limit reached" };
  }

  return { canVouch: true, reason: "" };
}
