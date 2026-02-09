"use client";

import { useState } from "react";
import { QuestCard } from "@/components/quest-card";
import { cn } from "@/lib/utils";

type DifficultyFilter = "all" | "spark" | "ember" | "flame" | "blaze" | "inferno";

type AuthorData = { display_name: string; avatar_url: string | null; renown_tier: number };

interface QuestData {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  status: string;
  skill_domains: string[];
  xp_reward: number;
  max_party_size: number;
  is_emergency: boolean;
  created_at: string;
  created_by: string;
  profiles: AuthorData | AuthorData[] | null;
}

const DIFFICULTY_FILTERS: { label: string; value: DifficultyFilter }[] = [
  { label: "All", value: "all" },
  { label: "Spark", value: "spark" },
  { label: "Ember", value: "ember" },
  { label: "Flame", value: "flame" },
  { label: "Blaze", value: "blaze" },
  { label: "Inferno", value: "inferno" },
];

export function QuestBoard({ quests }: { quests: QuestData[] }) {
  const [filter, setFilter] = useState<DifficultyFilter>("all");

  const filtered =
    filter === "all"
      ? quests
      : quests.filter((q) => q.difficulty === filter);

  return (
    <>
      {/* Difficulty filter pills */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {DIFFICULTY_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium border transition-colors whitespace-nowrap",
              filter === f.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border hover:bg-muted",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Quest grid */}
      {filtered.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((quest) => {
            const author = Array.isArray(quest.profiles)
              ? quest.profiles[0]
              : quest.profiles;
            return (
              <QuestCard
                key={quest.id}
                id={quest.id}
                title={quest.title}
                description={quest.description}
                difficulty={quest.difficulty}
                status={quest.status}
                skillDomains={quest.skill_domains}
                xpReward={quest.xp_reward}
                maxPartySize={quest.max_party_size}
                isEmergency={quest.is_emergency}
                createdAt={quest.created_at}
                authorName={author?.display_name ?? "Anonymous"}
                authorRenownTier={author?.renown_tier ?? 1}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 rounded-xl border border-dashed border-border">
          <p className="text-sm text-muted-foreground">
            No {filter === "all" ? "" : filter + " "}quests available right now.
          </p>
        </div>
      )}
    </>
  );
}
