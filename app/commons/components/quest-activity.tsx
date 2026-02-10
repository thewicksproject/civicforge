"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { WeeklyPoint } from "@/app/actions/commons";

interface QuestActivityProps {
  weeks: WeeklyPoint[];
}

export function QuestActivity({ weeks }: QuestActivityProps) {
  const chartData = weeks.map((w) => ({
    week: new Date(w.week).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
    completions: w.value,
    xp: w.secondary ?? 0,
  }));

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="mb-4 text-lg font-semibold">Quest Activity</h3>
      <p className="mb-4 text-sm text-muted-foreground">
        12-week completion timeline
      </p>

      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="completionGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--meadow)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--meadow)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--golden-hour)"
                stopOpacity={0.3}
              />
              <stop
                offset="95%"
                stopColor="var(--golden-hour)"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="week"
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            axisLine={{ stroke: "var(--border)" }}
          />
          <YAxis
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
            type="monotone"
            dataKey="completions"
            stroke="var(--meadow)"
            fill="url(#completionGrad)"
            strokeWidth={2}
            name="Completions"
          />
          <Area
            type="monotone"
            dataKey="xp"
            stroke="var(--golden-hour)"
            fill="url(#xpGrad)"
            strokeWidth={2}
            name="XP Awarded"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
