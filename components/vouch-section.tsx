"use client";

import { useState, useEffect } from "react";
import { Shield } from "lucide-react";
import { getVouchesForUser } from "@/app/actions/vouches";
import { formatRelativeTime } from "@/lib/utils";

type ProfileRef = { display_name: string; avatar_url: string | null };

interface VouchData {
  id: string;
  message: string | null;
  created_at: string;
  from_user: string;
  profiles: ProfileRef | ProfileRef[] | null;
}

interface VouchSectionProps {
  userId: string;
}

export function VouchSection({ userId }: VouchSectionProps) {
  const [vouches, setVouches] = useState<VouchData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const result = await getVouchesForUser(userId);
        if (!cancelled && result.success) {
          setVouches(result.vouches as VouchData[]);
        }
      } catch {
        // Silently handle fetch errors on unmounted component
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (loading) {
    return null;
  }

  if (vouches.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-5 w-5 text-golden-hour" />
        <h2 className="text-lg font-semibold">Vouches</h2>
        <span className="text-xs text-muted-foreground">
          {vouches.length} vouch{vouches.length === 1 ? "" : "es"}
        </span>
      </div>
      <div className="space-y-2 pl-4 border-l-2 border-golden-hour/20">
        {vouches.map((v) => {
          const from = Array.isArray(v.profiles)
            ? v.profiles[0]
            : v.profiles;
          return (
            <div key={v.id} className="text-sm">
              <span className="font-medium">
                {from?.display_name ?? "Someone"}
              </span>
              {v.message && (
                <span className="text-muted-foreground">
                  {" "}&mdash; {v.message}
                </span>
              )}
              <span className="text-xs text-muted-foreground ml-2">
                {formatRelativeTime(new Date(v.created_at))}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
