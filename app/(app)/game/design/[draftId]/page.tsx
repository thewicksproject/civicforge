import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { resolveGameConfig } from "@/lib/game-config/resolver";
import { GameDesignDiff } from "@/components/game-design-diff";

export const metadata = { title: "Game Design Draft" };

export default async function DraftDetailPage({
  params,
}: {
  params: Promise<{ draftId: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { draftId } = await params;
  const admin = createServiceClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("community_id, renown_tier")
    .eq("id", user.id)
    .single();

  if (!profile?.community_id) redirect("/onboarding");

  // Fetch draft design
  const { data: design } = await admin
    .from("game_designs")
    .select("*")
    .eq("id", draftId)
    .single();

  if (!design || design.community_id !== profile.community_id) notFound();

  // Fetch child rows
  const [questTypes, skillDomains, tiers, sources] = await Promise.all([
    admin.from("game_quest_types").select("*").eq("game_design_id", draftId).order("sort_order"),
    admin.from("game_skill_domains").select("*").eq("game_design_id", draftId).order("sort_order"),
    admin.from("game_recognition_tiers").select("*").eq("game_design_id", draftId).order("tier_number"),
    admin.from("game_recognition_sources").select("*").eq("game_design_id", draftId),
  ]);

  // Fetch active design for diff
  const activeConfig = await resolveGameConfig(profile.community_id);

  const isOwner = design.created_by === user.id;
  const isDraft = design.status === "draft";
  const isLocked = !!design.submitted_proposal_id;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">
            Game Design Draft
          </p>
          <h1 className="font-serif text-3xl font-bold">{design.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              design.status === "draft"
                ? "bg-muted text-muted-foreground"
                : design.status === "active"
                  ? "bg-primary/10 text-primary"
                  : "bg-destructive/10 text-destructive"
            }`}>
              {design.status}
            </span>
            {isLocked && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-golden-hour/10 text-golden-hour">
                Submitted for vote
              </span>
            )}
          </div>
        </div>
        {isOwner && isDraft && !isLocked && (
          <Link
            href={`/game/design/${draftId}/edit`}
            className="inline-flex shrink-0 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Edit Draft
          </Link>
        )}
      </div>

      {/* Value Statement */}
      <section className="rounded-xl bg-card p-6 shadow-sm">
        <h2 className="font-serif text-xl font-semibold mb-3">Value Statement</h2>
        <p className="text-foreground/90 leading-relaxed">{design.value_statement}</p>
      </section>

      {/* Diff vs active */}
      <GameDesignDiff
        draft={{
          questTypes: questTypes.data ?? [],
          skillDomains: skillDomains.data ?? [],
          recognitionTiers: tiers.data ?? [],
          recognitionSources: sources.data ?? [],
        }}
        active={{
          questTypes: activeConfig.questTypes,
          skillDomains: activeConfig.skillDomains,
          recognitionTiers: activeConfig.recognitionTiers,
          recognitionSources: activeConfig.recognitionSources,
        }}
      />

      <div className="flex gap-3">
        <Link
          href="/game"
          className="inline-flex rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
        >
          Back to Game
        </Link>
      </div>
    </div>
  );
}
