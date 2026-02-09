import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { TRUST_TIER_LABELS, type TrustTier, type RenownTier } from "@/lib/types";
import { ReputationBadge } from "@/components/reputation-badge";
import { RenownTierBadge } from "@/components/trust-tier-badge";
import { SkillProgressCard } from "@/components/skill-progress-card";
import Link from "next/link";

export const metadata = { title: "My Profile" };

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const admin = createServiceClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Get thanks received
  const { data: thanksReceived } = await admin
    .from("thanks")
    .select("id, message, from_user, post_id, created_at, sender:profiles!from_user(display_name)")
    .eq("to_user", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  // Get user's posts
  const { data: posts } = await admin
    .from("posts")
    .select("id, title, type, status, created_at, responses(id)")
    .eq("author_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  // Get endorsements received count
  const { count: endorsementCount } = await admin
    .from("endorsements")
    .select("id", { count: "exact", head: true })
    .eq("to_user", user.id);

  if (!profile) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground mb-4">
          Profile not found. Please complete onboarding.
        </p>
        <Link
          href="/onboarding"
          className="inline-flex rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
        >
          Set Up Profile
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Profile header */}
      <div className="rounded-xl border border-border bg-card p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-semibold flex-shrink-0">
            {profile.display_name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold">{profile.display_name}</h1>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <RenownTierBadge tier={(profile.renown_tier ?? 1) as RenownTier} />
              <span className="text-xs text-muted-foreground">
                {TRUST_TIER_LABELS[(profile.trust_tier ?? 1) as TrustTier]}
              </span>
              <ReputationBadge
                score={profile.reputation_score ?? 0}
                size="md"
                showLabel
              />
              {(endorsementCount ?? 0) > 0 && (
                <span className="text-xs text-muted-foreground">
                  {endorsementCount} endorsement{endorsementCount === 1 ? "" : "s"}
                </span>
              )}
            </div>
            {profile.bio && (
              <p className="text-sm text-muted-foreground mt-2">
                {profile.bio}
              </p>
            )}
            {profile.skills && profile.skills.length > 0 && (
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
      </div>

      {/* Edit profile link */}
      <div className="flex gap-3 mb-6">
        <Link
          href="/settings/privacy"
          className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted transition-colors"
        >
          Edit Profile & Settings
        </Link>
      </div>

      {/* Skill Progress */}
      <div className="mb-6">
        <SkillProgressCard />
      </div>

      {/* Posts */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Your Posts</h2>
        {posts && posts.length > 0 ? (
          <div className="space-y-2">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/board/${post.id}`}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
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
                </div>
                <span className="text-xs text-muted-foreground">
                  {post.responses?.length ?? 0} responses
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No posts yet.
          </p>
        )}
      </section>

      {/* Thanks received */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Thanks Received</h2>
        {thanksReceived && thanksReceived.length > 0 ? (
          <div className="space-y-2">
            {thanksReceived.map((t) => {
              const sender = Array.isArray(t.sender)
                ? t.sender[0]
                : t.sender;
              return (
                <div
                  key={t.id}
                  className="rounded-lg border border-golden-hour/20 bg-golden-hour/5 p-3"
                >
                  <span className="text-sm">
                    <strong>{sender?.display_name ?? "Someone"}</strong>{" "}
                    thanked you
                    {t.message && `: "${t.message}"`}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No thanks received yet. Help a neighbor!
          </p>
        )}
      </section>
    </div>
  );
}
