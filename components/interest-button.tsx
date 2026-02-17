"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toggleInterest } from "@/app/actions/interests";
import { cn } from "@/lib/utils";

interface InterestButtonProps {
  postId: string;
  initialCount: number;
  initialInterested: boolean;
}

export function InterestButton({
  postId,
  initialCount,
  initialInterested,
}: InterestButtonProps) {
  const [interested, setInterested] = useState(initialInterested);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    // Optimistic update
    const wasInterested = interested;
    setInterested(!wasInterested);
    setCount((prev) => (wasInterested ? prev - 1 : prev + 1));

    startTransition(async () => {
      const result = await toggleInterest(postId);
      if (!result.success) {
        // Revert on failure
        setInterested(wasInterested);
        setCount((prev) => (wasInterested ? prev + 1 : prev - 1));
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
        interested
          ? "border-primary/30 bg-primary/10 text-primary"
          : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <Heart
        className={cn("h-4 w-4", interested && "fill-current")}
      />
      <span>
        {interested && count > 1
          ? `You + ${count - 1} other${count - 1 === 1 ? "" : "s"} care`
          : count > 0 && !interested
            ? `${count} neighbor${count === 1 ? "" : "s"} care`
            : count > 0 && interested
              ? "You care about this"
              : "I care about this"}
      </span>
    </button>
  );
}
