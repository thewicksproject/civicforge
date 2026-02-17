"use client";

import { useActionState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createResponse, updateResponseStatus } from "@/app/actions/responses";
import { formatRelativeTime } from "@/lib/utils";
import { NoResponsesIllustration } from "./illustrations";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ResponseItem {
  id: string;
  message: string;
  status: "pending" | "accepted" | "declined";
  responder: {
    id: string;
    display_name: string;
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
  const hasAnyAccepted = responses.some((r) => r.status === "accepted");

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        Responses ({responses.length})
      </h3>

      {isAuthor && responses.some((r) => r.status === "pending") && !hasAnyAccepted && (
        <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
          Review responses and accept one to get started
        </p>
      )}

      {responses.length === 0 && (
        <div className="py-4 text-center">
          <NoResponsesIllustration className="h-16 w-auto mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            No responses yet. Be the first to help!
          </p>
        </div>
      )}

      {responses.map((response) => (
        <ResponseCard
          key={response.id}
          response={response}
          isAuthor={isAuthor}
          hasAnyAccepted={hasAnyAccepted}
        />
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

function ResponseCard({
  response,
  isAuthor,
  hasAnyAccepted,
}: {
  response: ResponseItem;
  isAuthor: boolean;
  hasAnyAccepted: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isGrayedOut = hasAnyAccepted && response.status === "pending";

  function handleStatusUpdate(status: "accepted" | "declined") {
    startTransition(async () => {
      const result = await updateResponseStatus(response.id, status);
      if (result.success) {
        router.refresh();
      }
    });
  }

  return (
    <div
      className={`rounded-lg border border-border bg-card p-4 ${
        isGrayedOut ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-sm">
          {response.responder.display_name}
        </span>
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

      {isAuthor && response.status === "pending" && !hasAnyAccepted && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-border">
          <Button
            size="sm"
            onClick={() => handleStatusUpdate("accepted")}
            disabled={isPending}
            className="bg-offer text-white hover:bg-offer/90"
          >
            {isPending ? "..." : "Accept"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleStatusUpdate("declined")}
            disabled={isPending}
            className="text-muted-foreground"
          >
            Decline
          </Button>
        </div>
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
