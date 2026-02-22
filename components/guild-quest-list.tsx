"use client";

import { useState } from "react";
import Link from "next/link";
import { Sword, Users } from "lucide-react";
import { claimQuest } from "@/app/actions/quests";
import { Button } from "@/components/ui/button";
import { SkillDomainBadge } from "@/components/skill-domain-badge";
import type { SkillDomain } from "@/lib/types";
import { formatRelativeTime } from "@/lib/utils";

type GuildQuest = {
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
  profiles: { display_name: string; avatar_url: string | null } | { display_name: string; avatar_url: string | null }[] | null;
};

interface GuildQuestListProps {
  quests: GuildQuest[];
  currentUserId: string;
}

export function GuildQuestList({ quests, currentUserId }: GuildQuestListProps) {
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [claimedIds, setClaimedIds] = useState<Set<string>>(new Set());

  async function handleClaim(questId: string) {
    setClaimingId(questId);
    const res = await claimQuest(questId);
    if (res.success) {
      setClaimedIds((prev) => new Set([...prev, questId]));
    }
    setClaimingId(null);
  }

  if (quests.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4">
        No active guild quests yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {quests.map((quest) => {
        const creator = Array.isArray(quest.profiles) ? quest.profiles[0] : quest.profiles;
        const canClaim =
          quest.status === "open" &&
          quest.created_by !== currentUserId &&
          !claimedIds.has(quest.id);

        return (
          <div
            key={quest.id}
            className="rounded-xl border border-border bg-card p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <Link
                  href={`/quests/${quest.id}`}
                  className="text-sm font-medium hover:underline"
                >
                  {quest.title}
                </Link>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {quest.description}
                </p>

                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {quest.skill_domains.map((d) => (
                    <SkillDomainBadge
                      key={d}
                      domain={d as SkillDomain}
                      size="sm"
                    />
                  ))}
                  <span className="text-xs text-muted-foreground capitalize">
                    {quest.difficulty}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {quest.xp_reward} XP
                  </span>
                  {quest.max_party_size > 1 && (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      Party ({quest.max_party_size})
                    </span>
                  )}
                  {quest.is_emergency && (
                    <span className="text-xs font-medium text-rose-clay">
                      Urgent
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <span>by {creator?.display_name ?? "Unknown"}</span>
                  <span>{formatRelativeTime(new Date(quest.created_at))}</span>
                </div>
              </div>

              {canClaim && (
                <Button
                  size="sm"
                  onClick={() => handleClaim(quest.id)}
                  disabled={claimingId === quest.id}
                  className="flex-shrink-0"
                >
                  <Sword className="h-3.5 w-3.5 mr-1" />
                  {claimingId === quest.id ? "Claiming..." : "Claim"}
                </Button>
              )}

              {claimedIds.has(quest.id) && (
                <span className="text-xs text-offer font-medium flex-shrink-0">
                  Claimed!
                </span>
              )}

              {quest.status !== "open" && !claimedIds.has(quest.id) && (
                <span className="text-xs text-muted-foreground capitalize flex-shrink-0">
                  {quest.status.replace("_", " ")}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
