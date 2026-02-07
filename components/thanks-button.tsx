"use client";

import { useActionState, useState } from "react";
import { createThanks } from "@/app/actions/thanks";

interface ThanksButtonProps {
  toUserId: string;
  postId: string | null;
}

type ActionState = { success: boolean; error: string };
const initialState: ActionState = { success: false, error: "" };

export function ThanksButton({ toUserId, postId }: ThanksButtonProps) {
  const [showForm, setShowForm] = useState(false);

  const boundAction = async (_prev: ActionState, formData: FormData): Promise<ActionState> => {
    const message = (formData.get("message") as string) || null;
    const result = await createThanks(toUserId, postId, message);
    return { success: result.success, error: result.error ?? "" };
  };

  const [state, formAction, isPending] = useActionState(
    boundAction,
    initialState
  );

  if (state.success) {
    return (
      <div className="flex items-center gap-2 text-sm text-offer font-medium">
        <svg
          className="h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
        </svg>
        Thanks sent!
      </div>
    );
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="flex items-center gap-1.5 rounded-lg border border-golden-hour/30 bg-golden-hour/5 px-3 py-2 text-sm font-medium text-foreground hover:bg-golden-hour/10 transition-colors"
      >
        <svg
          className="h-4 w-4 text-golden-hour"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
        Say Thanks
      </button>
    );
  }

  return (
    <form action={formAction} className="space-y-2">
      {state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      <textarea
        name="message"
        rows={2}
        maxLength={500}
        placeholder="Add a thank you message (optional)"
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-golden-hour/20 px-3 py-1.5 text-sm font-medium hover:bg-golden-hour/30 transition-colors disabled:opacity-50"
        >
          {isPending ? "Sending..." : "Send Thanks"}
        </button>
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
