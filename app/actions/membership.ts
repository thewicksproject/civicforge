"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const RequestMembershipSchema = z.object({
  neighborhoodId: z.string().uuid("Invalid neighborhood ID"),
  message: z
    .string()
    .max(500, "Message must be at most 500 characters")
    .optional(),
});

const ReviewStatusSchema = z.enum(["approved", "denied"] as const);

export async function requestMembership(
  neighborhoodId: string,
  message?: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "You must be logged in" };
  }

  const parsed = RequestMembershipSchema.safeParse({ neighborhoodId, message });
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0].message };
  }

  // Check that the neighborhood exists
  const { data: neighborhood, error: neighborhoodError } = await supabase
    .from("neighborhoods")
    .select("id")
    .eq("id", parsed.data.neighborhoodId)
    .single();

  if (neighborhoodError || !neighborhood) {
    return { success: false as const, error: "Neighborhood not found" };
  }

  // Check user doesn't already belong to a neighborhood
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("neighborhood_id")
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

  // Check for existing pending request to this neighborhood
  const { data: existingRequest } = await supabase
    .from("membership_requests")
    .select("id, status")
    .eq("user_id", user.id)
    .eq("neighborhood_id", parsed.data.neighborhoodId)
    .eq("status", "pending")
    .maybeSingle();

  if (existingRequest) {
    return {
      success: false as const,
      error: "You already have a pending request for this neighborhood",
    };
  }

  const { data: request, error: insertError } = await supabase
    .from("membership_requests")
    .insert({
      user_id: user.id,
      neighborhood_id: parsed.data.neighborhoodId,
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

  // Fetch the membership request
  const { data: request, error: requestError } = await supabase
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

  // Verify reviewer is Tier 2+ in the same neighborhood
  const { data: reviewerProfile, error: reviewerError } = await supabase
    .from("profiles")
    .select("trust_tier, neighborhood_id")
    .eq("id", user.id)
    .single();

  if (reviewerError || !reviewerProfile) {
    return { success: false as const, error: "Reviewer profile not found" };
  }

  if (reviewerProfile.trust_tier < 2) {
    return {
      success: false as const,
      error: "You must be Tier 2 or higher to review membership requests",
    };
  }

  if (reviewerProfile.neighborhood_id !== request.neighborhood_id) {
    return {
      success: false as const,
      error: "You can only review requests for your own neighborhood",
    };
  }

  // Update the membership request
  const { data: updatedRequest, error: updateError } = await supabase
    .from("membership_requests")
    .update({
      status: statusParsed.data,
      reviewed_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", requestId)
    .select()
    .single();

  if (updateError) {
    return {
      success: false as const,
      error: "Failed to update membership request",
    };
  }

  // If approved, update the requesting user's profile
  if (statusParsed.data === "approved") {
    const { error: profileUpdateError } = await supabase
      .from("profiles")
      .update({
        neighborhood_id: request.neighborhood_id,
        trust_tier: 2,
        updated_at: new Date().toISOString(),
      })
      .eq("id", request.user_id);

    if (profileUpdateError) {
      console.error(
        "Failed to update approved member profile:",
        profileUpdateError
      );
      return {
        success: false as const,
        error: "Request approved but failed to update member profile",
      };
    }
  }

  return { success: true as const, data: updatedRequest };
}
