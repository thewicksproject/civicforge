import Link from "next/link";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { BoardContent } from "@/components/board-content";
import { QuestBoard } from "@/components/quest-board";
import { BoardTabs } from "@/components/board-tabs";
import { EmptyBoardIllustration } from "@/components/illustrations";

export const metadata = { title: "Hearthboard" };

export default async function BoardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const activeTab = tab === "quests" ? "quests" : "posts";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Use service client to bypass self-referencing RLS policy on profiles
  const admin = createServiceClient();

  // Get user's profile to know their neighborhood
  const { data: profile } = await admin
    .from("profiles")
    .select("neighborhood_id, trust_tier, renown_tier")
    .eq("id", user!.id)
    .single();

  if (!profile?.neighborhood_id) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold mb-2">
          Welcome to CivicForge
        </h2>
        <p className="text-muted-foreground mb-6">
          Join a neighborhood to see the needs board.
        </p>
        <Link
          href="/onboarding"
          className="inline-flex rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Complete Setup
        </Link>
      </div>
    );
  }

  // Fetch posts for user's neighborhood
  const { data: posts } = await admin
    .from("posts")
    .select(
      `
      id, type, title, description, category, urgency, status, created_at, flag_count, hidden, ai_assisted,
      author:profiles!author_id (display_name, reputation_score, trust_tier),
      post_photos (id),
      responses (id)
    `
    )
    .eq("neighborhood_id", profile.neighborhood_id)
    .eq("hidden", false)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(50);

  // Fetch quests for user's neighborhood
  const { data: quests } = await admin
    .from("quests")
    .select(`
      id, title, description, difficulty, status, skill_domains,
      xp_reward, max_party_size, is_emergency, created_at,
      created_by, profiles!quests_created_by_fkey(display_name, avatar_url, renown_tier)
    `)
    .eq("neighborhood_id", profile.neighborhood_id)
    .in("status", ["open", "claimed", "in_progress", "pending_validation"])
    .order("created_at", { ascending: false })
    .limit(50);

  const canPost = profile.trust_tier >= 2;
  const canCreateQuest = profile.trust_tier >= 2;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Hearthboard</h1>
          <p className="text-sm text-muted-foreground">
            What&apos;s happening in your neighborhood
          </p>
        </div>
        <div className="flex gap-2">
          {canPost && activeTab === "posts" && (
            <Link
              href="/post/new"
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              New Post
            </Link>
          )}
          {canCreateQuest && activeTab === "quests" && (
            <Link
              href="/board/quest/new"
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              New Quest
            </Link>
          )}
        </div>
      </div>

      {/* Tab navigation */}
      <BoardTabs
        activeTab={activeTab}
        postCount={posts?.length ?? 0}
        questCount={quests?.length ?? 0}
      />

      {/* Tab content */}
      {activeTab === "posts" ? (
        posts && posts.length > 0 ? (
          <BoardContent posts={posts} />
        ) : (
          <div className="text-center py-16 rounded-xl border border-dashed border-border">
            <EmptyBoardIllustration className="h-32 w-auto mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-1">
              Your board is quiet — for now
            </h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
              Be the first to post a need or offer. Every community starts with
              one spark.
            </p>
            {canPost && (
              <Link
                href="/post/new"
                className="inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Create First Post
              </Link>
            )}
            {!canPost && (
              <p className="text-xs text-muted-foreground">
                Get an invitation code from a neighbor to start posting.
              </p>
            )}
          </div>
        )
      ) : quests && quests.length > 0 ? (
        <QuestBoard quests={quests} />
      ) : (
        <div className="text-center py-16 rounded-xl border border-dashed border-border">
          <h3 className="text-lg font-semibold mb-1">
            No quests yet
          </h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
            Quests are structured tasks with clear completion criteria and XP rewards.
            Create the first one for your neighborhood.
          </p>
          {canCreateQuest && (
            <Link
              href="/board/quest/new"
              className="inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Create First Quest
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
