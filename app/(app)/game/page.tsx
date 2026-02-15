import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { resolveGameConfig } from "@/lib/game-config/resolver";
import { getUserDrafts } from "@/app/actions/game-designs";

export const metadata = { title: "Your Community's Game" };

export default async function GamePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const admin = createServiceClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("community_id, renown_tier")
    .eq("id", user.id)
    .single();

  if (!profile?.community_id) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold mb-2">No Community</h2>
        <p className="text-muted-foreground mb-6">
          Join a community to see its game design.
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

  const { data: community } = await admin
    .from("communities")
    .select("name")
    .eq("id", profile.community_id)
    .single();

  const gameConfig = await resolveGameConfig(profile.community_id);

  const isKeeper = (profile.renown_tier ?? 1) >= 4;
  const draftsResult = isKeeper ? await getUserDrafts() : null;
  const userDrafts = draftsResult?.success ? draftsResult.drafts : [];

  const sunsetDate = new Date(gameConfig.sunsetAt);
  const now = new Date();
  const daysUntilSunset = Math.max(
    0,
    Math.round(
      (sunsetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    ),
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-sm text-muted-foreground mb-1">
          {community?.name ?? "Community"} Game Design
        </p>
        <h1 className="font-serif text-3xl font-bold">{gameConfig.name}</h1>
        {gameConfig.isClassicFallback && (
          <p className="text-sm text-muted-foreground mt-1">
            Default game design — your community can customize this through governance.
          </p>
        )}
      </div>

      {/* Value Statement */}
      <section className="rounded-xl bg-card p-6 shadow-sm">
        <h2 className="font-serif text-xl font-semibold mb-3">
          Value Statement
        </h2>
        <p className="text-foreground/90 leading-relaxed">
          {gameConfig.valueStatement}
        </p>
      </section>

      {/* Design Rationale */}
      <section className="rounded-xl bg-card p-6 shadow-sm">
        <h2 className="font-serif text-xl font-semibold mb-3">
          Why These Rules?
        </h2>
        <p className="text-foreground/90 leading-relaxed">
          {gameConfig.designRationale}
        </p>
      </section>

      {/* Quest Types */}
      <section className="rounded-xl bg-card p-6 shadow-sm">
        <h2 className="font-serif text-xl font-semibold mb-4">
          Quest Types
        </h2>
        <div className="space-y-4">
          {gameConfig.questTypes.map((qt, i) => (
            <div
              key={qt.id}
              className="flex items-start gap-4 rounded-lg border border-border/50 p-4"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{qt.label}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {qt.recognitionType === "narrative"
                      ? "narrative"
                      : `${qt.baseRecognition} XP`}
                  </span>
                </div>
                {qt.description && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {qt.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>
                    Validation: {qt.validationMethod.replace(/_/g, " ")}
                  </span>
                  {qt.validationThreshold > 0 && (
                    <span>
                      Threshold: {qt.validationThreshold}
                    </span>
                  )}
                  {qt.maxPartySize > 1 && (
                    <span>
                      Party size: up to {qt.maxPartySize}
                    </span>
                  )}
                  {qt.cooldownHours > 0 && (
                    <span>
                      Cooldown: {qt.cooldownHours}h
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Skill Domains */}
      <section className="rounded-xl bg-card p-6 shadow-sm">
        <h2 className="font-serif text-xl font-semibold mb-4">
          Skill Domains
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {gameConfig.skillDomains.map((sd) => (
            <div
              key={sd.id}
              className="rounded-lg border border-border/50 p-4"
            >
              <h3 className="font-semibold mb-1">{sd.label}</h3>
              {sd.description && (
                <p className="text-sm text-muted-foreground mb-2">
                  {sd.description}
                </p>
              )}
              {sd.examples.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  e.g. {sd.examples.slice(0, 4).join(", ")}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Recognition Tiers */}
      <section className="rounded-xl bg-card p-6 shadow-sm">
        <h2 className="font-serif text-xl font-semibold mb-4">
          Recognition Tiers
        </h2>
        <div className="space-y-3">
          {gameConfig.recognitionTiers.map((rt) => (
            <div
              key={rt.id}
              className="flex items-start gap-3 rounded-lg border border-border/50 p-4"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {rt.tierNumber}
              </div>
              <div>
                <h3 className="font-semibold">{rt.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {rt.thresholdValue > 0
                    ? `${rt.thresholdValue} ${rt.thresholdType.replace(/_/g, " ")} required`
                    : "No threshold"}
                  {rt.additionalRequirements &&
                    typeof rt.additionalRequirements === "object" &&
                    "vouches_required" in rt.additionalRequirements &&
                    ` + ${rt.additionalRequirements.vouches_required} vouches`}
                </p>
                {rt.unlocks.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Unlocks: {rt.unlocks.join(", ")}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How Recognition is Earned */}
      <section className="rounded-xl bg-card p-6 shadow-sm">
        <h2 className="font-serif text-xl font-semibold mb-4">
          How Recognition is Earned
        </h2>
        <div className="space-y-2">
          {gameConfig.recognitionSources.map((rs) => (
            <div
              key={rs.id}
              className="flex items-center justify-between rounded-lg border border-border/50 px-4 py-3"
            >
              <span className="text-sm">
                {rs.sourceType.replace(/_/g, " ")}
              </span>
              <span className="text-sm font-medium">
                +{rs.amount} renown
                {rs.maxPerDay && (
                  <span className="text-xs text-muted-foreground ml-2">
                    (max {rs.maxPerDay}/day)
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Sunset & Governance */}
      <section className="rounded-xl bg-card p-6 shadow-sm">
        <h2 className="font-serif text-xl font-semibold mb-3">
          Game Lifecycle
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Version</span>
            <span className="text-sm font-medium">v{gameConfig.version}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Sunsets on</span>
            <span className="text-sm font-medium">
              {sunsetDate.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Days remaining
            </span>
            <span
              className={`text-sm font-medium ${
                daysUntilSunset < 90
                  ? "text-destructive"
                  : daysUntilSunset < 180
                    ? "text-golden-hour"
                    : ""
              }`}
            >
              {daysUntilSunset} days
            </span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          All game rules must be re-ratified before they sunset. Changes require
          a governance proposal approved by the community.
        </p>
      </section>

      {/* Your Drafts (Keeper+) */}
      {isKeeper && userDrafts.length > 0 && (
        <section className="rounded-xl bg-card p-6 shadow-sm">
          <h2 className="font-serif text-xl font-semibold mb-4">
            Your Drafts
          </h2>
          <div className="space-y-3">
            {userDrafts.map((draft) => (
              <Link
                key={draft.id}
                href={`/game/design/${draft.id}`}
                className="flex items-center justify-between rounded-lg border border-border/50 p-4 hover:bg-muted transition-colors"
              >
                <div>
                  <h3 className="font-semibold text-sm">{draft.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    Updated {new Date(draft.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  draft.submitted_proposal_id
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {draft.submitted_proposal_id ? "Submitted" : "Draft"}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Propose Changes (Keeper+) */}
      {isKeeper && (
        <section className="rounded-xl bg-card p-6 shadow-sm">
          <h2 className="font-serif text-xl font-semibold mb-3">
            Propose Changes
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            As a Keeper, you can propose changes to your community&apos;s game design.
            Create a draft from a template or fork the current design, then submit
            it for a governance vote.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/game/design/new"
              className="inline-flex rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              New from Template
            </Link>
            <Link
              href="/game/design/new?fork=true"
              className="inline-flex rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
            >
              Fork Current Design
            </Link>
          </div>
        </section>
      )}

      {/* Platform Guardrails */}
      <section className="rounded-xl bg-muted/50 p-6">
        <h2 className="font-serif text-lg font-semibold mb-3">
          Platform Guardrails
        </h2>
        <p className="text-sm text-muted-foreground mb-3">
          These rules are immutable — no community game design can override
          them.
        </p>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>No public leaderboards or single aggregate scores</li>
          <li>Skills are private by default</li>
          <li>No economic gatekeeping (game state never affects housing, jobs, services)</li>
          <li>Recognition is never decremented by others</li>
          <li>All game designs must sunset within 2 years</li>
          <li>Game changes require a governance vote</li>
          <li>AI proposes, never decides</li>
        </ul>
      </section>
    </div>
  );
}
