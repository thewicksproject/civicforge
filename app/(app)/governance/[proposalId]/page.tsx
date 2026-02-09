import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Clock } from "lucide-react";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { RenownTierBadge } from "@/components/trust-tier-badge";
import { VotePanel } from "@/components/vote-panel";
import type { RenownTier } from "@/lib/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ proposalId: string }>;
}) {
  const { proposalId } = await params;
  const admin = createServiceClient();
  const { data: proposal } = await admin
    .from("governance_proposals")
    .select("title")
    .eq("id", proposalId)
    .single();

  if (!proposal) return { title: "Proposal Not Found" };
  return { title: proposal.title };
}

export default async function ProposalDetailPage({
  params,
}: {
  params: Promise<{ proposalId: string }>;
}) {
  const { proposalId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admin = createServiceClient();

  const { data: proposal } = await admin
    .from("governance_proposals")
    .select(`
      *,
      author:profiles!governance_proposals_author_id_fkey(id, display_name, renown_tier)
    `)
    .eq("id", proposalId)
    .single();

  if (!proposal) notFound();

  const author = Array.isArray(proposal.author) ? proposal.author[0] : proposal.author;

  // Check if user already voted
  const { data: existingVote } = await admin
    .from("governance_votes")
    .select("id")
    .eq("proposal_id", proposalId)
    .eq("voter_id", user!.id)
    .single();

  const hasVoted = !!existingVote;

  // Check user's renown tier
  const { data: profile } = await admin
    .from("profiles")
    .select("renown_tier")
    .eq("id", user!.id)
    .single();

  const canVote = (profile?.renown_tier ?? 1) >= 2;
  const totalVotes = proposal.votes_for + proposal.votes_against;
  const forPercent = totalVotes > 0 ? (proposal.votes_for / totalVotes) * 100 : 50;

  const STATUS_STYLES: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    deliberation: "bg-horizon/10 text-horizon",
    voting: "bg-golden-hour/10 text-golden-hour",
    passed: "bg-offer/10 text-offer",
    rejected: "bg-need/10 text-need",
    expired: "bg-muted text-muted-foreground",
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/governance"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Governance
      </Link>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize",
              STATUS_STYLES[proposal.status] ?? STATUS_STYLES.draft,
            )}
          >
            {proposal.status.replace(/_/g, " ")}
          </span>
          <span className="text-xs text-muted-foreground capitalize">
            {proposal.category.replace(/_/g, " ")}
          </span>
          <span className="text-xs text-muted-foreground capitalize">
            {proposal.vote_type.replace(/_/g, " ")} voting
          </span>
          <span className="text-xs text-muted-foreground ml-auto">
            {formatRelativeTime(new Date(proposal.created_at))}
          </span>
        </div>

        <h1 className="text-2xl font-semibold mb-3">{proposal.title}</h1>
        <p className="text-foreground leading-relaxed whitespace-pre-wrap">
          {proposal.description}
        </p>

        {/* Timeline */}
        <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
          {proposal.deliberation_ends_at && (
            <span className="inline-flex items-center gap-1.5 bg-muted rounded-lg px-3 py-1.5">
              <Clock className="h-3.5 w-3.5" />
              Deliberation ends {formatRelativeTime(new Date(proposal.deliberation_ends_at))}
            </span>
          )}
          {proposal.voting_ends_at && (
            <span className="inline-flex items-center gap-1.5 bg-muted rounded-lg px-3 py-1.5">
              <Clock className="h-3.5 w-3.5" />
              Voting ends {formatRelativeTime(new Date(proposal.voting_ends_at))}
            </span>
          )}
        </div>
      </div>

      {/* Author */}
      <div className="rounded-xl border border-border bg-card p-4 mb-6">
        <Link
          href={`/profile/${author?.id}`}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
            {author?.display_name?.charAt(0).toUpperCase() ?? "?"}
          </div>
          <div>
            <span className="font-medium text-sm block">
              {author?.display_name ?? "Unknown"}
            </span>
            <RenownTierBadge tier={(author?.renown_tier ?? 1) as RenownTier} />
          </div>
        </Link>
      </div>

      {/* Vote tally */}
      <div className="rounded-xl border border-border bg-card p-5 mb-6">
        <h2 className="text-lg font-semibold mb-3">Vote Tally</h2>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-offer font-medium">For: {proposal.votes_for}</span>
          <span className="text-need font-medium">Against: {proposal.votes_against}</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden flex">
          <div
            className="h-full bg-offer rounded-l-full transition-all"
            style={{ width: `${forPercent}%` }}
          />
          <div
            className="h-full bg-need rounded-r-full transition-all"
            style={{ width: `${100 - forPercent}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {totalVotes} total vote{totalVotes === 1 ? "" : "s"} | Quorum: {proposal.quorum}
        </p>
      </div>

      {/* Vote panel (only during voting phase) */}
      {proposal.status === "voting" && (
        <div className="mb-6">
          <VotePanel
            proposalId={proposalId}
            voteType={proposal.vote_type}
            hasVoted={hasVoted}
            canVote={canVote}
          />
        </div>
      )}
    </div>
  );
}
