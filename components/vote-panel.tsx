"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { castVote } from "@/app/actions/governance";

interface VotePanelProps {
  proposalId: string;
  voteType: string;
  hasVoted: boolean;
  canVote: boolean;
}

export function VotePanel({ proposalId, voteType, hasVoted, canVote }: VotePanelProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credits, setCredits] = useState(1);

  const voteWeight = voteType === "quadratic" ? Math.sqrt(credits) : 1;

  async function handleVote(inFavor: boolean) {
    setLoading(true);
    setError(null);
    try {
      const result = await castVote({
        proposal_id: proposalId,
        in_favor: inFavor,
        credits_spent: voteType === "quadratic" ? credits : 1,
      });

      if (result.success) {
        router.refresh();
      } else {
        setError(result.error);
      }
    } catch {
      setError("Failed to cast vote. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (hasVoted) {
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-sm text-muted-foreground">
          You have already voted on this proposal.
        </p>
      </div>
    );
  }

  if (!canVote) {
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-sm text-muted-foreground">
          You need to be at least a Neighbor (Renown Tier 2) to vote.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      <h3 className="font-semibold">Cast Your Vote</h3>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {voteType === "quadratic" && (
        <div>
          <label htmlFor="credits" className="block text-sm font-medium mb-1.5">
            Credits to spend
          </label>
          <div className="flex items-center gap-3">
            <Input
              id="credits"
              type="number"
              min={1}
              max={100}
              value={credits}
              onChange={(e) => setCredits(Math.min(100, Math.max(1, Math.floor(Number(e.target.value)))))}
              className="w-24"
            />
            <span className="text-sm text-muted-foreground">
              = {voteWeight.toFixed(2)} vote weight (N votes cost N² credits)
            </span>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button
          onClick={() => handleVote(true)}
          disabled={loading}
          className="flex-1"
        >
          {loading ? "..." : "Vote For"}
        </Button>
        <Button
          onClick={() => handleVote(false)}
          disabled={loading}
          variant="outline"
          className="flex-1"
        >
          {loading ? "..." : "Vote Against"}
        </Button>
      </div>
    </div>
  );
}
