"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { GovStats } from "@/app/actions/commons";

const STATUS_COLORS: Record<string, string> = {
  passed: "var(--meadow)",
  rejected: "var(--rose-clay)",
  voting: "var(--golden-hour)",
  deliberation: "var(--horizon)",
  draft: "var(--muted-foreground)",
  expired: "var(--muted-foreground)",
};

interface GovernanceGaugeProps {
  metrics: GovStats;
}

export function GovernanceGauge({ metrics }: GovernanceGaugeProps) {
  if (metrics.totalProposals === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold">Governance</h3>
        <p className="text-sm text-muted-foreground">
          No governance proposals yet.
        </p>
      </div>
    );
  }

  const chartData = metrics.byStatus.map((s) => ({
    name: s.status.charAt(0).toUpperCase() + s.status.slice(1),
    value: s.count,
    status: s.status,
  }));

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="mb-4 text-lg font-semibold">Governance</h3>

      <div className="flex items-center gap-6">
        <div className="relative h-[200px] w-[200px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={
                      STATUS_COLORS[entry.status] ??
                      "var(--muted-foreground)"
                    }
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "0.5rem",
                  color: "var(--foreground)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Center number */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold">{metrics.totalProposals}</span>
            <span className="text-xs text-muted-foreground">proposals</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {chartData.map((entry) => (
            <div key={entry.status} className="flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 rounded-sm"
                style={{
                  backgroundColor:
                    STATUS_COLORS[entry.status] ?? "var(--muted-foreground)",
                }}
              />
              <span className="text-sm">
                {entry.name}: {entry.value}
              </span>
            </div>
          ))}
          <div className="mt-2 border-t border-border pt-2">
            <p className="text-sm text-muted-foreground">
              Avg participation: {metrics.avgParticipation} votes/proposal
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
