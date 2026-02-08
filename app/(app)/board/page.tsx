import Link from "next/link";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { PostCard } from "@/components/post-card";
import type { TrustTier } from "@/lib/types";

export const metadata = { title: "Needs Board" };

export default async function BoardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Use service client to bypass self-referencing RLS policy on profiles
  const admin = createServiceClient();

  // Get user's profile to know their neighborhood
  const { data: profile } = await admin
    .from("profiles")
    .select("neighborhood_id, trust_tier")
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

  const canPost = profile.trust_tier >= 2;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Needs Board</h1>
          <p className="text-sm text-muted-foreground">
            What&apos;s happening in your neighborhood
          </p>
        </div>
        {canPost && (
          <Link
            href="/post/new"
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            New Post
          </Link>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {[
          { label: "All", value: "all" },
          { label: "Needs", value: "need" },
          { label: "Offers", value: "offer" },
        ].map((filter) => (
          <button
            key={filter.value}
            className="rounded-full px-4 py-1.5 text-sm font-medium border border-border bg-card hover:bg-muted transition-colors whitespace-nowrap"
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Posts grid */}
      {posts && posts.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {posts.map((post) => {
            const author = Array.isArray(post.author)
              ? post.author[0]
              : post.author;
            return (
              <PostCard
                key={post.id}
                id={post.id}
                type={post.type as "need" | "offer"}
                title={post.title}
                description={post.description}
                category={post.category}
                authorName={author?.display_name ?? "Anonymous"}
                authorReputation={author?.reputation_score ?? 0}
                authorTrustTier={(author?.trust_tier ?? 1) as TrustTier}
                responseCount={post.responses?.length ?? 0}
                photoCount={post.post_photos?.length ?? 0}
                createdAt={post.created_at}
                urgency={post.urgency as "low" | "medium" | "high" | null}
                aiAssisted={post.ai_assisted}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 rounded-xl border border-dashed border-border">
          <div className="text-4xl mb-3">🏘️</div>
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
      )}
    </div>
  );
}
