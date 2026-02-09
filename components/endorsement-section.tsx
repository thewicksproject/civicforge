"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SkillDomainBadge } from "@/components/skill-domain-badge";
import { createEndorsement, getEndorsementsForUser } from "@/app/actions/endorsements";
import { SKILL_DOMAINS, type SkillDomain } from "@/lib/types";
import { formatRelativeTime, cn } from "@/lib/utils";

const DOMAINS = Object.keys(SKILL_DOMAINS) as SkillDomain[];

type ProfileRef = { display_name: string; avatar_url: string | null };

interface EndorsementData {
  id: string;
  domain: string;
  skill: string | null;
  message: string | null;
  created_at: string;
  from_user: string;
  profiles: ProfileRef | ProfileRef[] | null;
}

interface EndorsementSectionProps {
  userId: string;
  isOwnProfile: boolean;
}

export function EndorsementSection({ userId, isOwnProfile }: EndorsementSectionProps) {
  const [endorsements, setEndorsements] = useState<EndorsementData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formDomain, setFormDomain] = useState<SkillDomain | null>(null);
  const [formMessage, setFormMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const result = await getEndorsementsForUser(userId);
        if (!cancelled && result.success) {
          setEndorsements(result.endorsements as EndorsementData[]);
        }
      } catch {
        // Silently handle fetch errors on unmounted component
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [userId]);

  async function handleEndorse() {
    if (!formDomain) return;
    setSubmitting(true);
    setError(null);

    const result = await createEndorsement({
      to_user: userId,
      domain: formDomain,
      message: formMessage || undefined,
    });

    if (result.success) {
      setShowForm(false);
      setFormDomain(null);
      setFormMessage("");
      // Reload endorsements
      const refreshed = await getEndorsementsForUser(userId);
      if (refreshed.success) {
        setEndorsements(refreshed.endorsements as EndorsementData[]);
      }
    } else {
      setError(result.error);
    }
    setSubmitting(false);
  }

  // Group endorsements by domain
  const byDomain = endorsements.reduce<Record<string, EndorsementData[]>>(
    (acc, e) => {
      (acc[e.domain] ??= []).push(e);
      return acc;
    },
    {},
  );

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Endorsements</h2>
        {!isOwnProfile && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Cancel" : "Endorse"}
          </Button>
        )}
      </div>

      {/* Endorse form */}
      {showForm && (
        <div className="mb-4 rounded-lg border border-border p-4 space-y-3">
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <p className="text-sm text-muted-foreground">
            Which domain would you endorse this person in?
          </p>
          <div className="flex flex-wrap gap-2">
            {DOMAINS.map((domain) => (
              <button
                key={domain}
                type="button"
                onClick={() => setFormDomain(domain)}
                aria-pressed={formDomain === domain}
                className={cn(
                  "transition-opacity",
                  formDomain === domain ? "opacity-100" : "opacity-50 hover:opacity-75",
                )}
              >
                <SkillDomainBadge domain={domain} size="sm" />
              </button>
            ))}
          </div>
          <Textarea
            value={formMessage}
            onChange={(e) => setFormMessage(e.target.value)}
            placeholder="Optional note about why you're endorsing..."
            maxLength={500}
          />
          <Button
            onClick={handleEndorse}
            disabled={!formDomain || submitting}
            size="sm"
          >
            {submitting ? "Endorsing..." : "Send Endorsement"}
          </Button>
        </div>
      )}

      {/* Endorsement list by domain */}
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : endorsements.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No endorsements yet.
        </p>
      ) : (
        <div className="space-y-4">
          {Object.entries(byDomain).map(([domain, items]) => (
            <div key={domain}>
              <div className="flex items-center gap-2 mb-2">
                <SkillDomainBadge domain={domain as SkillDomain} size="sm" />
                <span className="text-xs text-muted-foreground">
                  {items.length} endorsement{items.length === 1 ? "" : "s"}
                </span>
              </div>
              <div className="space-y-1.5 pl-4 border-l-2 border-border">
                {items.map((e) => {
                  const from = Array.isArray(e.profiles)
                    ? e.profiles[0]
                    : e.profiles;
                  return (
                    <div key={e.id} className="text-sm">
                      <span className="font-medium">
                        {from?.display_name ?? "Someone"}
                      </span>
                      {e.message && (
                        <span className="text-muted-foreground">
                          {" "}&mdash; {e.message}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground ml-2">
                        {formatRelativeTime(new Date(e.created_at))}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
