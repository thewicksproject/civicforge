"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { joinGuild, leaveGuild } from "@/app/actions/guilds";

interface GuildActionsProps {
  guildId: string;
  isMember: boolean;
  isSteward: boolean;
}

export function GuildActions({ guildId, isMember, isSteward }: GuildActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleJoin() {
    setLoading(true);
    setError(null);
    try {
      const result = await joinGuild(guildId);
      if (result.success) {
        router.refresh();
      } else {
        setError(result.error);
      }
    } catch {
      setError("Failed to join guild. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLeave() {
    setLoading(true);
    setError(null);
    try {
      const result = await leaveGuild(guildId);
      if (result.success) {
        router.refresh();
      } else {
        setError(result.error);
      }
    } catch {
      setError("Failed to leave guild. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {error && (
        <p className="text-sm text-destructive mb-3">{error}</p>
      )}

      {!isMember && (
        <Button onClick={handleJoin} disabled={loading}>
          {loading ? "Joining..." : "Join Guild"}
        </Button>
      )}

      {isMember && !isSteward && (
        <Button variant="outline" onClick={handleLeave} disabled={loading}>
          {loading ? "Leaving..." : "Leave Guild"}
        </Button>
      )}

      {isSteward && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-golden-hour font-medium">You are a steward of this guild</span>
          <Button variant="outline" size="sm" onClick={handleLeave} disabled={loading}>
            {loading ? "..." : "Leave Guild"}
          </Button>
        </div>
      )}
    </div>
  );
}
