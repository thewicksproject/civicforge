"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createProposal } from "@/app/actions/governance";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { value: "charter_amendment", label: "Charter Amendment" },
  { value: "rule_change", label: "Rule Change" },
  { value: "quest_template", label: "Quest Template" },
  { value: "threshold_change", label: "Threshold Change" },
  { value: "seasonal_quest", label: "Seasonal Quest" },
  { value: "guild_charter", label: "Guild Charter" },
  { value: "other", label: "Other" },
];

const VOTE_TYPES = [
  { value: "quadratic", label: "Quadratic", description: "N votes cost N\u00B2 credits - prevents tyranny of the majority" },
  { value: "approval", label: "Approval", description: "Simple yes/no vote per person" },
];

export function ProposalForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("rule_change");
  const [voteType, setVoteType] = useState("quadratic");
  const [deliberationDays, setDeliberationDays] = useState(7);
  const [votingDays, setVotingDays] = useState(7);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await createProposal({
      title,
      description,
      category,
      vote_type: voteType,
      deliberation_days: deliberationDays,
      voting_days: votingDays,
    });

    if (result.success) {
      router.push(`/governance/${result.proposalId}`);
    } else {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-1.5">
          Proposal Title
        </label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Increase quest validation threshold for Blaze quests"
          required
          minLength={5}
          maxLength={200}
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1.5">
          Description
        </label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the proposal, its rationale, and expected impact..."
          required
          minLength={20}
          maxLength={5000}
          className="min-h-32"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">Category</label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setCategory(c.value)}
              className={cn(
                "rounded-lg border p-2 text-sm text-left transition-colors",
                category === c.value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-muted",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">Vote Type</label>
        <div className="grid gap-2">
          {VOTE_TYPES.map((v) => (
            <button
              key={v.value}
              type="button"
              onClick={() => setVoteType(v.value)}
              className={cn(
                "rounded-lg border p-3 text-left transition-colors",
                voteType === v.value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-muted",
              )}
            >
              <span className="block text-sm font-medium">{v.label}</span>
              <span className="block text-xs text-muted-foreground">{v.description}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="deliberation" className="block text-sm font-medium mb-1.5">
            Deliberation (days)
          </label>
          <Input
            id="deliberation"
            type="number"
            min={3}
            max={30}
            value={deliberationDays}
            onChange={(e) => setDeliberationDays(Number(e.target.value))}
          />
        </div>
        <div>
          <label htmlFor="voting" className="block text-sm font-medium mb-1.5">
            Voting (days)
          </label>
          <Input
            id="voting"
            type="number"
            min={3}
            max={14}
            value={votingDays}
            onChange={(e) => setVotingDays(Number(e.target.value))}
          />
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Creating..." : "Create Proposal"}
      </Button>
    </form>
  );
}
