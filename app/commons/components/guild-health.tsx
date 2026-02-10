"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { GuildStat } from "@/app/actions/commons";

const DOMAIN_COLORS: Record<string, string> = {
  craft: "var(--chart-craft)",
  green: "var(--chart-green)",
  care: "var(--chart-care)",
  bridge: "var(--chart-bridge)",
  signal: "var(--chart-signal)",
  hearth: "var(--chart-hearth)",
  weave: "var(--chart-weave)",
};

function charterStatus(days: number): {
  label: string;
  color: string;
} {
  if (days > 90) return { label: "Healthy", color: "var(--meadow)" };
  if (days > 30) return { label: "Aging", color: "var(--golden-hour)" };
  return { label: "Expiring", color: "var(--destructive)" };
}

interface GuildHealthProps {
  guilds: GuildStat[];
}

export function GuildHealth({ guilds }: GuildHealthProps) {
  if (guilds.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold">Guild Ecosystem</h3>
        <p className="text-sm text-muted-foreground">No active guilds yet.</p>
      </div>
    );
  }

  const chartData = guilds.map((g) => ({
    name: g.name,
    members: g.memberCount,
    domain: g.domain,
    charterDays: g.charterHealthDays,
  }));

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="mb-4 text-lg font-semibold">Guild Ecosystem</h3>

      <ResponsiveContainer width="100%" height={Math.max(200, guilds.length * 45)}>
        <BarChart data={chartData} layout="vertical" barSize={20}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            horizontal={false}
          />
          <XAxis
            type="number"
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            axisLine={{ stroke: "var(--border)" }}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            width={120}
            axisLine={{ stroke: "var(--border)" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "0.5rem",
              color: "var(--foreground)",
            }}
            formatter={(value, _name, props) => {
              const charter = charterStatus(
                (props as { payload: { charterDays: number } }).payload.charterDays
              );
              return [`${value} members (Charter: ${charter.label})`, "Guild"];
            }}
          />
          <Bar dataKey="members" name="Members" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, i) => (
              <Cell
                key={i}
                fill={DOMAIN_COLORS[entry.domain] ?? "var(--muted-foreground)"}
                fillOpacity={0.8}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Charter health legend */}
      <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
        {guilds.map((g) => {
          const status = charterStatus(g.charterHealthDays);
          return (
            <span key={g.name} className="flex items-center gap-1">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: status.color }}
              />
              {g.name}: {status.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
