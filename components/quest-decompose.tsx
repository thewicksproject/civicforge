"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { createQuest } from "@/app/actions/quests";
import {
  QUEST_DIFFICULTY_TIERS,
  SKILL_DOMAINS,
  type QuestDifficulty,
  type SkillDomain,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import type { DecomposedQuest } from "@/lib/ai/schemas";

interface DecompositionResult {
  quests: DecomposedQuest[];
  regulatory_awareness: {
    general_notes: string;
    disclaimer: string;
    suggested_contacts: string[];
  };
  decomposition_rationale: string;
}

type Phase = "input" | "loading" | "review" | "publishing";

export function QuestDecompose() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("input");
  const [text, setText] = useState("");
  const [guidance, setGuidance] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Review phase state
  const [result, setResult] = useState<DecompositionResult | null>(null);
  const [included, setIncluded] = useState<boolean[]>([]);
  const [editedQuests, setEditedQuests] = useState<DecomposedQuest[]>([]);

  // Publishing state
  const [publishProgress, setPublishProgress] = useState(0);
  const [publishTotal, setPublishTotal] = useState(0);
  const [createdIds, setCreatedIds] = useState<string[]>([]);
  const [publishErrors, setPublishErrors] = useState<string[]>([]);

  async function handleDecompose() {
    if (!text.trim()) return;
    setError(null);
    setPhase("loading");

    try {
      const res = await fetch("/api/ai/issue-decompose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.trim(),
          guidance: guidance.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(
          body?.error ?? `Request failed (${res.status})`
        );
      }

      const { data } = (await res.json()) as { data: DecompositionResult };
      setResult(data);
      setIncluded(data.quests.map(() => true));
      setEditedQuests(data.quests.map((q) => ({ ...q })));
      setPhase("review");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
      setPhase("input");
    }
  }

  async function handlePublish() {
    const questsToPublish = editedQuests.filter((_, i) => included[i]);
    if (questsToPublish.length === 0) return;

    setPhase("publishing");
    setPublishTotal(questsToPublish.length);
    setPublishProgress(0);
    setCreatedIds([]);
    setPublishErrors([]);

    const ids: string[] = [];
    const errors: string[] = [];

    for (let i = 0; i < questsToPublish.length; i++) {
      const q = questsToPublish[i];
      const res = await createQuest({
        title: q.title,
        description: q.description,
        difficulty: q.difficulty,
        skill_domains: q.skill_domains,
        max_party_size: q.max_party_size,
      });

      if (res.success) {
        ids.push(res.questId);
      } else {
        errors.push(`"${q.title}": ${res.error}`);
      }
      setPublishProgress(i + 1);
    }

    setCreatedIds(ids);
    setPublishErrors(errors);
  }

  function updateQuest(index: number, updates: Partial<DecomposedQuest>) {
    setEditedQuests((prev) =>
      prev.map((q, i) => (i === index ? { ...q, ...updates } : q))
    );
  }

  // ── Input Phase ──

  if (phase === "input" || phase === "loading") {
    return (
      <div className="space-y-4">
        {error && (
          <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div>
          <label
            htmlFor="problem-text"
            className="block text-sm font-medium mb-1.5"
          >
            Describe the problem or situation
          </label>
          <Textarea
            id="problem-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Don't worry about being precise — just describe what's going on and we'll help break it down into actionable steps."
            className="min-h-32"
            maxLength={5000}
            disabled={phase === "loading"}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {text.length}/5000
          </p>
        </div>

        <div>
          <label
            htmlFor="guidance"
            className="block text-sm font-medium mb-1.5"
          >
            Focus area{" "}
            <span className="text-muted-foreground font-normal">
              (optional)
            </span>
          </label>
          <Input
            id="guidance"
            value={guidance}
            onChange={(e) => setGuidance(e.target.value)}
            placeholder="Any particular aspect to focus on?"
            maxLength={500}
            disabled={phase === "loading"}
          />
        </div>

        <Button
          onClick={handleDecompose}
          disabled={phase === "loading" || text.trim().length < 10}
          className="w-full"
        >
          {phase === "loading" ? "Breaking it down..." : "Break it down"}
        </Button>

        {phase === "loading" && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-xl border p-4 animate-pulse space-y-2"
              >
                <div className="h-4 bg-muted rounded w-2/3" />
                <div className="h-3 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Publishing Phase ──

  if (phase === "publishing") {
    const done = publishProgress === publishTotal;

    if (done && createdIds.length > 0) {
      return (
        <div className="space-y-4 text-center py-8">
          <div className="text-2xl mb-2">
            {createdIds.length} quest{createdIds.length !== 1 ? "s" : ""}{" "}
            created
          </div>
          {publishErrors.length > 0 && (
            <div className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2 text-left">
              {publishErrors.map((e, i) => (
                <p key={i}>{e}</p>
              ))}
            </div>
          )}
          <div className="flex flex-col gap-2">
            {createdIds.map((id) => (
              <Button
                key={id}
                variant="outline"
                onClick={() => router.push(`/quests/${id}`)}
              >
                View quest
              </Button>
            ))}
            <Button variant="outline" onClick={() => router.push("/board")}>
              Back to board
            </Button>
          </div>
        </div>
      );
    }

    if (done && createdIds.length === 0) {
      return (
        <div className="space-y-4 text-center py-8">
          <p className="text-destructive">
            Failed to create quests. Please try again.
          </p>
          {publishErrors.map((e, i) => (
            <p key={i} className="text-sm text-muted-foreground">
              {e}
            </p>
          ))}
          <Button onClick={() => setPhase("review")}>Back to review</Button>
        </div>
      );
    }

    return (
      <div className="text-center py-8 space-y-3">
        <p className="text-sm text-muted-foreground">
          Creating quests... {publishProgress}/{publishTotal}
        </p>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{
              width: `${(publishProgress / publishTotal) * 100}%`,
            }}
          />
        </div>
      </div>
    );
  }

  // ── Review Phase ──

  if (!result) return null;

  const includedCount = included.filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* AI Rationale */}
      <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
        <p className="text-sm font-medium mb-1">How we broke this down</p>
        <p className="text-sm text-muted-foreground">
          {result.decomposition_rationale}
        </p>
      </div>

      {/* Regulatory Awareness */}
      {result.regulatory_awareness.general_notes && (
        <div className="rounded-xl border border-horizon/30 bg-horizon/5 p-4 space-y-2">
          <p className="text-sm font-medium flex items-center gap-1.5">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-horizon"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
            Things to be aware of
          </p>
          <p className="text-sm text-muted-foreground">
            {result.regulatory_awareness.general_notes}
          </p>
          {result.regulatory_awareness.suggested_contacts.length > 0 && (
            <div className="text-sm">
              <span className="font-medium">Consider contacting: </span>
              <span className="text-muted-foreground">
                {result.regulatory_awareness.suggested_contacts.join(", ")}
              </span>
            </div>
          )}
          <p className="text-xs text-muted-foreground italic border-t border-horizon/20 pt-2 mt-2">
            {result.regulatory_awareness.disclaimer}
          </p>
        </div>
      )}

      {/* Quest Cards */}
      <div className="space-y-3">
        <p className="text-sm font-medium">
          Suggested quests ({includedCount} of {editedQuests.length} selected)
        </p>

        {editedQuests.map((quest, index) => (
          <QuestCard
            key={index}
            quest={quest}
            included={included[index]}
            onToggle={() =>
              setIncluded((prev) =>
                prev.map((v, i) => (i === index ? !v : v))
              )
            }
            onUpdate={(updates) => updateQuest(index, updates)}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => {
            setPhase("input");
            setResult(null);
          }}
          className="flex-1"
        >
          Start over
        </Button>
        <Button
          onClick={handlePublish}
          disabled={includedCount === 0}
          className="flex-1"
        >
          Publish {includedCount} quest{includedCount !== 1 ? "s" : ""}
        </Button>
      </div>
    </div>
  );
}

// ── Quest Card Sub-component ──

function QuestCard({
  quest,
  included,
  onToggle,
  onUpdate,
}: {
  quest: DecomposedQuest;
  included: boolean;
  onToggle: () => void;
  onUpdate: (updates: Partial<DecomposedQuest>) => void;
}) {
  const [editing, setEditing] = useState(false);
  const diffConfig =
    QUEST_DIFFICULTY_TIERS[quest.difficulty as QuestDifficulty];

  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition-colors",
        included
          ? "border-border bg-card"
          : "border-border/40 bg-muted/20 opacity-60"
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          {editing ? (
            <Input
              value={quest.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              className="text-sm font-medium"
              maxLength={100}
            />
          ) : (
            <h3 className="text-sm font-medium leading-snug">{quest.title}</h3>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setEditing((e) => !e)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {editing ? "Done" : "Edit"}
          </button>
          <button
            type="button"
            onClick={onToggle}
            aria-label={included ? "Exclude quest" : "Include quest"}
            className={cn(
              "size-5 rounded border-2 transition-colors flex items-center justify-center",
              included
                ? "bg-primary border-primary text-primary-foreground"
                : "border-muted-foreground/40"
            )}
          >
            {included && (
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {editing ? (
        <Textarea
          value={quest.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          className="text-sm mb-2 min-h-16"
          maxLength={2000}
        />
      ) : (
        <p className="text-sm text-muted-foreground mb-2 line-clamp-3">
          {quest.description}
        </p>
      )}

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        <Badge variant="outline" className="text-xs">
          {diffConfig?.label ?? quest.difficulty} ({diffConfig?.baseXp ?? "?"}
          XP)
        </Badge>
        {quest.skill_domains.map((domain) => {
          const config = SKILL_DOMAINS[domain as SkillDomain];
          return (
            <Badge key={domain} variant="secondary" className="text-xs">
              {config?.label ?? domain}
            </Badge>
          );
        })}
        {quest.max_party_size > 1 && (
          <Badge variant="secondary" className="text-xs">
            Up to {quest.max_party_size} people
          </Badge>
        )}
      </div>

      {/* Rationale */}
      <p className="text-xs text-muted-foreground italic">{quest.rationale}</p>

      {/* Quest-specific regulatory notes */}
      {quest.regulatory_notes && (
        <p className="text-xs text-muted-foreground mt-1 border-t border-border/40 pt-1">
          {quest.regulatory_notes}
        </p>
      )}
    </div>
  );
}
