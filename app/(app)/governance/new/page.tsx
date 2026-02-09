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
    .select("neighborhood_id, renown_tier")
    .eq("id", user.id)
    .single();

  if (!profile?.neighborhood_id) {
    redirect("/onboarding");
  }

  if ((profile.renown_tier ?? 1) < 4) {
    return (
      <div className="max-w-xl mx-auto text-center py-16">
        <h2 className="text-xl font-semibold mb-2">
          Proposals require Keeper status
        </h2>
        <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
          You need to be at least Renown Tier 4 (Keeper) to create governance proposals.
          Continue contributing to your neighborhood to increase your renown.
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
