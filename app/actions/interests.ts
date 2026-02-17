"use server";

import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { UUID_FORMAT } from "@/lib/utils";

export async function toggleInterest(postId: string) {
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

  // Check if user already expressed interest
  const { data: existing } = await admin
    .from("post_interests")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .single();

  if (existing) {
    // Remove interest
    await admin
      .from("post_interests")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", user.id);
    return { success: true as const, interested: false };
  } else {
    // Add interest
    const { error } = await admin
      .from("post_interests")
      .insert({ post_id: postId, user_id: user.id });

    if (error) {
      return { success: false as const, error: "Failed to register interest" };
    }
    return { success: true as const, interested: true };
  }
}

export async function getInterestData(postId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admin = createServiceClient();

  const { count } = await admin
    .from("post_interests")
    .select("id", { count: "exact", head: true })
    .eq("post_id", postId);

  let isInterested = false;
  if (user) {
    const { data } = await admin
      .from("post_interests")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", user.id)
      .single();
    isInterested = !!data;
  }

  return { count: count ?? 0, isInterested };
}
