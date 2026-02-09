"use server";

import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { generateInviteCode } from "@/lib/utils";

export async function createInvitation(neighborhoodId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "You must be logged in" };
  }

  const idParsed = z.string().uuid().safeParse(neighborhoodId);
  if (!idParsed.success) {
    return { success: false as const, error: "Invalid neighborhood ID" };
  }

  const admin = createServiceClient();

  // Verify user is Tier 2+ and belongs to this neighborhood
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("renown_tier, neighborhood_id")
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

  if (profile.neighborhood_id !== neighborhoodId) {
    return {
      success: false as const,
      error: "You can only create invitations for your own neighborhood",
    };
  }

  // Generate code and set expiry 7 days from now
  const code = generateInviteCode();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const { data: invitation, error: insertError } = await admin
    .from("invitations")
    .insert({
      code,
      neighborhood_id: neighborhoodId,
      created_by: user.id,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (insertError) {
    // If code collision, retry once with a new code
    if (insertError.code === "23505") {
      const retryCode = generateInviteCode();
      const { data: retryInvitation, error: retryError } = await admin
        .from("invitations")
        .insert({
          code: retryCode,
          neighborhood_id: neighborhoodId,
          created_by: user.id,
          expires_at: expiresAt.toISOString(),
        })
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

  // Check if already used
  if (invitation.used_by) {
    return {
      success: false as const,
      error: "This invitation has already been used",
    };
  }

  // Check if expired
  if (new Date(invitation.expires_at) < new Date()) {
    return { success: false as const, error: "This invitation has expired" };
  }

  // Check if user already belongs to a neighborhood
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("neighborhood_id, renown_tier")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return { success: false as const, error: "Profile not found" };
  }

  if (profile.neighborhood_id) {
    return {
      success: false as const,
      error: "You already belong to a neighborhood",
    };
  }

  // Mark invitation as used
  const { error: updateInvError } = await admin
    .from("invitations")
    .update({ used_by: user.id })
    .eq("id", invitation.id);

  if (updateInvError) {
    return { success: false as const, error: "Failed to redeem invitation" };
  }

  // Update user's profile: set neighborhood and upgrade renown tier to 2
  const newRenownTier = Math.max(profile.renown_tier, 2);
  const { data: updatedProfile, error: updateProfileError } = await admin
    .from("profiles")
    .update({
      neighborhood_id: invitation.neighborhood_id,
      renown_tier: newRenownTier,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)
    .select()
    .single();

  if (updateProfileError) {
    return {
      success: false as const,
      error: "Failed to update profile with neighborhood",
    };
  }

  return { success: true as const, data: updatedProfile };
}
