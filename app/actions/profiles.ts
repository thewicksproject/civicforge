"use server";

import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { UUID_FORMAT } from "@/lib/utils";

const UpdateProfileSchema = z.object({
  display_name: z
    .string()
    .min(2, "Display name must be at least 2 characters")
    .max(50, "Display name must be at most 50 characters"),
  bio: z
    .string()
    .max(500, "Bio must be at most 500 characters")
    .optional()
    .default(""),
  skills: z
    .string()
    .max(1000, "Skills text is too long")
    .optional()
    .default(""),
});

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "You must be logged in" };
  }

  const raw = {
    display_name: formData.get("display_name"),
    bio: formData.get("bio") || "",
    skills: formData.get("skills") || "",
  };

  const parsed = UpdateProfileSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0].message };
  }

  // Parse comma-separated skills into array, trimming whitespace and filtering empties
  const skillsArray = parsed.data.skills
    ? parsed.data.skills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
    : [];

  // Use service client to bypass RLS for profile operations
  // (user already verified via getUser above)
  const admin = createServiceClient();

  const { data: existingProfile, error: existingProfileError } = await admin
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (existingProfileError || !existingProfile) {
    return { success: false as const, error: "Profile not found" };
  }

  const updateData: Record<string, unknown> = {
    display_name: parsed.data.display_name,
    bio: parsed.data.bio || null,
    skills: skillsArray,
    updated_at: new Date().toISOString(),
  };

  const { data: profile, error: updateError } = await admin
    .from("profiles")
    .update(updateData)
    .eq("id", user.id)
    .select()
    .single();

  if (updateError) {
    return { success: false as const, error: "Failed to update profile" };
  }

  return { success: true as const, data: profile };
}

export async function getProfile(userId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "You must be logged in" };
  }

  const idParsed = z.string().regex(UUID_FORMAT).safeParse(userId);
  if (!idParsed.success) {
    return { success: false as const, error: "Invalid user ID" };
  }

  const admin = createServiceClient();
  const { data: profile, error } = await admin
    .from("profiles")
    .select(
      `
      id,
      display_name,
      bio,
      skills,
      reputation_score,
      renown_tier,
      avatar_url,
      community_id,
      created_at
    `
    )
    .eq("id", userId)
    .single();

  if (error || !profile) {
    return { success: false as const, error: "Profile not found" };
  }

  return { success: true as const, data: profile };
}

export async function getMyProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "You must be logged in" };
  }

  const admin = createServiceClient();
  const { data: profile, error } = await admin
    .from("profiles")
    .select(
      `
      *,
      community:communities!community_id (
        id,
        name,
        city,
        state
      )
    `
    )
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    return { success: false as const, error: "Profile not found" };
  }

  return { success: true as const, data: profile };
}
