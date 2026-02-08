"use client";

import { useActionState } from "react";
import { createResponse } from "@/app/actions/responses";
import { formatRelativeTime } from "@/lib/utils";
import { NoResponsesIllustration } from "./illustrations";
import { ReputationBadge } from "./reputation-badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ResponseItem {
  id: string;
  message: string;
  status: "pending" | "accepted" | "declined";
  responder: {
    id: string;
    display_name: string;
    reputation_score: number;
  };
  created_at: string;
}

interface ResponseListProps {
  postId: string;
  responses: ResponseItem[];
  isAuthor: boolean;
  canRespond: boolean;
  hasResponded: boolean;
}

type ActionState = { success: boolean; error: string };
const initialState: ActionState = { success: false, error: "" };

export function ResponseList({
  postId,
  responses,
  isAuthor,
  canRespond,
  hasResponded,
}: ResponseListProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        Responses ({responses.length})
      </h3>

      {responses.length === 0 && (
        <div className="py-4 text-center">
          <NoResponsesIllustration className="h-16 w-auto mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            No responses yet. Be the first to help!
          </p>
        </div>
      )}

      {responses.map((response) => (
        <div
          key={response.id}
          className="rounded-lg border border-border bg-card p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">
                {response.responder.display_name}
              </span>
              <ReputationBadge
                score={response.responder.reputation_score}
                size="sm"
              />
            </div>
            <div className="flex items-center gap-2">
              {response.status !== "pending" && (
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    response.status === "accepted"
                      ? "bg-offer-light text-offer"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {response.status === "accepted" ? "Accepted" : "Declined"}
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(new Date(response.created_at))}
              </span>
            </div>
          </div>
          <p className="text-sm text-foreground">{response.message}</p>
        </div>
      ))}

      {/* Respond form */}
      {canRespond && !hasResponded && !isAuthor && (
        <ResponseForm postId={postId} />
      )}

      {hasResponded && (
        <p className="text-sm text-muted-foreground text-center py-2">
          You&apos;ve already responded to this post.
        </p>
      )}
    </div>
  );
}

function ResponseForm({ postId }: { postId: string }) {
  const boundAction = async (_prev: ActionState, formData: FormData): Promise<ActionState> => {
    const message = formData.get("message") as string;
    const result = await createResponse(postId, message);
    return { success: result.success, error: result.error ?? "" };
  };
  const [state, formAction, isPending] = useActionState(
    boundAction,
    initialState
  );

  return (
    <form action={formAction} className="space-y-3">
      {state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      <Textarea
        name="message"
        required
        minLength={10}
        maxLength={1000}
        rows={3}
        placeholder="I can help! Here's what I'm thinking..."
        className="resize-y"
      />
      <Button type="submit" disabled={isPending}>
        {isPending ? "Sending..." : "I Can Help"}
      </Button>
    </form>
  );
}
