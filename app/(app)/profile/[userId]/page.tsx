import { notFound, redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { TRUST_TIER_LABELS, type TrustTier, type RenownTier, type SkillDomain } from "@/lib/types";
import { ReputationBadge } from "@/components/reputation-badge";
import { RenownTierBadge } from "@/components/trust-tier-badge";
import { ThanksButton } from "@/components/thanks-button";
import { SkillProgressCard } from "@/components/skill-progress-card";
import { EndorsementSection } from "@/components/endorsement-section";
import { getSkillSummary } from "@/app/actions/skills";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const admin = createServiceClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("display_name")
    .eq("id", userId)
    .single();

  return { title: profile?.display_name ?? "Profile" };
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

  const { data: profile } = await admin
    .from("profiles")
    .select("id, display_name, bio, skills, reputation_score, trust_tier, renown_tier, privacy_tier, created_at")
    .eq("id", userId)
    .single();

  if (!profile) notFound();

  const isOwnProfile = user.id === userId;
  const privacyTier = profile.privacy_tier ?? "quiet";

  // C3: Privacy tier enforcement
  const showBio = isOwnProfile || privacyTier === "open" || privacyTier === "mentor";
  const showSkills = isOwnProfile || privacyTier === "open" || privacyTier === "mentor";
  const showDomainSummary = isOwnProfile || privacyTier !== "ghost";
  const showEndorsements = isOwnProfile || privacyTier === "open" || privacyTier === "mentor";

  // Get domain summary for quiet tier (no detailed skills, just domains)
  let domainSummary: { domain: string; level: number }[] = [];
  if (showDomainSummary && !showSkills && !isOwnProfile) {
    const summary = await getSkillSummary(userId);
    domainSummary = summary.domains;
  }

  // Get their recent posts (public)
  const { data: posts } = await admin
    .from("posts")
    .select("id, title, type, status, created_at")
    .eq("author_id", userId)
    .eq("hidden", false)
    .order("created_at", { ascending: false })
    .limit(5);

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
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <RenownTierBadge tier={(profile.renown_tier ?? 1) as RenownTier} />
                {showBio && (
                  <span className="text-sm text-muted-foreground">
                    {TRUST_TIER_LABELS[(profile.trust_tier ?? 1) as TrustTier]}
                  </span>
                )}
                {showBio && (
                  <ReputationBadge
                    score={profile.reputation_score ?? 0}
                    size="md"
                    showLabel
                  />
                )}
              </div>
              {/* Ghost tier: privacy message */}
              {!isOwnProfile && privacyTier === "ghost" && (
                <p className="text-sm text-muted-foreground mt-2 italic">
                  This member prefers privacy
                </p>
              )}
              {/* Quiet tier: domain summary only */}
              {!isOwnProfile && privacyTier === "quiet" && domainSummary.length > 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Active in {domainSummary.map((d) => d.domain).join(", ")} domains
                </p>
              )}
              {showBio && profile.bio && (
                <p className="text-sm text-muted-foreground mt-2">
                  {profile.bio}
                </p>
              )}
              {showBio && profile.skills && profile.skills.length > 0 && (
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
            <ThanksButton toUserId={profile.id} postId={null} />
          )}
        </div>
      </div>

      {/* Skill progress (respects privacy tier) */}
      {showSkills && (
        <div className="mb-6">
          <SkillProgressCard userId={userId} />
        </div>
      )}

      {/* Endorsements (respects privacy tier) */}
      {showEndorsements && (
        <div className="mb-6">
          <EndorsementSection userId={userId} isOwnProfile={isOwnProfile} />
        </div>
      )}

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
    </div>
  );
}
