"use client";

import { useState } from "react";
import { flagPost } from "@/app/actions/flags";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface FlagButtonProps {
  postId: string;
}

export function FlagButton({ postId }: FlagButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    error?: string;
  } | null>(null);

  async function handleFlag() {
    setLoading(true);
    const res = await flagPost(postId, reason || undefined);
    setResult({ success: res.success, error: res.error });
    setLoading(false);
    if (res.success) {
      setTimeout(() => setOpen(false), 1500);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <svg
            className="h-4 w-4 mr-1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
            <line x1="4" x2="4" y1="22" y2="15" />
          </svg>
          Flag
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Flag this post</DialogTitle>
          <DialogDescription>
            Let the community know if something seems off. A post is hidden after
            {" "}3 flags from different neighbors.
          </DialogDescription>
        </DialogHeader>

        {result?.success ? (
          <p className="text-sm text-offer font-medium py-2">
            Post flagged. Thank you for keeping the community safe.
          </p>
        ) : (
          <div className="space-y-4">
            {result?.error && (
              <p className="text-sm text-destructive">{result.error}</p>
            )}
            <Textarea
              placeholder="Why are you flagging this? (optional)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={500}
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleFlag}
                disabled={loading}
              >
                {loading ? "Flagging..." : "Flag Post"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
