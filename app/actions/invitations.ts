"use server";

import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { generateInviteCode, UUID_FORMAT } from "@/lib/utils";
import { notify } from "@/lib/notify/dispatcher";

const InvitationOptionsSchema = z.object({
  maxUses: z.number().int().min(1).max(50).default(1),
});

export async function createInvitation(
  communityId: string,
  options?: { maxUses?: number },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "You must be logged in" };
  }

  const idParsed = z.string().regex(UUID_FORMAT).safeParse(communityId);
  if (!idParsed.success) {
    return { success: false as const, error: "Invalid community ID" };
  }

  const admin = createServiceClient();

  // Verify user is Tier 2+ and belongs to this community
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("renown_tier, community_id")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return { success: false as const, error: "Profile not found" };
  }

  if (profile.renown_tier < 2) {
    return {
      success: false as const,
      error: "You must be Tier 2 or higher to create invitations",
    };
  }

  if (profile.community_id !== communityId) {
    console.warn("Invite create: community mismatch", {
      userId: user.id,
      profileCommunityId: profile.community_id,
      requestedCommunityId: communityId,
    });
    return {
      success: false as const,
      error: "You can only create invitations for your own community",
    };
  }

  const parsed = InvitationOptionsSchema.safeParse(options ?? {});
  const maxUses = parsed.success ? parsed.data.maxUses : 1;

  // Generate code and set expiry (30 days for multi-use, 7 days for single-use)
  const code = generateInviteCode();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (maxUses > 1 ? 30 : 7));

  const insertData = {
    code,
    community_id: communityId,
    created_by: user.id,
    max_uses: maxUses,
    expires_at: expiresAt.toISOString(),
  };

  const { data: invitation, error: insertError } = await admin
    .from("invitations")
    .insert(insertData)
    .select()
    .single();

  if (insertError) {
    // If code collision, retry once with a new code
    if (insertError.code === "23505") {
      const retryCode = generateInviteCode();
      const { data: retryInvitation, error: retryError } = await admin
        .from("invitations")
        .insert({ ...insertData, code: retryCode })
        .select()
        .single();

      if (retryError) {
        return { success: false as const, error: "Failed to create invitation" };
      }

      return { success: true as const, data: retryInvitation };
    }

    return { success: false as const, error: "Failed to create invitation" };
  }

  return { success: true as const, data: invitation };
}

export async function redeemInvitation(code: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "You must be logged in" };
  }

  const codeParsed = z
    .string()
    .min(1, "Invitation code is required")
    .max(32, "Invalid invitation code")
    .safeParse(code);

  if (!codeParsed.success) {
    return { success: false as const, error: codeParsed.error.issues[0].message };
  }

  const admin = createServiceClient();

  // Find the invitation
  const { data: invitation, error: fetchError } = await admin
    .from("invitations")
    .select("*")
    .eq("code", codeParsed.data.toUpperCase())
    .single();

  if (fetchError || !invitation) {
    return { success: false as const, error: "Invitation not found" };
  }

  // Check if usage limit reached
  if (invitation.use_count >= (invitation.max_uses ?? 1)) {
    return {
      success: false as const,
      error: "This invitation has reached its usage limit",
    };
  }

  // Check if expired
  if (new Date(invitation.expires_at) < new Date()) {
    return { success: false as const, error: "This invitation has expired" };
  }

  // Check if user already belongs to a community
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("community_id, renown_tier")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return { success: false as const, error: "Profile not found" };
  }

  const isJoinPath = profile.community_id === null;
  const isSameCommunityPath = profile.community_id === invitation.community_id;

  if (!isJoinPath && !isSameCommunityPath) {
    return {
      success: false as const,
      error: "This invitation is for a different community",
    };
  }

  // Atomically claim invitation (optimistic lock on use_count < max_uses).
  const { data: claimedInvitation, error: updateInvError } = await admin
    .from("invitations")
    .update({
      used_by: user.id,
      use_count: invitation.use_count + 1,
    })
    .eq("id", invitation.id)
    .lt("use_count", invitation.max_uses ?? 1)
    .gt("expires_at", new Date().toISOString())
    .select("id, community_id")
    .single();

  if (updateInvError || !claimedInvitation) {
    return { success: false as const, error: "Failed to redeem invitation" };
  }

  // Update profile with a conditional community predicate:
  // - join path: only when user still has no community
  // - same-community path: only when user still belongs to invite community
  const newRenownTier = Math.max(profile.renown_tier, 2);
  let profileUpdateQuery = admin
    .from("profiles")
    .update({
      community_id: claimedInvitation.community_id,
      renown_tier: newRenownTier,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (isJoinPath) {
    profileUpdateQuery = profileUpdateQuery.is("community_id", null);
  } else {
    profileUpdateQuery = profileUpdateQuery.eq(
      "community_id",
      claimedInvitation.community_id
    );
  }

  const { data: updatedProfile, error: updateProfileError } = await profileUpdateQuery
    .select()
    .single();

  if (updateProfileError || !updatedProfile) {
    // Best-effort rollback so a failed profile update doesn't permanently consume the code.
    await admin
      .from("invitations")
      .update({ use_count: Math.max(0, invitation.use_count) })
      .eq("id", claimedInvitation.id);

    return {
      success: false as const,
      error: "Failed to update profile with invitation upgrade. Please try again.",
    };
  }

  // Track individual usage
  await admin.from("invitation_usages").insert({
    invitation_id: claimedInvitation.id,
    user_id: user.id,
  }).then(() => {}, () => {
    // Ignore duplicate — non-critical
  });

  // Notify inviter that someone joined
  const displayName = (updatedProfile as { display_name?: string }).display_name ?? "Someone";
  notify({
    recipientId: invitation.created_by,
    type: "invite_redeemed",
    title: `${displayName} joined using your invite!`,
    body: "Your invitation helped grow the community.",
    resourceType: "profile",
    resourceId: user.id,
    actorId: user.id,
  });

  return { success: true as const, data: updatedProfile };
}
