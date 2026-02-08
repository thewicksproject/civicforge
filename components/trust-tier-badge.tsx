import { Sprout, ShieldCheck, BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TrustTier } from "@/lib/types";

const TIER_CONFIG: Record<TrustTier, { icon: typeof Sprout; label: string; className: string }> = {
  1: { icon: Sprout, label: "Neighbor", className: "text-muted-foreground" },
  2: { icon: ShieldCheck, label: "Confirmed", className: "text-offer" },
  3: { icon: BadgeCheck, label: "Verified", className: "text-golden-hour" },
};

interface TrustTierBadgeProps {
  tier: TrustTier;
  className?: string;
}

export function TrustTierBadge({ tier, className }: TrustTierBadgeProps) {
  const config = TIER_CONFIG[tier];
  const Icon = config.icon;

  return (
    <span className={cn("inline-flex items-center gap-1 text-xs", config.className, className)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}
