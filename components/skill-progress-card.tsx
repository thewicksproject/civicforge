"use client";

import { useEffect, useState } from "react";
import { Zap } from "lucide-react";
import { SkillDomainBadge } from "@/components/skill-domain-badge";
import { getSkillProgress } from "@/app/actions/skills";
import type { SkillDomain } from "@/lib/types";

interface SkillData {
  domain: string;
  total_xp: number;
  level: number;
  quests_completed: number;
  last_quest_at: string | null;
  xpToNextLevel: number;
  xpProgress: number;
}

interface SkillProgressCardProps {
  userId?: string;
}

export function SkillProgressCard({ userId }: SkillProgressCardProps) {
  const [skills, setSkills] = useState<SkillData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const result = await getSkillProgress(userId);
      if (result.success) {
        setSkills(result.skills);
      } else {
        setError(result.error);
      }
      setLoading(false);
    }
    load();
  }, [userId]);

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold mb-3">Skill Domains</h2>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold mb-3">Skill Domains</h2>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (skills.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold mb-3">Skill Domains</h2>
        <p className="text-sm text-muted-foreground">
          No skill progress yet. Complete quests to develop your domains.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-lg font-semibold mb-4">Skill Domains</h2>
      <div className="space-y-4">
        {skills.map((skill) => (
          <div key={skill.domain}>
            <div className="flex items-center justify-between mb-1.5">
              <SkillDomainBadge
                domain={skill.domain as SkillDomain}
                size="md"
              />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  Level {skill.level}
                </span>
                <span className="inline-flex items-center gap-0.5">
                  <Zap className="h-3 w-3" />
                  {skill.total_xp} XP
                </span>
              </div>
            </div>
            {/* XP progress bar */}
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{
                  width: `${skill.xpToNextLevel > 0
                    ? Math.min(100, (Math.max(0, skill.xpProgress) / skill.xpToNextLevel) * 100)
                    : 0}%`,
                }}
              />
            </div>
            <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
              <span>{skill.quests_completed} quest{skill.quests_completed === 1 ? "" : "s"} completed</span>
              <span>
                {Math.max(0, skill.xpProgress)} / {skill.xpToNextLevel} to next level
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
