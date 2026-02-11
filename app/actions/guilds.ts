"use server";

import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { GUILD_CHARTER_DEFAULT_SUNSET_YEARS } from "@/lib/types";

const GuildSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(60, "Name must be at most 60 characters"),
  domain: z.enum([
    "craft",
    "green",
    "care",
    "bridge",
    "signal",
    "hearth",
    "weave",
  ] as const),
  description: z
    .string()
    .max(500, "Description must be at most 500 characters")
    .optional(),
  charter: z
    .string()
    .max(5000, "Charter must be at most 5000 characters")
    .optional(),
});

export async function createGuild(data: {
  name: string;
  domain: string;
  description?: string;
  charter?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "You must be logged in" };
  }

  const parsed = GuildSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0].message };
  }

  const admin = createServiceClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("community_id, renown_tier")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.community_id) {
    return { success: false as const, error: "Profile not found" };
  }

  // Pillar (renown_tier >= 3) required to create guilds
  if (profile.renown_tier < 3) {
    return {
      success: false as const,
      error: "You must be a Pillar (Renown Tier 3) to create guilds",
    };
  }

  // Check no existing active guild for this domain in this community
  const { data: existing } = await admin
    .from("guilds")
    .select("id")
    .eq("community_id", profile.community_id)
    .eq("domain", parsed.data.domain)
    .eq("active", true)
    .limit(1);

  if (existing && existing.length > 0) {
    return {
      success: false as const,
      error: "An active guild already exists for this domain in your community",
    };
  }

  const sunsetDate = new Date();
  sunsetDate.setFullYear(
    sunsetDate.getFullYear() + GUILD_CHARTER_DEFAULT_SUNSET_YEARS
  );

  const { data: guild, error } = await admin
    .from("guilds")
    .insert({
      community_id: profile.community_id,
      name: parsed.data.name,
      domain: parsed.data.domain,
      description: parsed.data.description ?? null,
      charter: parsed.data.charter ?? null,
      charter_sunset_at: sunsetDate.toISOString(),
      created_by: user.id,
      member_count: 0,
    })
    .select("id")
    .single();

  if (error) {
    return { success: false as const, error: "Failed to create guild" };
  }

  // Creator becomes first steward
  await admin.from("guild_members").insert({
    guild_id: guild.id,
    user_id: user.id,
    role: "steward",
    steward_term_start: new Date().toISOString(),
    consecutive_terms: 1,
  });

  // Create sunset rule
  await admin.from("sunset_rules").insert({
    community_id: profile.community_id,
    rule_type: "guild_charter",
    resource_id: guild.id,
    description: `Charter for ${parsed.data.name} guild`,
    expires_at: sunsetDate.toISOString(),
  });

  return { success: true as const, guildId: guild.id };
}

export async function joinGuild(guildId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "You must be logged in" };
  }

  const admin = createServiceClient();

  // W1: Community scoping
  const { data: userProfile } = await admin
    .from("profiles")
    .select("community_id")
    .eq("id", user.id)
    .single();

  if (!userProfile?.community_id) {
    return { success: false as const, error: "Profile not found" };
  }

  const { data: guild } = await admin
    .from("guilds")
    .select("id, active, community_id")
    .eq("id", guildId)
    .single();

  if (!guild || !guild.active) {
    return { success: false as const, error: "Guild not found or inactive" };
  }

  if (guild.community_id !== userProfile.community_id) {
    return { success: false as const, error: "Guild is not in your community" };
  }

  const { error } = await admin.from("guild_members").insert({
    guild_id: guildId,
    user_id: user.id,
  });

  if (error) {
    if (error.code === "23505") {
      return { success: false as const, error: "Already a member" };
    }
    return { success: false as const, error: "Failed to join guild" };
  }

  // W5: member_count now maintained by DB trigger (update_guild_member_count)

  return { success: true as const };
}

export async function leaveGuild(guildId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "You must be logged in" };
  }

  const admin = createServiceClient();

  const { data: membership } = await admin
    .from("guild_members")
    .select("id, role")
    .eq("guild_id", guildId)
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return { success: false as const, error: "Not a guild member" };
  }

  if (membership.role === "steward") {
    // Check if there are other stewards
    const { data: stewards } = await admin
      .from("guild_members")
      .select("id")
      .eq("guild_id", guildId)
      .eq("role", "steward");

    if (!stewards || stewards.length <= 1) {
      return {
        success: false as const,
        error: "Cannot leave — you are the only steward. Appoint another first.",
      };
    }
  }

  await admin
    .from("guild_members")
    .delete()
    .eq("guild_id", guildId)
    .eq("user_id", user.id);

  // W5: member_count now maintained by DB trigger (update_guild_member_count)

  return { success: true as const };
}

export async function getCommunityGuilds(communityId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "Unauthorized" };
  }

  const admin = createServiceClient();

  // W1: Verify user belongs to this community
  const { data: userProfile } = await admin
    .from("profiles")
    .select("community_id")
    .eq("id", user.id)
    .single();

  if (userProfile?.community_id !== communityId) {
    return { success: false as const, error: "Not your community" };
  }

  const { data: guilds, error } = await admin
    .from("guilds")
    .select(`
      id, name, domain, description, charter_sunset_at,
      member_count, active, created_at,
      created_by, profiles!guilds_created_by_fkey(display_name)
    `)
    .eq("community_id", communityId)
    .eq("active", true)
    .order("member_count", { ascending: false });

  if (error) {
    return { success: false as const, error: "Failed to load guilds" };
  }

  return { success: true as const, guilds: guilds ?? [] };
}
