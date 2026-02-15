"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createFromTemplate, forkActiveDesign } from "@/app/actions/game-designs";
import { cn } from "@/lib/utils";
import { displayLabel, CEREMONY_LEVEL_LABELS, QUANTIFICATION_LEVEL_LABELS } from "@/lib/game-config/display-labels";

interface Template {
  id: string;
  name: string;
  slug: string;
  description: string;
  value_statement: string;
  ceremony_level: string;
  quantification_level: string;
}

export function TemplatePicker({
  templates,
  isFork,
}: {
  templates: Template[];
  isFork: boolean;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    setLoading(true);
    setError(null);

    let result;
    if (isFork) {
      result = await forkActiveDesign();
    } else {
      if (!selected) {
        setError("Please select a template");
        setLoading(false);
        return;
      }
      result = await createFromTemplate(selected);
    }

    if (result.success) {
      router.push(`/game/design/${result.designId}/edit`);
    } else {
      setError(result.error);
      setLoading(false);
    }
  }

  if (isFork) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl bg-card p-6 shadow-sm">
          <h2 className="font-semibold mb-2">Fork Current Design</h2>
          <p className="text-sm text-muted-foreground mb-4">
            This creates a copy of your community&apos;s active game design as a draft.
            You can then make changes and submit it for a governance vote.
          </p>
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2 mb-4">
              {error}
            </p>
          )}
          <Button onClick={handleCreate} disabled={loading}>
            {loading ? "Creating Fork..." : "Create Fork"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {templates.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSelected(t.id)}
            className={cn(
              "rounded-xl border p-5 text-left transition-colors",
              selected === t.id
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "border-border hover:bg-muted",
            )}
          >
            <h3 className="font-semibold mb-1">{t.name}</h3>
            <p className="text-sm text-muted-foreground mb-3">
              {t.description}
            </p>
            <div className="flex gap-3 text-xs text-muted-foreground">
              <span>Style: {displayLabel(CEREMONY_LEVEL_LABELS, t.ceremony_level)}</span>
              <span>Tracking: {displayLabel(QUANTIFICATION_LEVEL_LABELS, t.quantification_level)}</span>
            </div>
          </button>
        ))}
      </div>

      <Button onClick={handleCreate} disabled={loading || !selected} className="w-full sm:w-auto">
        {loading ? "Creating Draft..." : "Create Draft from Template"}
      </Button>
      {!selected && !loading && (
        <p className="text-xs text-muted-foreground">Select a template above to continue</p>
      )}
    </div>
  );
}
