"use client";

import { useState } from "react";
import { Flag, ArrowRightLeft, AlertTriangle, ChevronLeft } from "lucide-react";
import { flagPost, unflagByUser } from "@/app/actions/flags";
import { POST_CATEGORIES } from "@/lib/types";
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
  userHasFlagged?: boolean;
}

type Step = "choose" | "suggest" | "report";

export function FlagButton({ postId, userHasFlagged = false }: FlagButtonProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("choose");
  const [reason, setReason] = useState("");
  const [suggestedCategory, setSuggestedCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    error?: string;
    message?: string;
  } | null>(null);
  const [hasFlagged, setHasFlagged] = useState(userHasFlagged);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      // Reset state on close
      setTimeout(() => {
        setStep("choose");
        setReason("");
        setSuggestedCategory("");
        setResult(null);
      }, 200);
    }
  }

  async function handleSuggest() {
    setLoading(true);
    const res = await flagPost(postId, {
      flagType: "suggest_move",
      reason: reason || undefined,
      suggestedCategory: suggestedCategory || undefined,
    });
    if (res.success) {
      setResult({ success: true, message: "Suggestion sent. Thanks for helping!" });
      setHasFlagged(true);
    } else {
      setResult({ success: false, error: res.error });
    }
    setLoading(false);
    if (res.success) {
      setTimeout(() => setOpen(false), 1500);
    }
  }

  async function handleReport() {
    setLoading(true);
    const res = await flagPost(postId, {
      flagType: "report",
      reason: reason || undefined,
    });
    if (res.success) {
      setResult({ success: true, message: "Post flagged. Thank you for keeping the community safe." });
      setHasFlagged(true);
    } else {
      setResult({ success: false, error: res.error });
    }
    setLoading(false);
    if (res.success) {
      setTimeout(() => setOpen(false), 1500);
    }
  }

  async function handleUnflag() {
    setLoading(true);
    const res = await unflagByUser(postId);
    if (res.success) {
      setHasFlagged(false);
      setResult({ success: true, message: "Flag removed." });
    } else {
      setResult({ success: false, error: res.error });
    }
    setLoading(false);
    if (res.success) {
      setTimeout(() => setOpen(false), 1500);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <Flag className="h-4 w-4 mr-1" />
          {hasFlagged ? "Flagged" : "Flag"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        {result?.success ? (
          <div className="py-4">
            <p className="text-sm text-offer font-medium">{result.message}</p>
          </div>
        ) : step === "choose" ? (
          <>
            <DialogHeader>
              <DialogTitle>What would you like to do?</DialogTitle>
              <DialogDescription>
                Help the community by suggesting improvements or flagging concerns.
              </DialogDescription>
            </DialogHeader>

            {result?.error && (
              <p className="text-sm text-destructive">{result.error}</p>
            )}

            <div className="grid gap-3 mt-2">
              <button
                onClick={() => setStep("suggest")}
                className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:bg-muted/50"
              >
                <ArrowRightLeft className="h-5 w-5 text-horizon mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Suggest a change</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Recommend a better category or suggest this could be a quest
                  </p>
                </div>
              </button>
              <button
                onClick={() => setStep("report")}
                className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:bg-muted/50"
              >
                <AlertTriangle className="h-5 w-5 text-rose-clay mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Report a concern</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Flag something that doesn&apos;t belong. 3 reports auto-hides a post.
                  </p>
                </div>
              </button>
              {hasFlagged && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUnflag}
                  disabled={loading}
                  className="mt-1"
                >
                  {loading ? "Removing..." : "Remove my flag"}
                </Button>
              )}
            </div>
          </>
        ) : step === "suggest" ? (
          <>
            <DialogHeader>
              <DialogTitle>Suggest a change</DialogTitle>
              <DialogDescription>
                The post author will receive a gentle notification with your suggestion.
              </DialogDescription>
            </DialogHeader>

            {result?.error && (
              <p className="text-sm text-destructive">{result.error}</p>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  What would you suggest?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {POST_CATEGORIES.filter((c) => c.value !== "other").map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setSuggestedCategory(cat.value)}
                      className={`rounded-lg border px-3 py-2 text-xs transition-colors ${
                        suggestedCategory === cat.value
                          ? "border-primary bg-primary/10 text-primary font-medium"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                  <button
                    onClick={() => setSuggestedCategory("__quest")}
                    className={`rounded-lg border px-3 py-2 text-xs transition-colors col-span-2 ${
                      suggestedCategory === "__quest"
                        ? "border-primary bg-primary/10 text-primary font-medium"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    This could be a quest
                  </button>
                </div>
              </div>

              <Textarea
                placeholder="Add a note (optional)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                maxLength={500}
                rows={2}
              />

              <div className="flex justify-between gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setStep("choose"); setResult(null); }}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setOpen(false)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSuggest}
                    disabled={loading || !suggestedCategory}
                  >
                    {loading ? "Sending..." : "Send Suggestion"}
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Report a concern</DialogTitle>
              <DialogDescription>
                Let the community know if something seems off. A post is hidden after
                {" "}3 flags from different neighbors.
              </DialogDescription>
            </DialogHeader>

            {result?.error && (
              <p className="text-sm text-destructive">{result.error}</p>
            )}

            <div className="space-y-4">
              <Textarea
                placeholder="Why are you flagging this? (optional)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                maxLength={500}
                rows={3}
              />
              <div className="flex justify-between gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setStep("choose"); setResult(null); }}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setOpen(false)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleReport}
                    disabled={loading}
                  >
                    {loading ? "Flagging..." : "Flag Post"}
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
