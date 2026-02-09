import {
  Hammer,
  Leaf,
  Heart,
  Truck,
  Radio,
  Flame,
  Network,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SkillDomain } from "@/lib/types";
import { SKILL_DOMAINS } from "@/lib/types";

const DOMAIN_ICONS: Record<SkillDomain, typeof Hammer> = {
  craft: Hammer,
  green: Leaf,
  care: Heart,
  bridge: Truck,
  signal: Radio,
  hearth: Flame,
  weave: Network,
};

interface SkillDomainBadgeProps {
  domain: SkillDomain;
  showLabel?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function SkillDomainBadge({
  domain,
  showLabel = true,
  size = "sm",
  className,
}: SkillDomainBadgeProps) {
  const config = SKILL_DOMAINS[domain];
  const Icon = DOMAIN_ICONS[domain];

  if (!config) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-medium",
        size === "sm" ? "text-xs" : "text-sm",
        `text-${config.color} border-${config.color}/20 bg-${config.color}/5`,
        className,
      )}
    >
      <Icon className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
      {showLabel && config.label}
    </span>
  );
}

export function DifficultyBadge({
  difficulty,
  className,
}: {
  difficulty: string;
  className?: string;
}) {
  const config: Record<string, { label: string; className: string }> = {
    spark: { label: "Spark", className: "text-muted-foreground bg-muted border-border" },
    ember: { label: "Ember", className: "text-golden-hour bg-golden-hour/10 border-golden-hour/20" },
    flame: { label: "Flame", className: "text-need bg-need-light border-need/20" },
    blaze: { label: "Blaze", className: "text-horizon bg-horizon/10 border-horizon/20" },
    inferno: { label: "Inferno", className: "text-destructive bg-destructive/10 border-destructive/20" },
  };

  const c = config[difficulty] ?? config.spark;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        c.className,
        className,
      )}
    >
      {c.label}
    </span>
  );
}
