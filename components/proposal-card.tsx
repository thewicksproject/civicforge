import Link from "next/link";
import { formatRelativeTime, cn } from "@/lib/utils";
import { RenownTierBadge } from "./trust-tier-badge";
import type { RenownTier } from "@/lib/types";

interface ProposalCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  voteType: string;
  votesFor: number;
  votesAgainst: number;
  quorum: number;
  deliberationEndsAt: string | null;
  votingEndsAt: string | null;
  createdAt: string;
  authorName: string;
  authorRenownTier: number;
}

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  deliberation: "bg-horizon/10 text-horizon",
  voting: "bg-golden-hour/10 text-golden-hour",
  passed: "bg-offer/10 text-offer",
  rejected: "bg-need/10 text-need",
  expired: "bg-muted text-muted-foreground",
};

export function ProposalCard({
  id,
  title,
  description,
  category,
  status,
  voteType,
  votesFor,
  votesAgainst,
  quorum,
  deliberationEndsAt,
  votingEndsAt,
  createdAt,
  authorName,
  authorRenownTier,
}: ProposalCardProps) {
  const totalVotes = votesFor + votesAgainst;
  const forPercent = totalVotes > 0 ? (votesFor / totalVotes) * 100 : 0;

  return (
    <Link
      href={`/governance/${id}`}
      className="block rounded-xl bg-card border border-border p-5 card-hover"
    >
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize",
            STATUS_STYLES[status] ?? STATUS_STYLES.draft,
          )}
        >
          {status.replace(/_/g, " ")}
        </span>
        <span className="text-xs text-muted-foreground capitalize">
          {category.replace(/_/g, " ")}
        </span>
        <span className="text-xs text-muted-foreground capitalize">
          {voteType.replace(/_/g, " ")} voting
        </span>
      </div>

      <h3 className="text-base font-semibold leading-snug mb-1">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
        {description}
      </p>

      {/* Vote bar */}
      {(status === "voting" || status === "passed" || status === "rejected") && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>For: {votesFor}</span>
            <span>Against: {votesAgainst}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden flex">
            {totalVotes > 0 ? (
              <>
                <div
                  className="h-full bg-offer rounded-l-full transition-all"
                  style={{ width: `${forPercent}%` }}
                />
                <div
                  className="h-full bg-need rounded-r-full transition-all"
                  style={{ width: `${100 - forPercent}%` }}
                />
              </>
            ) : (
              <div className="h-full w-full bg-muted rounded-full" />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Quorum: {quorum} votes needed
          </p>
        </div>
      )}

      {/* Timer */}
      {status === "deliberation" && deliberationEndsAt && (
        <p className="mt-2 text-xs text-muted-foreground">
          Deliberation ends {formatRelativeTime(new Date(deliberationEndsAt))}
        </p>
      )}
      {status === "voting" && votingEndsAt && (
        <p className="mt-2 text-xs text-muted-foreground">
          Voting ends {formatRelativeTime(new Date(votingEndsAt))}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{authorName}</span>
          <RenownTierBadge tier={(authorRenownTier ?? 1) as RenownTier} />
        </div>
        <span className="text-xs text-muted-foreground">
          {formatRelativeTime(new Date(createdAt))}
        </span>
      </div>
    </Link>
  );
}
