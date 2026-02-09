import {
  Sprout,
  ShieldCheck,
  BadgeCheck,
  Crown,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { TrustTier, RenownTier } from "@/lib/types";

// ---------------------------------------------------------------------------
// V2 Trust Tier Badge (backward-compatible)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Ascendant Renown Tier Badge (5-tier system)
// ---------------------------------------------------------------------------

const RENOWN_CONFIG: Record<
  RenownTier,
  { icon: typeof Sprout; label: string; className: string }
> = {
  1: { icon: Sprout, label: "Newcomer", className: "text-muted-foreground" },
  2: { icon: ShieldCheck, label: "Neighbor", className: "text-offer" },
  3: { icon: BadgeCheck, label: "Pillar", className: "text-golden-hour" },
  4: { icon: Crown, label: "Keeper", className: "text-horizon" },
  5: { icon: Star, label: "Founder", className: "text-need" },
};

interface RenownTierBadgeProps {
  tier: RenownTier;
  showLabel?: boolean;
  className?: string;
}

export function RenownTierBadge({
  tier,
  showLabel = true,
  className,
}: RenownTierBadgeProps) {
  const config = RENOWN_CONFIG[tier];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs",
        config.className,
        className,
      )}
    >
      <Icon className="h-3 w-3" />
      {showLabel && config.label}
    </span>
  );
}
