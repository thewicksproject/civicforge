"use client";

import { useState } from "react";
import { reviewPost, unhidePost } from "@/app/actions/admin";
import { unflagPost } from "@/app/actions/flags";
import { Button } from "@/components/ui/button";

interface ReviewActionsProps {
  postId: string;
  type: "review" | "flag";
  isHidden?: boolean;
}

export function ReviewActions({ postId, type, isHidden }: ReviewActionsProps) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleReview(decision: "approved" | "rejected") {
    setLoading(true);
    await reviewPost(postId, decision);
    setDone(true);
    setLoading(false);
  }

  async function handleUnhide() {
    setLoading(true);
    await unhidePost(postId);
    setDone(true);
    setLoading(false);
  }

  async function handleUnflag() {
    setLoading(true);
    await unflagPost(postId);
    setDone(true);
    setLoading(false);
  }

  if (done) {
    return (
      <span className="text-xs text-offer font-medium">Done</span>
    );
  }

  if (type === "review") {
    return (
      <div className="flex gap-2 flex-shrink-0">
        <Button
          size="sm"
          onClick={() => handleReview("approved")}
          disabled={loading}
        >
          Approve
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => handleReview("rejected")}
          disabled={loading}
        >
          Reject
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2 flex-shrink-0">
      {isHidden && (
        <Button size="sm" onClick={handleUnhide} disabled={loading}>
          Unhide
        </Button>
      )}
      <Button
        size="sm"
        variant="outline"
        onClick={handleUnflag}
        disabled={loading}
      >
        Clear Flags
      </Button>
    </div>
  );
}
