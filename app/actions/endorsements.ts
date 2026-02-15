"use server";

import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { resolveGameConfig } from "@/lib/game-config/resolver";
import { UUID_FORMAT } from "@/lib/utils";

const EndorsementSchema = z.object({
  to_user: z.string().regex(UUID_FORMAT),
  domain: z.enum([
    "craft",
    "green",
    "care",
    "bridge",
    "signal",
    "hearth",
    "weave",
  ] as const),
  skill: z.string().max(100).optional(),
  message: z.string().max(500).optional(),
  quest_id: z.string().regex(UUID_FORMAT).optional(),
});

export async function createEndorsement(data: {
  to_user: string;
  domain: string;
  skill?: string;
  message?: string;
  quest_id?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "You must be logged in" };
  }

  const parsed = EndorsementSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0].message };
  }

  if (parsed.data.to_user === user.id) {
    return { success: false as const, error: "Cannot endorse yourself" };
  }

  const admin = createServiceClient();

  // W1: Community scoping — both users must be in same community
  const { data: fromProfile } = await admin
    .from("profiles")
    .select("community_id")
    .eq("id", user.id)
    .single();

  const { data: toProfile } = await admin
    .from("profiles")
    .select("community_id")
    .eq("id", parsed.data.to_user)
    .single();

  if (!fromProfile?.community_id || !toProfile?.community_id) {
    return { success: false as const, error: "Profile not found" };
  }

  if (fromProfile.community_id !== toProfile.community_id) {
    return { success: false as const, error: "Cannot endorse someone in a different community" };
  }

  // W7: Check for duplicate endorsement before insert
  const { data: existingEndorsement } = await admin
    .from("endorsements")
    .select("id")
    .eq("from_user", user.id)
    .eq("to_user", parsed.data.to_user)
    .eq("domain", parsed.data.domain)
    .limit(1)
    .single();

  if (existingEndorsement) {
    return { success: false as const, error: "You already endorsed this person in this domain" };
  }

  const { error } = await admin.from("endorsements").insert({
    from_user: user.id,
    to_user: parsed.data.to_user,
    domain: parsed.data.domain,
    skill: parsed.data.skill ?? null,
    message: parsed.data.message ?? null,
    quest_id: parsed.data.quest_id ?? null,
  });

  if (error) {
    // W7: Handle unique constraint from DB as fallback
    if (error.code === "23505") {
      return { success: false as const, error: "You already endorsed this person in this domain" };
    }
    return { success: false as const, error: "Failed to create endorsement" };
  }

  // Endorsements earn renown (amounts from community game config)
  let giveAmount = 0.5;
  let receiveAmount = 1;
  try {
    const config = await resolveGameConfig(fromProfile.community_id);
    const giveSource = config.recognitionSources.find(
      (s) => s.sourceType === "endorsement_given",
    );
    const receiveSource = config.recognitionSources.find(
      (s) => s.sourceType === "endorsement_received",
    );
    if (giveSource) giveAmount = giveSource.amount;
    if (receiveSource) receiveAmount = receiveSource.amount;
  } catch {
    // Fall back to defaults
  }

  try {
    await admin.rpc("increment_renown", {
      p_user_id: user.id,
      p_amount: giveAmount,
    });
  } catch {
    // RPC may not exist yet
  }

  try {
    await admin.rpc("increment_renown", {
      p_user_id: parsed.data.to_user,
      p_amount: receiveAmount,
    });
  } catch {
    // RPC may not exist yet
  }

  return { success: true as const };
}

export async function getEndorsementsForUser(userId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "Unauthorized" };
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
    return { success: false as const, error: "Profile not found" };
  }

  const isOwnProfile = user.id === userId;
  if (!isOwnProfile) {
    if (!viewerProfile?.community_id || targetProfile.community_id !== viewerProfile.community_id) {
      return { success: false as const, error: "Profile not found" };
    }

    const canView =
      targetProfile.privacy_tier === "open" ||
      targetProfile.privacy_tier === "mentor";
    if (!canView) {
      return { success: false as const, error: "This user's endorsements are private" };
    }
  }

  const { data: endorsements, error } = await admin
    .from("endorsements")
    .select(`
      id, domain, skill, message, created_at,
      from_user, profiles!endorsements_from_user_fkey(display_name, avatar_url)
    `)
    .eq("to_user", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return { success: false as const, error: "Failed to load endorsements" };
  }

  return { success: true as const, endorsements: endorsements ?? [] };
}
