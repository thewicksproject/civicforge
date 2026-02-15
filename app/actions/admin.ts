"use server";

import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { canModerateCommunityResource } from "@/lib/security/authorization";
import { UUID_FORMAT } from "@/lib/utils";

async function requireTier3() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { admin: null, userId: null, error: "You must be logged in" };
  }

  const admin = createServiceClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("renown_tier, community_id")
    .eq("id", user.id)
    .single();

  if (!profile || profile.renown_tier < 3 || !profile.community_id) {
    return { admin: null, userId: null, error: "Admin access required" };
  }

  return {
    admin,
    userId: user.id,
    communityId: profile.community_id,
    renownTier: profile.renown_tier,
    error: null,
  };
}

export async function reviewPost(
  postId: string,
  decision: "approved" | "rejected"
) {
  const { admin, userId, communityId, renownTier, error } = await requireTier3();
  if (error || !admin || !userId || !communityId) {
    return { success: false as const, error: error ?? "Unauthorized" };
  }

  const idParsed = z.string().regex(UUID_FORMAT).safeParse(postId);
  if (!idParsed.success) {
    return { success: false as const, error: "Invalid post ID" };
  }

  const decisionParsed = z
    .enum(["approved", "rejected"])
    .safeParse(decision);
  if (!decisionParsed.success) {
    return { success: false as const, error: "Invalid decision" };
  }

  const { data: post } = await admin
    .from("posts")
    .select("id, community_id")
    .eq("id", postId)
    .single();

  if (
    !post ||
    !canModerateCommunityResource({
      renownTier,
      moderatorCommunityId: communityId,
      resourceCommunityId: post.community_id,
    })
  ) {
    return { success: false as const, error: "Post not found" };
  }

  const updateData: Record<string, unknown> = {
    review_status: decisionParsed.data,
  };

  // If rejected, also hide the post
  if (decisionParsed.data === "rejected") {
    updateData.hidden = true;
  }

  const { error: updateError } = await admin
    .from("posts")
    .update(updateData)
    .eq("id", postId)
    .eq("community_id", communityId);

  if (updateError) {
    return { success: false as const, error: "Failed to update post" };
  }

  // Audit log
  await admin.from("audit_log").insert({
    user_id: userId,
    action: `review_post_${decisionParsed.data}`,
    resource_type: "post",
    resource_id: postId,
  });

  return { success: true as const, data: null };
}

export async function unhidePost(postId: string) {
  const { admin, userId, communityId, renownTier, error } = await requireTier3();
  if (error || !admin || !userId || !communityId) {
    return { success: false as const, error: error ?? "Unauthorized" };
  }

  const idParsed = z.string().regex(UUID_FORMAT).safeParse(postId);
  if (!idParsed.success) {
    return { success: false as const, error: "Invalid post ID" };
  }

  const { data: post } = await admin
    .from("posts")
    .select("id, community_id")
    .eq("id", postId)
    .single();

  if (
    !post ||
    !canModerateCommunityResource({
      renownTier,
      moderatorCommunityId: communityId,
      resourceCommunityId: post.community_id,
    })
  ) {
    return { success: false as const, error: "Post not found" };
  }

  const { error: updateError } = await admin
    .from("posts")
    .update({ hidden: false, flag_count: 0 })
    .eq("id", postId)
    .eq("community_id", communityId);

  if (updateError) {
    return { success: false as const, error: "Failed to unhide post" };
  }

  // Audit log
  await admin.from("audit_log").insert({
    user_id: userId,
    action: "unhide_post",
    resource_type: "post",
    resource_id: postId,
  });

  return { success: true as const, data: null };
}
