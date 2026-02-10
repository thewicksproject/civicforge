"use client";

import { useState } from "react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { DomainStat } from "@/app/actions/commons";
import { SKILL_DOMAINS } from "@/lib/types";

type MetricKey = "practitioners" | "avgLevel" | "questsCompleted";

const METRICS: { key: MetricKey; label: string }[] = [
  { key: "practitioners", label: "Practitioners" },
  { key: "avgLevel", label: "Avg Level" },
  { key: "questsCompleted", label: "Quests Completed" },
];

interface DomainRadarProps {
  domains: DomainStat[];
}

export function DomainRadar({ domains }: DomainRadarProps) {
  const [metric, setMetric] = useState<MetricKey>("practitioners");

  // Build data for all 7 domains (even if some have 0)
  const allDomains = Object.keys(SKILL_DOMAINS) as Array<
    keyof typeof SKILL_DOMAINS
  >;
  const chartData = allDomains.map((domain) => {
    const stat = domains.find((d) => d.domain === domain);
    return {
      domain: SKILL_DOMAINS[domain].label,
      value: stat ? stat[metric] : 0,
    };
  });

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Skill Domains</h3>
        <div className="flex gap-1">
          {METRICS.map((m) => (
            <button
              key={m.key}
              onClick={() => setMetric(m.key)}
              className={`rounded-md px-2 py-1 text-xs transition-colors ${
                metric === m.key
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={chartData}>
          <PolarGrid stroke="var(--border)" />
          <PolarAngleAxis
            dataKey="domain"
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          />
          <PolarRadiusAxis
            tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
            axisLine={false}
          />
          <Radar
            dataKey="value"
            stroke="var(--meadow)"
            fill="var(--meadow)"
            fillOpacity={0.2}
            strokeWidth={2}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "0.5rem",
              color: "var(--foreground)",
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
