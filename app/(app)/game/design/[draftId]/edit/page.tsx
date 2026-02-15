import { redirect, notFound } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { GameDesignEditor } from "@/components/game-design-editor";

export const metadata = { title: "Edit Game Design" };

export default async function EditDraftPage({
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

  const { data: design } = await admin
    .from("game_designs")
    .select("*")
    .eq("id", draftId)
    .single();

  if (!design || design.community_id !== profile.community_id) notFound();
  if (design.created_by !== user.id) redirect(`/game/design/${draftId}`);
  if (design.status !== "draft") redirect(`/game/design/${draftId}`);
  if (design.submitted_proposal_id) redirect(`/game/design/${draftId}`);

  // Fetch child rows
  const [questTypes, skillDomains, tiers, sources] = await Promise.all([
    admin.from("game_quest_types").select("*").eq("game_design_id", draftId).order("sort_order"),
    admin.from("game_skill_domains").select("*").eq("game_design_id", draftId).order("sort_order"),
    admin.from("game_recognition_tiers").select("*").eq("game_design_id", draftId).order("tier_number"),
    admin.from("game_recognition_sources").select("*").eq("game_design_id", draftId),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold">Edit: {design.name}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Make changes, then submit for a governance vote when ready.
        </p>
      </div>

      <GameDesignEditor
        designId={draftId}
        design={{
          name: design.name,
          description: design.description,
          valueStatement: design.value_statement,
          designRationale: design.design_rationale,
          sunsetAt: design.sunset_at,
        }}
        questTypes={questTypes.data ?? []}
        skillDomains={skillDomains.data ?? []}
        recognitionTiers={tiers.data ?? []}
        recognitionSources={sources.data ?? []}
      />
    </div>
  );
}
