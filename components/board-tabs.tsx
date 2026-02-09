"use client";

import Link from "next/link";
import { LayoutGrid, Sword } from "lucide-react";
import { cn } from "@/lib/utils";

interface BoardTabsProps {
  activeTab: "posts" | "quests";
  postCount: number;
  questCount: number;
}

export function BoardTabs({ activeTab, postCount, questCount }: BoardTabsProps) {
  return (
    <div className="flex gap-1 mb-6 border-b border-border" role="tablist" aria-label="Board views">
      <Link
        href="/board?tab=posts"
        role="tab"
        aria-selected={activeTab === "posts"}
        className={cn(
          "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px",
          activeTab === "posts"
            ? "border-primary text-primary"
            : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
        )}
      >
        <LayoutGrid className="h-4 w-4" />
        Posts
        {postCount > 0 && (
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs">
            {postCount}
          </span>
        )}
      </Link>
      <Link
        href="/board?tab=quests"
        role="tab"
        aria-selected={activeTab === "quests"}
        className={cn(
          "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px",
          activeTab === "quests"
            ? "border-primary text-primary"
            : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
        )}
      >
        <Sword className="h-4 w-4" />
        Quests
        {questCount > 0 && (
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs">
            {questCount}
          </span>
        )}
      </Link>
    </div>
  );
}
