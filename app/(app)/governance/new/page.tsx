import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { ProposalForm } from "@/components/proposal-form";

export const metadata = { title: "New Proposal" };

export default async function NewProposalPage() {
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
    console.warn("Governance new: no community for user", user.id);
    redirect("/onboarding");
  }

  if ((profile.renown_tier ?? 1) < 4) {
    console.warn("Governance new: tier gate", { userId: user.id, tier: profile.renown_tier });
    return (
      <div className="max-w-xl mx-auto text-center py-16">
        <h2 className="text-xl font-semibold mb-2">
          Proposals require Keeper status
        </h2>
        <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
          You need to be at least Renown Tier 4 (Keeper) to create governance proposals.
          Continue contributing to your community to increase your renown.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-1">New Governance Proposal</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Propose a rule change, charter amendment, or community decision.
        All proposals go through deliberation before voting.
      </p>
      <ProposalForm />
    </div>
  );
}
