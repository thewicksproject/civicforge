import Link from "next/link";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { ProposalCard } from "@/components/proposal-card";

export const metadata = { title: "Governance" };

export default async function GovernancePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admin = createServiceClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("neighborhood_id, renown_tier")
    .eq("id", user!.id)
    .single();

  if (!profile?.neighborhood_id) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Join a neighborhood to see governance proposals.</p>
      </div>
    );
  }

  const { data: proposals } = await admin
    .from("governance_proposals")
    .select(`
      id, title, description, category, status, vote_type,
      votes_for, votes_against, quorum,
      deliberation_ends_at, voting_ends_at, created_at,
      author_id, profiles!governance_proposals_author_id_fkey(display_name, renown_tier)
    `)
    .eq("neighborhood_id", profile.neighborhood_id)
    .order("created_at", { ascending: false })
    .limit(30);

  const canPropose = (profile.renown_tier ?? 1) >= 4;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Governance</h1>
          <p className="text-sm text-muted-foreground">
            Proposals, deliberation, and community decisions
          </p>
        </div>
        {canPropose && (
          <Link
            href="/governance/new"
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            New Proposal
          </Link>
        )}
      </div>

      {proposals && proposals.length > 0 ? (
        <div className="grid gap-4">
          {proposals.map((p) => {
            const author = Array.isArray(p.profiles)
              ? p.profiles[0]
              : p.profiles;
            return (
              <ProposalCard
                key={p.id}
                id={p.id}
                title={p.title}
                description={p.description}
                category={p.category}
                status={p.status}
                voteType={p.vote_type}
                votesFor={p.votes_for}
                votesAgainst={p.votes_against}
                quorum={p.quorum}
                deliberationEndsAt={p.deliberation_ends_at}
                votingEndsAt={p.voting_ends_at}
                createdAt={p.created_at}
                authorName={author?.display_name ?? "Unknown"}
                authorRenownTier={author?.renown_tier ?? 1}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 rounded-xl border border-dashed border-border">
          <h3 className="text-lg font-semibold mb-1">No proposals yet</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
            Governance proposals let your neighborhood deliberate and vote on rules,
            charter amendments, and community decisions.
            Keepers (Renown Tier 4+) can create proposals.
          </p>
        </div>
      )}
    </div>
  );
}
