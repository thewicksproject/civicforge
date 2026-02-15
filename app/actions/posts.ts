"use server";

import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import {
  POST_CATEGORIES,
  NEW_ACCOUNT_REVIEW_POST_COUNT,
  MAX_PHOTOS_PER_POST,
} from "@/lib/types";
import { UUID_FORMAT } from "@/lib/utils";
import { moderateContent } from "@/lib/ai/client";
import {
  resolveAppEnv,
  shouldFailClosedOnSafetyFailure,
} from "@/lib/security/runtime-policy";

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

  // Use service client to bypass RLS for profile queries
  // (user already verified via getUser above)
  const admin = createServiceClient();

  // Check renown tier
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("renown_tier, community_id")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return { success: false as const, error: "Profile not found" };
  }

  if (profile.renown_tier < 2) {
    return {
      success: false as const,
      error: "You must be Tier 2 or higher to create posts",
    };
  }

  if (!profile.community_id) {
    return {
      success: false as const,
      error: "You must belong to a community to create posts",
    };
  }

  const appEnv = resolveAppEnv();
  const failClosedOnSafetyFailure = shouldFailClosedOnSafetyFailure();

  // Content moderation.
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
  } catch (error) {
    console.error(
      JSON.stringify({
        event: "safety_provider_unavailable",
        endpoint: "app/actions/posts#createPost",
        provider: "anthropic_moderation",
        appEnv,
        failMode: failClosedOnSafetyFailure ? "closed" : "open",
        reason: "moderation_error",
        message: error instanceof Error ? error.message : "unknown",
      })
    );
    if (failClosedOnSafetyFailure) {
      return {
        success: false as const,
        error:
          "Safety service unavailable. Please try again in a few minutes.",
      };
    }
  }

  // Check if AI-assisted
  const aiAssisted = formData.get("ai_assisted") === "true";

  const normalizeStoragePath = (value: string): string | null => {
    const trimmed = value.trim();
    if (!trimmed) return null;

    if (!trimmed.includes("://")) {
      return trimmed;
    }

    try {
      const parsed = new URL(trimmed);
      const parts = parsed.pathname.split("/post-photos/");
      if (parts.length !== 2) return null;
      const path = parts[1];
      if (!path) return null;
      const cleanPath = path.split("?")[0];
      return cleanPath || null;
    } catch {
      return null;
    }
  };

  const rawPhotoPaths = formData
    .getAll("photo_urls")
    .filter((value): value is string => typeof value === "string");
  const rawThumbPaths = formData
    .getAll("photo_thumbnail_urls")
    .filter((value): value is string => typeof value === "string");

  if (rawPhotoPaths.length !== rawThumbPaths.length) {
    return {
      success: false as const,
      error: "Photo upload data is incomplete. Please re-upload your photos.",
    };
  }

  if (rawPhotoPaths.length > MAX_PHOTOS_PER_POST) {
    return {
      success: false as const,
      error: `You can upload up to ${MAX_PHOTOS_PER_POST} photos per post.`,
    };
  }

  const photoPaths = rawPhotoPaths.map(normalizeStoragePath);
  const thumbPaths = rawThumbPaths.map(normalizeStoragePath);

  if (photoPaths.some((path) => !path) || thumbPaths.some((path) => !path)) {
    return {
      success: false as const,
      error: "One or more uploaded photos are invalid. Please upload again.",
    };
  }

  const imagePathPattern = new RegExp(`^${user.id}/\\d+\\.jpg$`);
  const thumbPathPattern = new RegExp(`^${user.id}/\\d+_thumb\\.jpg$`);

  for (let i = 0; i < photoPaths.length; i++) {
    const imagePath = photoPaths[i]!;
    const thumbnailPath = thumbPaths[i]!;

    if (!imagePathPattern.test(imagePath) || !thumbPathPattern.test(thumbnailPath)) {
      return {
        success: false as const,
        error: "Uploaded photo paths are invalid for this account.",
      };
    }
  }

  // Determine review status for new accounts
  let reviewStatus: "none" | "pending_review" = "none";
  const { count } = await admin
    .from("posts")
    .select("id", { count: "exact", head: true })
    .eq("author_id", user.id);

  if ((count ?? 0) < NEW_ACCOUNT_REVIEW_POST_COUNT) {
    reviewStatus = "pending_review";
  }

  const { data: post, error: insertError } = await admin
    .from("posts")
    .insert({
      author_id: user.id,
      community_id: profile.community_id,
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

  if (photoPaths.length > 0) {
    const photoRows = photoPaths.map((path, index) => ({
      post_id: post.id,
      url: path,
      thumbnail_url: thumbPaths[index]!,
      uploaded_by: user.id,
    }));

    const { error: photoInsertError } = await admin
      .from("post_photos")
      .insert(photoRows);

    if (photoInsertError) {
      // Keep data consistent if photo attachment fails.
      await admin.from("posts").delete().eq("id", post.id);
      return { success: false as const, error: "Failed to attach uploaded photos" };
    }
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

  const idParsed = z.string().regex(UUID_FORMAT).safeParse(postId);
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

  const admin = createServiceClient();

  // Verify ownership
  const { data: existing, error: fetchError } = await admin
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

  const appEnv = resolveAppEnv();
  const failClosedOnSafetyFailure = shouldFailClosedOnSafetyFailure();

  // Content moderation.
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
  } catch (error) {
    console.error(
      JSON.stringify({
        event: "safety_provider_unavailable",
        endpoint: "app/actions/posts#updatePost",
        provider: "anthropic_moderation",
        appEnv,
        failMode: failClosedOnSafetyFailure ? "closed" : "open",
        reason: "moderation_error",
        message: error instanceof Error ? error.message : "unknown",
      })
    );
    if (failClosedOnSafetyFailure) {
      return {
        success: false as const,
        error:
          "Safety service unavailable. Please try again in a few minutes.",
      };
    }
  }

  const { data: post, error: updateError } = await admin
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

  const idParsed = z.string().regex(UUID_FORMAT).safeParse(postId);
  if (!idParsed.success) {
    return { success: false as const, error: "Invalid post ID" };
  }

  const admin = createServiceClient();

  // Verify ownership
  const { data: existing, error: fetchError } = await admin
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

  const { error: deleteError } = await admin
    .from("posts")
    .delete()
    .eq("id", postId);

  if (deleteError) {
    return { success: false as const, error: "Failed to delete post" };
  }

  return { success: true as const, data: null };
}

export async function getCommunityPosts(communityId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "You must be logged in" };
  }

  const idParsed = z.string().regex(UUID_FORMAT).safeParse(communityId);
  if (!idParsed.success) {
    return { success: false as const, error: "Invalid community ID" };
  }

  const admin = createServiceClient();

  const { data: userProfile, error: profileError } = await admin
    .from("profiles")
    .select("community_id")
    .eq("id", user.id)
    .single();

  if (profileError || !userProfile?.community_id) {
    return { success: false as const, error: "Profile not found" };
  }

  if (userProfile.community_id !== communityId) {
    return { success: false as const, error: "Not your community" };
  }

  const { data: posts, error } = await admin
    .from("posts")
    .select(
      `
      *,
      author:profiles!author_id (
        id,
        display_name,
        avatar_url,
        renown_tier,
        reputation_score
      )
    `
    )
    .eq("community_id", communityId)
    .eq("hidden", false)
    .order("created_at", { ascending: false });

  if (error) {
    return { success: false as const, error: "Failed to fetch posts" };
  }

  return { success: true as const, data: posts };
}
