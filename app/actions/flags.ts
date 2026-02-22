"use server";

import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { FLAG_THRESHOLD_HIDE } from "@/lib/types";
import { UUID_FORMAT } from "@/lib/utils";
import {
  canModerateCommunityResource,
  isSameCommunity,
} from "@/lib/security/authorization";
import { notify } from "@/lib/notify/dispatcher";

const FlagTypeSchema = z.enum(["report", "suggest_move"]);

export async function flagPost(
  postId: string,
  options?: {
    reason?: string;
    flagType?: "report" | "suggest_move";
    suggestedCategory?: string;
  },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "You must be logged in" };
  }

  const idParsed = z.string().regex(UUID_FORMAT).safeParse(postId);
  if (!idParsed.success) {
    return { success: false as const, error: "Invalid post ID" };
  }

  const reason = options?.reason;
  const flagType = FlagTypeSchema.safeParse(options?.flagType ?? "report").data ?? "report";
  const suggestedCategory = options?.suggestedCategory;

  // Validate reason if provided
  if (reason && reason.length > 500) {
    return { success: false as const, error: "Reason too long" };
  }

  const admin = createServiceClient();

  const { data: actorProfile, error: actorProfileError } = await admin
    .from("profiles")
    .select("community_id, display_name")
    .eq("id", user.id)
    .single();

  if (actorProfileError || !actorProfile?.community_id) {
    return { success: false as const, error: "Profile not found" };
  }

  // Verify the post exists and user is not the author
  const { data: post, error: postError } = await admin
    .from("posts")
    .select("id, author_id, flag_count, community_id")
    .eq("id", postId)
    .single();

  if (postError || !post) {
    return { success: false as const, error: "Post not found" };
  }

  if (!isSameCommunity(actorProfile.community_id, post.community_id)) {
    return { success: false as const, error: "Post not found" };
  }

  if (post.author_id === user.id) {
    return { success: false as const, error: "You cannot flag your own post" };
  }

  // Check for duplicate flag
  const { data: existingFlag } = await admin
    .from("post_flags")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingFlag) {
    return { success: false as const, error: "You have already flagged this post" };
  }

  // Insert flag
  const { error: flagError } = await admin.from("post_flags").insert({
    post_id: postId,
    user_id: user.id,
    reason: reason ?? null,
    flag_type: flagType,
    suggested_category: suggestedCategory ?? null,
  });

  if (flagError) {
    return { success: false as const, error: "Failed to flag post" };
  }

  if (flagType === "report") {
    // Report: increment flag count and auto-hide at threshold
    const { data: rpcResult, error: rpcError } = await admin.rpc("increment_post_flag", {
      p_post_id: postId,
      p_threshold: FLAG_THRESHOLD_HIDE,
    });

    if (rpcError) {
      return { success: false as const, error: "Failed to flag post" };
    }

    const row = Array.isArray(rpcResult) ? rpcResult[0] : rpcResult;
    const newFlagCount = Number((row as { new_flag_count?: number } | null)?.new_flag_count ?? post.flag_count + 1);
    const hidden = Boolean((row as { is_hidden?: boolean } | null)?.is_hidden ?? false);

    // Notify the post author about the report
    notify({
      recipientId: post.author_id,
      type: "post_flagged",
      title: "Your post was flagged for review",
      body: "A neighbor flagged your post. You can add context or edit it.",
      resourceType: "post",
      resourceId: postId,
      actorId: user.id,
    });

    return { success: true as const, data: { flagCount: newFlagCount, hidden } };
  }

  // Suggest move: does NOT increment flag count. Sends a gentle notification.
  let notifBody = "A neighbor thinks this might fit better";
  if (suggestedCategory === "__quest") {
    notifBody = "A neighbor thinks this could work well as a quest.";
  } else if (suggestedCategory) {
    notifBody = `A neighbor thinks this might fit better as "${suggestedCategory}".`;
  }
  if (reason) {
    notifBody += ` "${reason}"`;
  }

  notify({
    recipientId: post.author_id,
    type: "post_suggestion",
    title: "A neighbor has a suggestion for your post",
    body: notifBody,
    resourceType: "post",
    resourceId: postId,
    actorId: user.id,
  });

  return { success: true as const, data: { flagCount: post.flag_count, hidden: false } };
}

/**
 * Allow a user to undo their own flag.
 * Only decrements the counter if the original flag was a "report" type.
 */
export async function unflagByUser(postId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "You must be logged in" };
  }

  const idParsed = z.string().regex(UUID_FORMAT).safeParse(postId);
  if (!idParsed.success) {
    return { success: false as const, error: "Invalid post ID" };
  }

  const admin = createServiceClient();

  // Find user's flag
  const { data: flag } = await admin
    .from("post_flags")
    .select("id, flag_type")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!flag) {
    return { success: false as const, error: "You haven't flagged this post" };
  }

  // Delete the flag
  await admin.from("post_flags").delete().eq("id", flag.id);

  // Only decrement counter if it was a report
  if (flag.flag_type === "report") {
    const { data: post } = await admin
      .from("posts")
      .select("flag_count")
      .eq("id", postId)
      .single();

    if (post) {
      const newCount = Math.max(0, post.flag_count - 1);
      await admin
        .from("posts")
        .update({ flag_count: newCount, hidden: newCount >= FLAG_THRESHOLD_HIDE })
        .eq("id", postId);
    }
  }

  return { success: true as const };
}

/**
 * Moderator unflag — clears all flags and unhides (Tier 3+).
 */
export async function unflagPost(postId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "You must be logged in" };
  }

  const idParsed = z.string().regex(UUID_FORMAT).safeParse(postId);
  if (!idParsed.success) {
    return { success: false as const, error: "Invalid post ID" };
  }

  const admin = createServiceClient();

  // Verify Tier 3
  const { data: profile } = await admin
    .from("profiles")
    .select("renown_tier, community_id")
    .eq("id", user.id)
    .single();

  if (!profile || profile.renown_tier < 3 || !profile.community_id) {
    return { success: false as const, error: "Only verified members can unflag posts" };
  }

  const { data: post } = await admin
    .from("posts")
    .select("id, community_id")
    .eq("id", postId)
    .single();

  if (
    !post ||
    !canModerateCommunityResource({
      renownTier: profile.renown_tier,
      moderatorCommunityId: profile.community_id,
      resourceCommunityId: post.community_id,
    })
  ) {
    return { success: false as const, error: "Post not found" };
  }

  // Delete all flags for this post
  await admin.from("post_flags").delete().eq("post_id", postId);

  // Reset flag count and unhide
  await admin
    .from("posts")
    .update({ flag_count: 0, hidden: false })
    .eq("id", postId);

  // Audit log
  await admin.from("audit_log").insert({
    user_id: user.id,
    action: "unflag_post",
    resource_type: "post",
    resource_id: postId,
  });

  return { success: true as const, data: null };
}
