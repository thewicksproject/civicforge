"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

async function requireTier3() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase: null, userId: null, error: "You must be logged in" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("trust_tier")
    .eq("id", user.id)
    .single();

  if (!profile || profile.trust_tier < 3) {
    return { supabase: null, userId: null, error: "Admin access required" };
  }

  return { supabase, userId: user.id, error: null };
}

export async function reviewPost(
  postId: string,
  decision: "approved" | "rejected"
) {
  const { supabase, userId, error } = await requireTier3();
  if (error || !supabase || !userId) {
    return { success: false as const, error: error ?? "Unauthorized" };
  }

  const idParsed = z.string().uuid().safeParse(postId);
  if (!idParsed.success) {
    return { success: false as const, error: "Invalid post ID" };
  }

  const decisionParsed = z
    .enum(["approved", "rejected"])
    .safeParse(decision);
  if (!decisionParsed.success) {
    return { success: false as const, error: "Invalid decision" };
  }

  const updateData: Record<string, unknown> = {
    review_status: decisionParsed.data,
  };

  // If rejected, also hide the post
  if (decisionParsed.data === "rejected") {
    updateData.hidden = true;
  }

  const { error: updateError } = await supabase
    .from("posts")
    .update(updateData)
    .eq("id", postId);

  if (updateError) {
    return { success: false as const, error: "Failed to update post" };
  }

  // Audit log
  await supabase.from("audit_log").insert({
    user_id: userId,
    action: `review_post_${decisionParsed.data}`,
    resource_type: "post",
    resource_id: postId,
  });

  return { success: true as const, data: null };
}

export async function unhidePost(postId: string) {
  const { supabase, userId, error } = await requireTier3();
  if (error || !supabase || !userId) {
    return { success: false as const, error: error ?? "Unauthorized" };
  }

  const idParsed = z.string().uuid().safeParse(postId);
  if (!idParsed.success) {
    return { success: false as const, error: "Invalid post ID" };
  }

  const { error: updateError } = await supabase
    .from("posts")
    .update({ hidden: false, flag_count: 0 })
    .eq("id", postId);

  if (updateError) {
    return { success: false as const, error: "Failed to unhide post" };
  }

  // Audit log
  await supabase.from("audit_log").insert({
    user_id: userId,
    action: "unhide_post",
    resource_type: "post",
    resource_id: postId,
  });

  return { success: true as const, data: null };
}
