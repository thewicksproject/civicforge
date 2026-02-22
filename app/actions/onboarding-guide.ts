"use server";

import { createClient, createServiceClient } from "@/lib/supabase/server";

interface WelcomeContext {
  inviterName: string | null;
  communityName: string | null;
  suggestedPosts: Array<{
    id: string;
    title: string;
    type: string;
    category: string;
  }>;
  shouldShow: boolean;
}

export async function getWelcomeContext(userId: string): Promise<WelcomeContext> {
  const admin = createServiceClient();

  const noShow: WelcomeContext = {
    inviterName: null,
    communityName: null,
    suggestedPosts: [],
    shouldShow: false,
  };

  // Get profile with community
  const { data: profile } = await admin
    .from("profiles")
    .select("community_id, skills, preferences, created_at, community:communities!community_id(name)")
    .eq("id", userId)
    .single();

  if (!profile?.community_id) return noShow;

  // Check if banner should show: profile age < 7 days AND not dismissed
  const profileAge = Date.now() - new Date(profile.created_at).getTime();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  const prefs = (profile.preferences ?? {}) as Record<string, unknown>;
  if (profileAge > sevenDays || prefs.welcome_dismissed === true) {
    return noShow;
  }

  const communityRaw = profile.community as { name: string } | { name: string }[] | null;
  const communityName = Array.isArray(communityRaw)
    ? communityRaw[0]?.name ?? null
    : communityRaw?.name ?? null;

  // Find inviter: join invitation_usages -> invitations -> profiles
  let inviterName: string | null = null;
  const { data: usage } = await admin
    .from("invitation_usages")
    .select("invitation_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (usage) {
    const { data: invitation } = await admin
      .from("invitations")
      .select("created_by, profiles!invitations_created_by_fkey(display_name)")
      .eq("id", usage.invitation_id)
      .single();

    if (invitation) {
      const inviterProfile = Array.isArray(invitation.profiles)
        ? invitation.profiles[0]
        : invitation.profiles;
      inviterName = (inviterProfile as { display_name: string } | null)?.display_name ?? null;
    }
  }

  // Find suggested posts based on user skills
  const userSkills = profile.skills ?? [];
  let suggestedPosts: WelcomeContext["suggestedPosts"] = [];

  if (userSkills.length > 0) {
    // Find active posts in user's community that match their skills
    const { data: posts } = await admin
      .from("posts")
      .select("id, title, type, category, skills_relevant")
      .eq("community_id", profile.community_id)
      .eq("status", "active")
      .eq("hidden", false)
      .order("created_at", { ascending: false })
      .limit(20);

    if (posts && posts.length > 0) {
      // Score posts by skill overlap
      const scored = posts.map((post) => {
        const postSkills = (post.skills_relevant ?? []).map((s: string) =>
          s.toLowerCase(),
        );
        const overlap = userSkills.filter((skill: string) =>
          postSkills.some(
            (ps: string) => ps.includes(skill.toLowerCase()) || skill.toLowerCase().includes(ps),
          ),
        ).length;
        return { ...post, score: overlap };
      });

      suggestedPosts = scored
        .filter((p) => p.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(({ id, title, type, category }) => ({ id, title, type, category }));
    }
  }

  return {
    inviterName,
    communityName,
    suggestedPosts,
    shouldShow: true,
  };
}

export async function dismissWelcomeBanner() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "Unauthorized" };
  }

  const admin = createServiceClient();

  // Get current preferences
  const { data: profile } = await admin
    .from("profiles")
    .select("preferences")
    .eq("id", user.id)
    .single();

  const currentPrefs = (profile?.preferences ?? {}) as Record<string, unknown>;
  const newPrefs = { ...currentPrefs, welcome_dismissed: true };

  await admin
    .from("profiles")
    .update({ preferences: newPrefs })
    .eq("id", user.id);

  return { success: true as const };
}
