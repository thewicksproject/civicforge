import Link from "next/link";
import { Users } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { SkillDomainBadge } from "./skill-domain-badge";
import type { SkillDomain } from "@/lib/types";

interface GuildCardProps {
  id: string;
  name: string;
  domain: string;
  description: string | null;
  memberCount: number;
  charterSunsetAt: string | null;
  createdAt: string;
  createdByName: string;
}

export function GuildCard({
  id,
  name,
  domain,
  description,
  memberCount,
  charterSunsetAt,
  createdAt,
  createdByName,
}: GuildCardProps) {
  return (
    <Link
      href={`/guilds/${id}`}
      className="block rounded-xl bg-card border border-border p-5 card-hover"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <SkillDomainBadge domain={domain as SkillDomain} size="sm" />
          </div>
          <h3 className="text-base font-semibold leading-snug mb-1">
            {name}
          </h3>
          {description && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {description}
            </p>
          )}
          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Users className="h-3 w-3" />
              {memberCount} member{memberCount === 1 ? "" : "s"}
            </span>
            {charterSunsetAt && (
              <span>
                Charter expires {formatRelativeTime(new Date(charterSunsetAt))}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
        <span className="text-sm text-muted-foreground">
          Founded by <span className="font-medium text-foreground">{createdByName}</span>
        </span>
        <span className="text-xs text-muted-foreground">
          {formatRelativeTime(new Date(createdAt))}
        </span>
      </div>
    </Link>
  );
}
