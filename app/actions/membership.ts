"use server";

import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";

const RequestMembershipSchema = z.object({
  communityId: z.string().uuid("Invalid community ID"),
  message: z
    .string()
    .max(500, "Message must be at most 500 characters")
    .optional(),
});

const ReviewStatusSchema = z.enum(["approved", "denied"] as const);

export async function requestMembership(
  communityId: string,
  message?: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "You must be logged in" };
  }

  const parsed = RequestMembershipSchema.safeParse({ communityId, message });
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0].message };
  }

  const admin = createServiceClient();

  // Check that the community exists
  const { data: community, error: communityError } = await admin
    .from("communities")
    .select("id")
    .eq("id", parsed.data.communityId)
    .single();

  if (communityError || !community) {
    return { success: false as const, error: "Community not found" };
  }

  // Check user doesn't already belong to a community
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("community_id")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return { success: false as const, error: "Profile not found" };
  }

  if (profile.community_id) {
    return {
      success: false as const,
      error: "You already belong to a community",
    };
  }

  // Check for existing pending request to this community
  const { data: existingRequest } = await admin
    .from("membership_requests")
    .select("id, status")
    .eq("user_id", user.id)
    .eq("community_id", parsed.data.communityId)
    .eq("status", "pending")
    .maybeSingle();

  if (existingRequest) {
    return {
      success: false as const,
      error: "You already have a pending request for this community",
    };
  }

  const { data: request, error: insertError } = await admin
    .from("membership_requests")
    .insert({
      user_id: user.id,
      community_id: parsed.data.communityId,
      message: parsed.data.message ?? null,
    })
    .select()
    .single();

  if (insertError) {
    return {
      success: false as const,
      error: "Failed to create membership request",
    };
  }

  return { success: true as const, data: request };
}

export async function reviewMembership(
  requestId: string,
  status: "approved" | "denied"
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "You must be logged in" };
  }

  const idParsed = z.string().uuid().safeParse(requestId);
  if (!idParsed.success) {
    return { success: false as const, error: "Invalid request ID" };
  }

  const statusParsed = ReviewStatusSchema.safeParse(status);
  if (!statusParsed.success) {
    return { success: false as const, error: "Invalid status" };
  }

  const admin = createServiceClient();

  // Fetch the membership request
  const { data: request, error: requestError } = await admin
    .from("membership_requests")
    .select("*")
    .eq("id", requestId)
    .single();

  if (requestError || !request) {
    return { success: false as const, error: "Membership request not found" };
  }

  if (request.status !== "pending") {
    return {
      success: false as const,
      error: "This request has already been reviewed",
    };
  }

  // Verify reviewer is Tier 2+ in the same community
  const { data: reviewerProfile, error: reviewerError } = await admin
    .from("profiles")
    .select("renown_tier, community_id")
    .eq("id", user.id)
    .single();

  if (reviewerError || !reviewerProfile) {
    return { success: false as const, error: "Reviewer profile not found" };
  }

  if (reviewerProfile.renown_tier < 2) {
    return {
      success: false as const,
      error: "You must be Tier 2 or higher to review membership requests",
    };
  }

  if (reviewerProfile.community_id !== request.community_id) {
    return {
      success: false as const,
      error: "You can only review requests for your own community",
    };
  }

  const nowIso = new Date().toISOString();

  // Update the membership request only if still pending (race-safe).
  const { data: updatedRequest, error: updateError } = await admin
    .from("membership_requests")
    .update({
      status: statusParsed.data,
      reviewed_by: user.id,
      updated_at: nowIso,
    })
    .eq("id", requestId)
    .eq("status", "pending")
    .select()
    .maybeSingle();

  if (updateError || !updatedRequest) {
    return {
      success: false as const,
      error: "This request has already been reviewed",
    };
  }

  // If approved, update the requesting user's profile
  if (statusParsed.data === "approved") {
    const { data: approvedProfile, error: profileUpdateError } = await admin
      .from("profiles")
      .update({
        community_id: request.community_id,
        renown_tier: 2,
        updated_at: nowIso,
      })
      .eq("id", request.user_id)
      .is("community_id", null)
      .select("id")
      .maybeSingle();

    if (profileUpdateError || !approvedProfile) {
      // Roll back the request status if profile assignment failed.
      await admin
        .from("membership_requests")
        .update({
          status: "pending",
          reviewed_by: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestId)
        .eq("reviewed_by", user.id)
        .eq("status", "approved");

      console.error(
        "Failed to update approved member profile:",
        profileUpdateError ?? new Error("Profile already belongs to a community")
      );
      return {
        success: false as const,
        error:
          "Request approval could not be completed because the member already belongs to a community",
      };
    }
  }

  return { success: true as const, data: updatedRequest };
}
