import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { BoardContent } from "@/components/board-content";
import { ActivityFeed } from "@/components/activity-feed";
import { StoryCard } from "@/components/story-card";
import { EmptyBoardIllustration } from "@/components/illustrations";
import { getCommunityActivity } from "@/app/actions/activity";
import { getStoriesForCommunity } from "@/app/actions/stories";
import { getWelcomeContext } from "@/app/actions/onboarding-guide";
import { WelcomeBanner } from "@/components/welcome-banner";

export const metadata = { title: "Community Board" };

export default async function BoardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Use service client to bypass self-referencing RLS policy on profiles
  const admin = createServiceClient();

  // Get user's profile and community name
  const { data: profile } = await admin
    .from("profiles")
    .select("community_id, renown_tier, community:communities!community_id(name)")
    .eq("id", user.id)
    .single();

  if (!profile?.community_id) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold mb-2">
          Welcome to CivicForge
        </h2>
        <p className="text-muted-foreground mb-6">
          Join a community to see the board.
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

  // Fetch posts for user's community
  const { data: posts } = await admin
    .from("posts")
    .select(
      `
      id, type, title, description, category, urgency, status, created_at, flag_count, hidden, ai_assisted, view_count,
      author:profiles!author_id (display_name),
      post_photos (id, thumbnail_url),
      responses (id),
      post_interests (id)
    `
    )
    .eq("community_id", profile.community_id)
    .eq("hidden", false)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(50);

  const canPost = (profile.renown_tier ?? 1) >= 2;

  // Fetch community activity feed + stories + welcome context in parallel
  const [activity, stories, welcomeCtx] = await Promise.all([
    getCommunityActivity(profile.community_id),
    getStoriesForCommunity(profile.community_id, 3),
    getWelcomeContext(user.id),
  ]);

  const communityRaw = profile.community as { name: string } | { name: string }[] | null;
  const communityName = Array.isArray(communityRaw)
    ? communityRaw[0]?.name
    : communityRaw?.name;

  // Sign first thumbnail URL for each post that has photos (private bucket)
  const postsWithSignedThumbs = posts
    ? await Promise.all(
        posts.map(async (post) => {
          const firstPhoto = post.post_photos?.[0];
          if (!firstPhoto?.thumbnail_url || firstPhoto.thumbnail_url.startsWith("http")) {
            return post;
          }
          const { data } = await supabase.storage
            .from("post-photos")
            .createSignedUrl(firstPhoto.thumbnail_url, 3600);
          return {
            ...post,
            post_photos: data?.signedUrl
              ? [{ ...firstPhoto, thumbnail_url: data.signedUrl }, ...post.post_photos.slice(1)]
              : post.post_photos,
          };
        })
      )
    : null;

  return (
    <div>
      {/* Welcome banner for new users */}
      {welcomeCtx.shouldShow && (
        <WelcomeBanner
          inviterName={welcomeCtx.inviterName}
          communityName={welcomeCtx.communityName}
          suggestedPosts={welcomeCtx.suggestedPosts}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">{communityName ?? "Community Board"}</h1>
          <p className="text-sm text-muted-foreground">
            What&apos;s happening in {communityName ?? "your community"}
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

      {/* Activity feed — above posts so Sarah sees common-knowledge signals first */}
      {activity.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Recent Activity</h2>
          <div className="rounded-xl border border-border bg-card px-4">
            <ActivityFeed items={activity.slice(0, 5)} />
          </div>
        </section>
      )}

      {/* Community Stories — narrative reward for completed quests */}
      {stories.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Community Stories</h2>
          <div className="space-y-3">
            {stories.map((s) => {
              const post = Array.isArray(s.post) ? s.post[0] : s.post;
              const author = Array.isArray(s.author) ? s.author[0] : s.author;
              return (
                <StoryCard
                  key={s.id}
                  story={s.story}
                  authorName={author?.display_name ?? "Someone"}
                  createdAt={s.created_at}
                  postTitle={post?.title}
                  postId={post?.id}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* Posts */}
      {postsWithSignedThumbs && postsWithSignedThumbs.length > 0 ? (
        <BoardContent posts={postsWithSignedThumbs} />
      ) : (
        <div className="text-center py-12 rounded-xl border border-dashed border-border">
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
      )}
    </div>
  );
}
