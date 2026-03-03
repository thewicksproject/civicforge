"use client";

import { useState } from "react";
import { QuestForm } from "@/components/quest-form";
import { QuestDecompose } from "@/components/quest-decompose";
import { cn } from "@/lib/utils";

type Tab = "create" | "decompose";

export function QuestCreationTabs() {
  const [tab, setTab] = useState<Tab>("create");

  return (
    <>
      {/* Tab toggle */}
      <div className="flex rounded-lg border border-border p-1 mb-6 bg-muted/30">
        <button
          type="button"
          onClick={() => setTab("create")}
          className={cn(
            "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            tab === "create"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Create a Quest
        </button>
        <button
          type="button"
          onClick={() => setTab("decompose")}
          className={cn(
            "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            tab === "decompose"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Break Down a Problem
        </button>
      </div>

      {/* Tab content */}
      {tab === "create" ? (
        <>
          <h1 className="text-2xl font-semibold mb-1">Create a Quest</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Define a task for your community with clear completion criteria.
          </p>
          <QuestForm />
        </>
      ) : (
        <>
          <h1 className="text-2xl font-semibold mb-1">
            Break Down a Problem
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            Describe a community issue and we&apos;ll suggest actionable quests.
          </p>
          <QuestDecompose />
        </>
      )}
    </>
  );
}
