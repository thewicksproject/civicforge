"use server";

import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { UUID_FORMAT } from "@/lib/utils";

const StorySchema = z.object({
  story: z
    .string()
    .min(10, "Tell us a bit more about what happened (at least 10 characters)")
    .max(2000, "Story must be under 2000 characters"),
});

export async function createCompletionStory(postId: string, story: string) {
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

  const parsed = StorySchema.safeParse({ story });
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0].message };
  }

  const admin = createServiceClient();

  // Verify user is the post author
  const { data: post } = await admin
    .from("posts")
    .select("author_id, status")
    .eq("id", postId)
    .single();

  if (!post) {
    return { success: false as const, error: "Post not found" };
  }

  if (post.author_id !== user.id) {
    return { success: false as const, error: "Only the post author can share a completion story" };
  }

  // Check if a story already exists
  const { data: existing } = await admin
    .from("completion_stories")
    .select("id")
    .eq("post_id", postId)
    .single();

  if (existing) {
    return { success: false as const, error: "A story has already been shared for this post" };
  }

  // Create the story
  const { error: insertError } = await admin
    .from("completion_stories")
    .insert({
      post_id: postId,
      author_id: user.id,
      story: parsed.data.story,
    });

  if (insertError) {
    return { success: false as const, error: "Failed to save story" };
  }

  // Mark post as completed
  await admin
    .from("posts")
    .update({ status: "completed" })
    .eq("id", postId);

  return { success: true as const };
}

export async function getStoryForPost(postId: string) {
  const admin = createServiceClient();

  const { data } = await admin
    .from("completion_stories")
    .select("id, story, photo_url, created_at, author:profiles!author_id(display_name)")
    .eq("post_id", postId)
    .single();

  return data;
}

export async function getStoriesForUser(userId: string, limit = 10) {
  const admin = createServiceClient();

  const { data } = await admin
    .from("completion_stories")
    .select(`
      id, story, photo_url, created_at,
      post:posts!post_id(id, title, type)
    `)
    .eq("author_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return data ?? [];
}

export async function getStoriesForCommunity(communityId: string, limit = 20) {
  const admin = createServiceClient();

  const { data } = await admin
    .from("completion_stories")
    .select(`
      id, story, photo_url, created_at,
      author:profiles!author_id(display_name),
      post:posts!post_id!inner(id, title, type, community_id)
    `)
    .eq("post.community_id", communityId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return data ?? [];
}
