"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const CreateNeighborhoodSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name must be at most 100 characters"),
  city: z
    .string()
    .min(2, "City must be at least 2 characters")
    .max(100, "City must be at most 100 characters"),
  state: z
    .string()
    .min(2, "State must be at least 2 characters")
    .max(50, "State must be at most 50 characters"),
  zip_codes: z
    .string()
    .min(5, "At least one zip code is required")
    .max(200, "Zip codes text is too long"),
  description: z
    .string()
    .max(1000, "Description must be at most 1000 characters")
    .optional()
    .default(""),
});

const SearchSchema = z
  .string()
  .min(1, "Search query must not be empty")
  .max(100, "Search query is too long");

export async function createNeighborhood(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "You must be logged in" };
  }

  const raw = {
    name: formData.get("name"),
    city: formData.get("city"),
    state: formData.get("state"),
    zip_codes: formData.get("zip_codes"),
    description: formData.get("description") || "",
  };

  const parsed = CreateNeighborhoodSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0].message };
  }

  // Check user doesn't already belong to a neighborhood
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("neighborhood_id")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return { success: false as const, error: "Profile not found" };
  }

  if (profile.neighborhood_id) {
    return {
      success: false as const,
      error: "You already belong to a neighborhood",
    };
  }

  // Parse zip codes from comma-separated string
  const zipCodes = parsed.data.zip_codes
    .split(",")
    .map((z) => z.trim())
    .filter((z) => z.length > 0);

  if (zipCodes.length === 0) {
    return {
      success: false as const,
      error: "At least one valid zip code is required",
    };
  }

  // Validate zip code format (US 5-digit)
  const zipRegex = /^\d{5}$/;
  for (const zip of zipCodes) {
    if (!zipRegex.test(zip)) {
      return {
        success: false as const,
        error: `Invalid zip code format: "${zip}". Use 5-digit US zip codes.`,
      };
    }
  }

  // Create the neighborhood
  const { data: neighborhood, error: insertError } = await supabase
    .from("neighborhoods")
    .insert({
      name: parsed.data.name,
      city: parsed.data.city,
      state: parsed.data.state,
      zip_codes: zipCodes,
      description: parsed.data.description || null,
      created_by: user.id,
    })
    .select()
    .single();

  if (insertError) {
    return { success: false as const, error: "Failed to create neighborhood" };
  }

  // Auto-promote user to Tier 2 and assign to the new neighborhood
  const { error: profileUpdateError } = await supabase
    .from("profiles")
    .update({
      neighborhood_id: neighborhood.id,
      trust_tier: 2,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (profileUpdateError) {
    console.error(
      "Failed to update creator profile after neighborhood creation:",
      profileUpdateError
    );
    // The neighborhood was created, so return it even if profile update failed
  }

  return { success: true as const, data: neighborhood };
}

export async function getNeighborhood(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "You must be logged in" };
  }

  const idParsed = z.string().uuid().safeParse(id);
  if (!idParsed.success) {
    return { success: false as const, error: "Invalid neighborhood ID" };
  }

  const { data: neighborhood, error } = await supabase
    .from("neighborhoods")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !neighborhood) {
    return { success: false as const, error: "Neighborhood not found" };
  }

  // Get member count
  const { count, error: countError } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("neighborhood_id", id);

  if (countError) {
    return {
      success: true as const,
      data: { ...neighborhood, member_count: 0 },
    };
  }

  return {
    success: true as const,
    data: { ...neighborhood, member_count: count ?? 0 },
  };
}

export async function searchNeighborhoods(query: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "You must be logged in" };
  }

  const queryParsed = SearchSchema.safeParse(query);
  if (!queryParsed.success) {
    return {
      success: false as const,
      error: queryParsed.error.issues[0].message,
    };
  }

  const searchTerm = queryParsed.data.trim();

  // Sanitize search term — strip PostgREST filter special characters
  // to prevent filter injection via .or() string interpolation
  const safeTerm = searchTerm.replace(/[%_().,\\]/g, "");
  if (safeTerm.length === 0) {
    return { success: true as const, data: [] };
  }

  // Search by name or city using ilike
  const { data: neighborhoods, error } = await supabase
    .from("neighborhoods")
    .select("*")
    .or(`name.ilike.%${safeTerm}%,city.ilike.%${safeTerm}%`)
    .order("name", { ascending: true })
    .limit(20);

  if (error) {
    return { success: false as const, error: "Failed to search neighborhoods" };
  }

  // Also check if query looks like a zip code and search zip_codes array
  const isZipLike = /^\d{3,5}$/.test(searchTerm);
  if (isZipLike) {
    const { data: zipMatches, error: zipError } = await supabase
      .from("neighborhoods")
      .select("*")
      .contains("zip_codes", [searchTerm])
      .limit(20);

    if (!zipError && zipMatches) {
      // Merge results, avoiding duplicates
      const existingIds = new Set(neighborhoods?.map((n) => n.id) ?? []);
      const combined = [...(neighborhoods ?? [])];
      for (const match of zipMatches) {
        if (!existingIds.has(match.id)) {
          combined.push(match);
        }
      }
      return { success: true as const, data: combined };
    }
  }

  return { success: true as const, data: neighborhoods ?? [] };
}
