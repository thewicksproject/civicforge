"use client";

import type { TierCount } from "@/app/actions/commons";

const TIER_COLORS: Record<number, string> = {
  1: "var(--muted-foreground)",
  2: "var(--meadow)",
  3: "var(--golden-hour)",
  4: "var(--horizon)",
  5: "var(--rose-clay)",
};

interface RenownPyramidProps {
  tiers: TierCount[];
}

export function RenownPyramid({ tiers }: RenownPyramidProps) {
  const maxCount = Math.max(...tiers.map((t) => t.count), 1);

  // Display bottom-to-top (tier 1 at bottom, tier 5 at top)
  const sorted = [...tiers].sort((a, b) => b.tier - a.tier);

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="mb-4 text-lg font-semibold">Renown Pyramid</h3>

      <div className="flex flex-col gap-3">
        {sorted.map((tier) => {
          const widthPct =
            tier.count > 0 ? Math.max(15, (tier.count / maxCount) * 100) : 8;
          const color = TIER_COLORS[tier.tier] ?? "var(--muted-foreground)";
          const displayCount =
            tier.count === 0 ? "< 3" : tier.count.toString();

          return (
            <div key={tier.tier} className="flex items-center gap-3">
              <span className="w-20 shrink-0 text-right text-sm font-medium text-muted-foreground">
                {tier.name}
              </span>
              <div className="flex-1">
                <div
                  className="flex h-8 items-center justify-end rounded-md px-3 transition-all duration-500"
                  style={{
                    width: `${widthPct}%`,
                    backgroundColor: color,
                    opacity: tier.count === 0 ? 0.3 : 0.8,
                  }}
                >
                  <span className="text-xs font-bold text-white drop-shadow-sm">
                    {displayCount}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Broad base, rare peaks — access unlocked, never punished.
      </p>
    </div>
  );
}
