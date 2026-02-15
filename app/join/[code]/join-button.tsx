"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { redeemInvitation } from "@/app/actions/invitations";

export function JoinButton({ code }: { code: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleJoin() {
    setLoading(true);
    setError(null);
    try {
      const result = await redeemInvitation(code);
      if (result.success) {
        router.push("/board");
      } else {
        setError(result.error);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive mb-4">
          {error}
        </div>
      )}
      <button
        onClick={handleJoin}
        disabled={loading}
        className="rounded-lg bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {loading ? "Joining..." : "Join Community"}
      </button>
    </div>
  );
}
