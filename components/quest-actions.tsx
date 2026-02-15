"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { claimQuest, joinParty, completeQuest, validateQuest } from "@/app/actions/quests";

interface QuestActionsProps {
  questId: string;
  questStatus: string;
  isAuthor: boolean;
  isPartyMember?: boolean;
  hasValidated: boolean;
  validationMethod: string;
  validationCount: number;
  validationThreshold: number;
  maxPartySize?: number;
  currentPartySize?: number;
}

export function QuestActions({
  questId,
  questStatus,
  isAuthor,
  isPartyMember = false,
  hasValidated,
  validationMethod,
  validationCount,
  validationThreshold,
  maxPartySize = 1,
  currentPartySize = 0,
}: QuestActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showValidate, setShowValidate] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");

  async function handleClaim() {
    setLoading(true);
    setError(null);
    try {
      const result = await claimQuest(questId);
      if (result.success) {
        router.refresh();
      } else {
        setError(result.error);
      }
    } catch {
      setError("Failed to claim quest. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleComplete() {
    setLoading(true);
    setError(null);
    try {
      const result = await completeQuest(questId);
      if (result.success) {
        router.refresh();
      } else {
        setError(result.error);
      }
    } catch {
      setError("Failed to submit quest. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin() {
    setLoading(true);
    setError(null);
    try {
      const result = await joinParty(questId);
      if (result.success) {
        router.refresh();
      } else {
        setError(result.error);
      }
    } catch {
      setError("Failed to join quest. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleValidate(approved: boolean) {
    setLoading(true);
    setError(null);
    try {
      const result = await validateQuest(
        questId,
        approved,
        validationMessage || undefined,
      );
      if (result.success) {
        setShowValidate(false);
        setValidationMessage("");
        router.refresh();
      } else {
        setError(result.error);
      }
    } catch {
      setError("Failed to submit validation. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      {error && (
        <p className="text-sm text-destructive mb-3">{error}</p>
      )}

      {/* Open quest: show claim button (non-authors only) */}
      {questStatus === "open" && !isAuthor && (
        <div>
          <p className="text-sm text-muted-foreground mb-3">
            This quest is open and waiting for someone to take it on.
          </p>
          <Button onClick={handleClaim} disabled={loading}>
            {loading ? "Claiming..." : "Claim This Quest"}
          </Button>
        </div>
      )}

      {/* Claimed party quest: show join button for non-members */}
      {questStatus === "claimed" && !isAuthor && !isPartyMember && (
        <div>
          {currentPartySize >= maxPartySize ? (
            <p className="text-sm text-muted-foreground">
              This quest&apos;s party is full ({currentPartySize} of {maxPartySize} spots filled).
            </p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-3">
                {currentPartySize} of {maxPartySize} spots filled.
              </p>
              <Button onClick={handleJoin} disabled={loading}>
                {loading ? "Joining..." : "Join This Quest"}
              </Button>
            </>
          )}
        </div>
      )}

      {/* Claimed / in progress: show complete button (party member only) */}
      {(questStatus === "claimed" || questStatus === "in_progress") && isPartyMember && (
        <div>
          <p className="text-sm text-muted-foreground mb-3">
            {maxPartySize > 1 && "You\u2019ve joined this quest. "}
            {validationMethod === "self_report"
              ? "Since it's a Spark quest, you can mark it complete directly."
              : "When finished, submit it for peer validation."}
          </p>
          <Button onClick={handleComplete} disabled={loading}>
            {loading
              ? "Submitting..."
              : validationMethod === "self_report"
                ? "Mark Complete"
                : "Submit for Validation"}
          </Button>
        </div>
      )}

      {/* Pending validation: show validation progress + validate buttons */}
      {questStatus === "pending_validation" && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-muted-foreground">
              Awaiting validation: {validationCount} / {validationThreshold} approvals
            </p>
            {/* Progress bar */}
            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-offer rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (validationCount / Math.max(validationThreshold, 1)) * 100)}%`,
                }}
              />
            </div>
          </div>

          {!isAuthor && !hasValidated && (
            <>
              {!showValidate ? (
                <Button
                  variant="outline"
                  onClick={() => setShowValidate(true)}
                >
                  Validate This Quest
                </Button>
              ) : (
                <div className="space-y-3">
                  <Textarea
                    placeholder="Optional: add a note about the quest completion..."
                    value={validationMessage}
                    onChange={(e) => setValidationMessage(e.target.value)}
                    maxLength={500}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleValidate(true)}
                      disabled={loading}
                    >
                      {loading ? "..." : "Approve"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleValidate(false)}
                      disabled={loading}
                    >
                      {loading ? "..." : "Reject"}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setShowValidate(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          {hasValidated && (
            <p className="text-sm text-muted-foreground">
              You have already submitted your validation.
            </p>
          )}
        </div>
      )}

      {/* Completed */}
      {questStatus === "completed" && (
        <p className="text-sm text-offer font-medium">
          This quest has been completed. XP has been awarded.
        </p>
      )}

      {/* Author viewing their open quest */}
      {questStatus === "open" && isAuthor && (
        <p className="text-sm text-muted-foreground">
          Waiting for someone to claim your quest.
        </p>
      )}
    </div>
  );
}
