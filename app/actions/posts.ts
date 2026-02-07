"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { POST_CATEGORIES, NEW_ACCOUNT_REVIEW_POST_COUNT } from "@/lib/types";
import { moderateContent } from "@/lib/ai/client";

const validCategories = POST_CATEGORIES.map((c) => c.value);

const PostSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must be at most 100 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must be at most 2000 characters"),
  type: z.enum(["need", "offer"] as const),
  category: z.enum(validCategories as [string, ...string[]]),
  urgency: z.enum(["low", "medium", "high"] as const).optional(),
  location_hint: z.string().max(200).optional(),
  available_times: z.string().max(500).optional(),
});

export async function createPost(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "You must be logged in" };
  }

  const raw = {
    title: formData.get("title"),
    description: formData.get("description"),
    type: formData.get("type"),
    category: formData.get("category"),
    urgency: formData.get("urgency") || undefined,
    location_hint: formData.get("location_hint") || undefined,
    available_times: formData.get("available_times") || undefined,
  };

  const parsed = PostSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0].message };
  }

  // Check trust tier
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("trust_tier, neighborhood_id")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return { success: false as const, error: "Profile not found" };
  }

  if (profile.trust_tier < 2) {
    return {
      success: false as const,
      error: "You must be Tier 2 or higher to create posts",
    };
  }

  if (!profile.neighborhood_id) {
    return {
      success: false as const,
      error: "You must belong to a neighborhood to create posts",
    };
  }

  // Content moderation — fail open on API errors
  try {
    const moderation = await moderateContent(
      `${parsed.data.title} ${parsed.data.description}`
    );
    if (!moderation.safe) {
      return {
        success: false as const,
        error: `Content flagged: ${moderation.reason ?? "Violates community guidelines"}`,
      };
    }
  } catch {
    // Fail open — don't block users if moderation API is down
  }

  // Check if AI-assisted
  const aiAssisted = formData.get("ai_assisted") === "true";

  // Determine review status for new accounts
  let reviewStatus: "none" | "pending_review" = "none";
  const { count } = await supabase
    .from("posts")
    .select("id", { count: "exact", head: true })
    .eq("author_id", user.id);

  if ((count ?? 0) < NEW_ACCOUNT_REVIEW_POST_COUNT) {
    reviewStatus = "pending_review";
  }

  const { data: post, error: insertError } = await supabase
    .from("posts")
    .insert({
      author_id: user.id,
      neighborhood_id: profile.neighborhood_id,
      title: parsed.data.title,
      description: parsed.data.description,
      type: parsed.data.type,
      category: parsed.data.category,
      urgency: parsed.data.urgency ?? null,
      location_hint: parsed.data.location_hint ?? null,
      available_times: parsed.data.available_times ?? null,
      ai_assisted: aiAssisted,
      review_status: reviewStatus,
    })
    .select()
    .single();

  if (insertError) {
    return { success: false as const, error: "Failed to create post" };
  }

  return { success: true as const, data: post };
}

export async function updatePost(postId: string, formData: FormData) {
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

  const raw = {
    title: formData.get("title"),
    description: formData.get("description"),
    type: formData.get("type"),
    category: formData.get("category"),
    urgency: formData.get("urgency") || undefined,
    location_hint: formData.get("location_hint") || undefined,
    available_times: formData.get("available_times") || undefined,
  };

  const parsed = PostSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0].message };
  }

  // Verify ownership
  const { data: existing, error: fetchError } = await supabase
    .from("posts")
    .select("author_id")
    .eq("id", postId)
    .single();

  if (fetchError || !existing) {
    return { success: false as const, error: "Post not found" };
  }

  if (existing.author_id !== user.id) {
    return { success: false as const, error: "You can only edit your own posts" };
  }

  // Content moderation — fail open on API errors
  try {
    const moderation = await moderateContent(
      `${parsed.data.title} ${parsed.data.description}`
    );
    if (!moderation.safe) {
      return {
        success: false as const,
        error: `Content flagged: ${moderation.reason ?? "Violates community guidelines"}`,
      };
    }
  } catch {
    // Fail open — don't block users if moderation API is down
  }

  const { data: post, error: updateError } = await supabase
    .from("posts")
    .update({
      title: parsed.data.title,
      description: parsed.data.description,
      type: parsed.data.type,
      category: parsed.data.category,
      urgency: parsed.data.urgency ?? null,
      location_hint: parsed.data.location_hint ?? null,
      available_times: parsed.data.available_times ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", postId)
    .select()
    .single();

  if (updateError) {
    return { success: false as const, error: "Failed to update post" };
  }

  return { success: true as const, data: post };
}

export async function deletePost(postId: string) {
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

  // Verify ownership
  const { data: existing, error: fetchError } = await supabase
    .from("posts")
    .select("author_id")
    .eq("id", postId)
    .single();

  if (fetchError || !existing) {
    return { success: false as const, error: "Post not found" };
  }

  if (existing.author_id !== user.id) {
    return {
      success: false as const,
      error: "You can only delete your own posts",
    };
  }

  const { error: deleteError } = await supabase
    .from("posts")
    .delete()
    .eq("id", postId);

  if (deleteError) {
    return { success: false as const, error: "Failed to delete post" };
  }

  return { success: true as const, data: null };
}

export async function getNeighborhoodPosts(neighborhoodId: string) {
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

  const { data: posts, error } = await supabase
    .from("posts")
    .select(
      `
      *,
      author:profiles!author_id (
        id,
        display_name,
        avatar_url,
        trust_tier,
        reputation_score
      )
    `
    )
    .eq("neighborhood_id", neighborhoodId)
    .eq("hidden", false)
    .order("created_at", { ascending: false });

  if (error) {
    return { success: false as const, error: "Failed to fetch posts" };
  }

  return { success: true as const, data: posts };
}
