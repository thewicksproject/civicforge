"use server";

import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { moderateContent } from "@/lib/ai/client";
import { isSameCommunity } from "@/lib/security/authorization";

const MessageSchema = z
  .string()
  .min(10, "Message must be at least 10 characters")
  .max(1000, "Message must be at most 1000 characters");

const ResponseStatusSchema = z.enum(["accepted", "declined"] as const);

export async function createResponse(postId: string, message: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "You must be logged in" };
  }

  const idParsed = z.string().uuid().safeParse(postId);
  if (!idParsed.success) {
    return { success: false as const, error: "Invalid post ID" };
  }

  const msgParsed = MessageSchema.safeParse(message);
  if (!msgParsed.success) {
    return { success: false as const, error: msgParsed.error.issues[0].message };
  }

  const admin = createServiceClient();

  // Check renown tier
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("renown_tier, community_id")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || !profile.community_id) {
    return { success: false as const, error: "Profile not found" };
  }

  if (profile.renown_tier < 2) {
    return {
      success: false as const,
      error: "You must be Tier 2 or higher to respond to posts",
    };
  }

  // Verify the post exists and is active
  const { data: post, error: postError } = await admin
    .from("posts")
    .select("id, author_id, status, community_id")
    .eq("id", postId)
    .single();

  if (postError || !post) {
    return { success: false as const, error: "Post not found" };
  }

  if (!isSameCommunity(profile.community_id, post.community_id)) {
    return { success: false as const, error: "Post not found" };
  }

  if (post.status !== "active") {
    return { success: false as const, error: "This post is no longer active" };
  }

  if (post.author_id === user.id) {
    return {
      success: false as const,
      error: "You cannot respond to your own post",
    };
  }

  // Check for duplicate response
  const { data: existingResponse } = await admin
    .from("responses")
    .select("id")
    .eq("post_id", postId)
    .eq("responder_id", user.id)
    .maybeSingle();

  if (existingResponse) {
    return {
      success: false as const,
      error: "You have already responded to this post",
    };
  }

  // Content moderation — fail open on API errors
  try {
    const moderation = await moderateContent(msgParsed.data);
    if (!moderation.safe) {
      return {
        success: false as const,
        error: `Content flagged: ${moderation.reason ?? "Violates community guidelines"}`,
      };
    }
  } catch {
    // Fail open — don't block users if moderation API is down
  }

  const { data: response, error: insertError } = await admin
    .from("responses")
    .insert({
      post_id: postId,
      responder_id: user.id,
      message: msgParsed.data,
    })
    .select()
    .single();

  if (insertError) {
    return { success: false as const, error: "Failed to create response" };
  }

  return { success: true as const, data: response };
}

export async function updateResponseStatus(
  responseId: string,
  status: "accepted" | "declined"
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "You must be logged in" };
  }

  const idParsed = z.string().uuid().safeParse(responseId);
  if (!idParsed.success) {
    return { success: false as const, error: "Invalid response ID" };
  }

  const statusParsed = ResponseStatusSchema.safeParse(status);
  if (!statusParsed.success) {
    return { success: false as const, error: "Invalid status" };
  }

  const admin = createServiceClient();

  // Fetch the response and its associated post
  const { data: response, error: responseError } = await admin
    .from("responses")
    .select("id, post_id, status")
    .eq("id", responseId)
    .single();

  if (responseError || !response) {
    return { success: false as const, error: "Response not found" };
  }

  if (response.status !== "pending") {
    return {
      success: false as const,
      error: "This response has already been reviewed",
    };
  }

  // Verify the current user is the post author
  const { data: post, error: postError } = await admin
    .from("posts")
    .select("author_id")
    .eq("id", response.post_id)
    .single();

  if (postError || !post) {
    return { success: false as const, error: "Associated post not found" };
  }

  if (post.author_id !== user.id) {
    return {
      success: false as const,
      error: "Only the post author can accept or decline responses",
    };
  }

  const { data: updated, error: updateError } = await admin
    .from("responses")
    .update({
      status: statusParsed.data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", responseId)
    .select()
    .single();

  if (updateError) {
    return { success: false as const, error: "Failed to update response status" };
  }

  // If accepted, update the post status to in_progress
  if (statusParsed.data === "accepted") {
    await admin
      .from("posts")
      .update({
        status: "in_progress",
        updated_at: new Date().toISOString(),
      })
      .eq("id", response.post_id);
  }

  return { success: true as const, data: updated };
}
