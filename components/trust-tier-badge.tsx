import {
  Sprout,
  ShieldCheck,
  BadgeCheck,
  Crown,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toRenownTier, type RenownLegacyTier, type RenownTier } from "@/lib/types";

// ---------------------------------------------------------------------------
// V2 Renown Tier Badge (backward-compatible, legacy 3-tier)
// ---------------------------------------------------------------------------

const TIER_CONFIG: Record<RenownLegacyTier, { icon: typeof Sprout; label: string; className: string }> = {
  1: { icon: Sprout, label: "Neighbor", className: "text-muted-foreground" },
  2: { icon: ShieldCheck, label: "Confirmed", className: "text-offer" },
  3: { icon: BadgeCheck, label: "Verified", className: "text-golden-hour" },
};

interface RenownLegacyTierBadgeProps {
  tier: number;
  className?: string;
}

export function RenownLegacyTierBadge({ tier, className }: RenownLegacyTierBadgeProps) {
  const normalizedTier: RenownLegacyTier = tier >= 3 ? 3 : tier === 2 ? 2 : 1;
  const config = TIER_CONFIG[normalizedTier];
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
  tier: number;
  showLabel?: boolean;
  className?: string;
}

export function RenownTierBadge({
  tier,
  showLabel = true,
  className,
}: RenownTierBadgeProps) {
  const safeTier: RenownTier = toRenownTier(tier);
  const config = RENOWN_CONFIG[safeTier];
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
