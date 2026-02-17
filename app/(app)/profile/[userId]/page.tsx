import { notFound, redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { ThanksButton } from "@/components/thanks-button";
import { StoryCard } from "@/components/story-card";
import { getStoriesForUser } from "@/app/actions/stories";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const admin = createServiceClient();
  const { data } = await admin
    .from("profiles")
    .select("display_name")
    .eq("id", userId)
    .single();
  return { title: data?.display_name ?? "Profile" };
}

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const admin = createServiceClient();

  const { data: viewerProfile } = await admin
    .from("profiles")
    .select("community_id")
    .eq("id", user.id)
    .single();

  if (!viewerProfile?.community_id) notFound();

  const { data: profile } = await admin
    .from("profiles")
    .select("id, display_name, bio, skills, privacy_tier, created_at, community_id")
    .eq("id", userId)
    .single();

  if (!profile) notFound();

  const isOwnProfile = user.id === userId;
  if (!isOwnProfile && profile.community_id !== viewerProfile.community_id) {
    notFound();
  }
  const privacyTier = profile.privacy_tier ?? "quiet";

  // Privacy tier enforcement
  const showBio = isOwnProfile || privacyTier === "open" || privacyTier === "mentor";
  const showSkills = isOwnProfile || privacyTier === "open" || privacyTier === "mentor";

  // Get their recent posts (public)
  const { data: posts } = await admin
    .from("posts")
    .select("id, title, type, status, created_at")
    .eq("author_id", userId)
    .eq("hidden", false)
    .order("created_at", { ascending: false })
    .limit(5);

  // Get their stories (only if privacy allows)
  const showStories = isOwnProfile || privacyTier === "open" || privacyTier === "mentor";
  const userStories = showStories ? await getStoriesForUser(userId, 5) : [];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="rounded-xl border border-border bg-card p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-semibold flex-shrink-0">
              {profile.display_name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-semibold">
                {profile.display_name}
              </h1>
              {/* Ghost tier: privacy message */}
              {!isOwnProfile && privacyTier === "ghost" && (
                <p className="text-sm text-muted-foreground mt-2 italic">
                  This member prefers privacy
                </p>
              )}
              {showBio && profile.bio && (
                <p className="text-sm text-muted-foreground mt-2">
                  {profile.bio}
                </p>
              )}
              {showSkills && profile.skills && profile.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {profile.skills.map((skill: string) => (
                    <span
                      key={skill}
                      className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          {!isOwnProfile && (
            <div className="flex flex-col gap-2 items-end flex-shrink-0">
              <ThanksButton toUserId={profile.id} postId={null} />
            </div>
          )}
        </div>
      </div>

      {/* Recent posts */}
      {posts && posts.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Recent Activity</h2>
          <div className="space-y-2">
            {posts.map((post) => (
              <a
                key={post.id}
                href={`/board/${post.id}`}
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 hover:bg-muted/50 transition-colors"
              >
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    post.type === "need"
                      ? "bg-need-light text-need"
                      : "bg-offer-light text-offer"
                  }`}
                >
                  {post.type === "need" ? "Need" : "Offer"}
                </span>
                <span className="text-sm font-medium">{post.title}</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Their stories */}
      {userStories.length > 0 && (
        <section className="mt-6">
          <h2 className="text-lg font-semibold mb-3">
            {isOwnProfile ? "Your Stories" : "Their Stories"}
          </h2>
          <div className="space-y-3">
            {userStories.map((s) => {
              const post = Array.isArray(s.post) ? s.post[0] : s.post;
              return (
                <StoryCard
                  key={s.id}
                  story={s.story}
                  authorName={profile.display_name ?? "Someone"}
                  createdAt={s.created_at}
                  postTitle={post?.title}
                  postId={post?.id}
                />
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
