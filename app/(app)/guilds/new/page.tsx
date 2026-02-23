"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SkillDomainBadge } from "@/components/skill-domain-badge";
import { createGuild } from "@/app/actions/guilds";
import { SKILL_DOMAINS, type SkillDomain } from "@/lib/types";
import { cn } from "@/lib/utils";

const DOMAINS = Object.keys(SKILL_DOMAINS) as SkillDomain[];

export default function NewGuildPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [domain, setDomain] = useState<SkillDomain | null>(null);
  const [description, setDescription] = useState("");
  const [charter, setCharter] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !domain) return;

    setSubmitting(true);
    setError(null);

    const result = await createGuild({
      name,
      domain,
      description: description || undefined,
      charter: charter || undefined,
    });

    if (result.success) {
      router.push(`/guilds/${result.guildId}`);
    } else {
      setError(result.error);
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-1">Found a Guild</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Create a persistent group organized around a skill domain.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <p className="text-sm text-destructive bg-destructive/10 rounded-lg p-3">
            {error}
          </p>
        )}

        <div>
          <label className="text-sm font-medium mb-1.5 block">Guild Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Green Thumbs"
            maxLength={60}
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Domain</label>
          <p className="text-xs text-muted-foreground mb-2">
            One active guild per domain per community.
          </p>
          <div className="flex flex-wrap gap-2">
            {DOMAINS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDomain(d)}
                aria-pressed={domain === d}
                className={cn(
                  "transition-opacity",
                  domain === d ? "opacity-100" : "opacity-50 hover:opacity-75"
                )}
              >
                <SkillDomainBadge domain={d} size="sm" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">
            Description <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does this guild do?"
            maxLength={500}
            rows={3}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">
            Charter <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <p className="text-xs text-muted-foreground mb-1.5">
            Charters include a sunset clause and must be renewed.
          </p>
          <Textarea
            value={charter}
            onChange={(e) => setCharter(e.target.value)}
            placeholder="Guild charter, values, and operating agreements..."
            maxLength={5000}
            rows={5}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={!name || !domain || submitting}>
            {submitting ? "Creating..." : "Create Guild"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
