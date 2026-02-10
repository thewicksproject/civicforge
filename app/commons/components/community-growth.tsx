"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Bar,
  ComposedChart,
} from "recharts";
import type { WeeklyPoint } from "@/app/actions/commons";

interface CommunityGrowthProps {
  weeks: WeeklyPoint[];
  hiddenForPrivacy?: boolean;
}

export function CommunityGrowth({
  weeks,
  hiddenForPrivacy,
}: CommunityGrowthProps) {
  if (hiddenForPrivacy) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold">Community Growth</h3>
        <p className="text-sm text-muted-foreground">
          Growth chart hidden for communities with fewer than 10 members to
          protect privacy.
        </p>
      </div>
    );
  }

  const chartData = weeks.map((w) => ({
    week: new Date(w.week).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
    newMembers: w.value,
    cumulative: w.secondary ?? 0,
  }));

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="mb-4 text-lg font-semibold">Community Growth</h3>
      <p className="mb-4 text-sm text-muted-foreground">
        12-week membership trend
      </p>

      <ResponsiveContainer width="100%" height={250}>
        <ComposedChart data={chartData}>
          <defs>
            <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--meadow)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--meadow)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="week"
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            axisLine={{ stroke: "var(--border)" }}
          />
          <YAxis
            yAxisId="left"
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            axisLine={{ stroke: "var(--border)" }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            axisLine={{ stroke: "var(--border)" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "0.5rem",
              color: "var(--foreground)",
            }}
          />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="cumulative"
            stroke="var(--meadow)"
            fill="url(#growthGrad)"
            strokeWidth={2}
            name="Total Members"
          />
          <Bar
            yAxisId="right"
            dataKey="newMembers"
            fill="var(--meadow)"
            fillOpacity={0.4}
            radius={[4, 4, 0, 0]}
            name="New This Week"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
