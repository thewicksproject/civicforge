import Link from "next/link";
import { Users, Zap, TriangleAlert } from "lucide-react";
import { cn, formatRelativeTime, truncate } from "@/lib/utils";
import { QUEST_DIFFICULTY_TIERS, type QuestDifficulty } from "@/lib/types";
import { SkillDomainBadge, DifficultyBadge } from "./skill-domain-badge";
import { RenownTierBadge } from "./trust-tier-badge";
import type { SkillDomain, RenownTier } from "@/lib/types";

interface QuestCardProps {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  status: string;
  skillDomains: string[];
  xpReward: number;
  maxPartySize: number;
  isEmergency: boolean;
  createdAt: string;
  authorName: string;
  authorRenownTier: number;
}

export function QuestCard({
  id,
  title,
  description,
  difficulty,
  status,
  skillDomains,
  xpReward,
  maxPartySize,
  isEmergency,
  createdAt,
  authorName,
  authorRenownTier,
}: QuestCardProps) {
  const diffConfig = QUEST_DIFFICULTY_TIERS[difficulty as QuestDifficulty];

  return (
    <Link
      href={`/board/quest/${id}`}
      className={cn(
        "block rounded-xl bg-card border border-border p-5 card-hover",
        isEmergency && "border-l-[3px] border-l-destructive",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Status + difficulty badges */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <DifficultyBadge difficulty={difficulty} />
            {status !== "open" && (
              <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground capitalize">
                {status.replace(/_/g, " ")}
              </span>
            )}
            {isEmergency && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive">
                <TriangleAlert className="h-3 w-3" />
                Urgent
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-base font-semibold leading-snug mb-1">
            {title}
          </h3>

          {/* Description preview */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {truncate(description, 120)}
          </p>

          {/* Skill domains */}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {skillDomains.map((domain) => (
              <SkillDomainBadge
                key={domain}
                domain={domain as SkillDomain}
                size="sm"
              />
            ))}
          </div>

          {/* Meta */}
          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Zap className="h-3 w-3" />
              {xpReward} XP
            </span>
            {maxPartySize > 1 && (
              <span className="inline-flex items-center gap-1">
                <Users className="h-3 w-3" />
                Up to {maxPartySize}
              </span>
            )}
            {diffConfig && (
              <span>
                {diffConfig.validationMethod.replace(/_/g, " ")}
              </span>
            )}
          </div>
        </div>
      </div>

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
