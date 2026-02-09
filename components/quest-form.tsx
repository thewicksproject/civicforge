"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createQuest } from "@/app/actions/quests";
import { QUEST_DIFFICULTY_TIERS, SKILL_DOMAINS, type QuestDifficulty, type SkillDomain } from "@/lib/types";
import { cn } from "@/lib/utils";

const DIFFICULTIES = Object.entries(QUEST_DIFFICULTY_TIERS) as [QuestDifficulty, typeof QUEST_DIFFICULTY_TIERS[QuestDifficulty]][];
const DOMAINS = Object.entries(SKILL_DOMAINS) as [SkillDomain, typeof SKILL_DOMAINS[SkillDomain]][];

export function QuestForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<QuestDifficulty>("spark");
  const [selectedDomains, setSelectedDomains] = useState<SkillDomain[]>([]);
  const [maxPartySize, setMaxPartySize] = useState(1);
  const [isEmergency, setIsEmergency] = useState(false);

  function toggleDomain(domain: SkillDomain) {
    setSelectedDomains((prev) => {
      if (prev.includes(domain)) {
        return prev.filter((d) => d !== domain);
      }
      if (prev.length >= 3) return prev;
      return [...prev, domain];
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedDomains.length === 0) {
      setError("Select at least one skill domain");
      return;
    }

    setLoading(true);
    setError(null);

    const result = await createQuest({
      title,
      description,
      difficulty,
      skill_domains: selectedDomains,
      max_party_size: maxPartySize,
      is_emergency: isEmergency,
    });

    if (result.success) {
      router.push(`/board/quest/${result.questId}`);
    } else {
      setError(result.error);
      setLoading(false);
    }
  }

  const diffConfig = QUEST_DIFFICULTY_TIERS[difficulty];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-1.5">
          Quest Title
        </label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Help clear the community garden path"
          required
          minLength={5}
          maxLength={100}
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1.5">
          Description
        </label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What needs to be done? Where? Any tools or materials needed?"
          required
          minLength={10}
          maxLength={2000}
          className="min-h-24"
        />
      </div>

      {/* Difficulty */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          Difficulty
        </label>
        <div className="grid grid-cols-5 gap-2">
          {DIFFICULTIES.map(([key, config]) => (
            <button
              key={key}
              type="button"
              onClick={() => setDifficulty(key)}
              className={cn(
                "rounded-lg border p-2 text-center transition-colors",
                difficulty === key
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-muted",
              )}
            >
              <span className="block text-sm font-medium">{config.label}</span>
              <span className="block text-xs text-muted-foreground">
                {config.baseXp} XP
              </span>
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-1.5">
          {diffConfig.description}. Validation: {diffConfig.validationMethod.replace(/_/g, " ")}.
        </p>
      </div>

      {/* Skill Domains */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          Skill Domains <span className="text-muted-foreground font-normal">(1-3)</span>
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {DOMAINS.map(([key, config]) => (
            <button
              key={key}
              type="button"
              onClick={() => toggleDomain(key)}
              className={cn(
                "rounded-lg border p-2 text-left transition-colors",
                selectedDomains.includes(key)
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-muted",
              )}
            >
              <span className="block text-sm font-medium">{config.label}</span>
              <span className="block text-xs text-muted-foreground line-clamp-1">
                {config.examples[0]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Party size */}
      <div>
        <label htmlFor="partySize" className="block text-sm font-medium mb-1.5">
          Max Party Size
        </label>
        <div className="flex items-center gap-3">
          <Input
            id="partySize"
            type="number"
            min={1}
            max={10}
            value={maxPartySize}
            onChange={(e) => setMaxPartySize(Number(e.target.value))}
            className="w-20"
          />
          <span className="text-sm text-muted-foreground">
            {maxPartySize === 1 ? "Solo quest" : `Up to ${maxPartySize} people`}
          </span>
        </div>
      </div>

      {/* Emergency */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={isEmergency}
          onChange={(e) => setIsEmergency(e.target.checked)}
          className="rounded border-border"
        />
        <span className="text-sm">Mark as urgent / emergency</span>
      </label>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Creating Quest..." : "Create Quest"}
      </Button>
    </form>
  );
}
