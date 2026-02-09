"use server";

import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { FLAG_THRESHOLD_HIDE } from "@/lib/types";

export async function flagPost(postId: string, reason?: string) {
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

  // Validate reason if provided
  if (reason && reason.length > 500) {
    return { success: false as const, error: "Reason too long" };
  }

  const admin = createServiceClient();

  // Verify the post exists and user is not the author
  const { data: post, error: postError } = await admin
    .from("posts")
    .select("id, author_id, flag_count")
    .eq("id", postId)
    .single();

  if (postError || !post) {
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
  });

  if (flagError) {
    return { success: false as const, error: "Failed to flag post" };
  }

  // Increment flag count and auto-hide at threshold
  const newFlagCount = post.flag_count + 1;
  const shouldHide = newFlagCount >= FLAG_THRESHOLD_HIDE;

  await admin
    .from("posts")
    .update({
      flag_count: newFlagCount,
      ...(shouldHide ? { hidden: true } : {}),
    })
    .eq("id", postId);

  return { success: true as const, data: { flagCount: newFlagCount, hidden: shouldHide } };
}

export async function unflagPost(postId: string) {
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

  const admin = createServiceClient();

  // Verify Tier 3
  const { data: profile } = await admin
    .from("profiles")
    .select("renown_tier")
    .eq("id", user.id)
    .single();

  if (!profile || profile.renown_tier < 3) {
    return { success: false as const, error: "Only verified members can unflag posts" };
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
