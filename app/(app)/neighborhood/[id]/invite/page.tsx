"use client";

import { useActionState, useState, use } from "react";
import { createInvitation } from "@/app/actions/invitations";

type ActionState = { success: boolean; error: string; data: { code: string } | null };
const initialState: ActionState = { success: false, error: "", data: null };

export default function InvitePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [copied, setCopied] = useState(false);

  const boundAction = async (_prev: ActionState): Promise<ActionState> => {
    const result = await createInvitation(id);
    return {
      success: result.success,
      error: result.error ?? "",
      data: result.success && result.data ? { code: result.data.code } : null,
    };
  };

  const [state, formAction, isPending] = useActionState(
    boundAction,
    initialState
  );

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="max-w-md mx-auto text-center py-8">
      <h1 className="text-2xl font-semibold mb-2">Invite a Neighbor</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Generate an invitation code to share with someone you know. Codes
        expire after 7 days.
      </p>

      {state.error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive mb-4">
          {state.error}
        </div>
      )}

      {state.success && state.data?.code ? (
        <div className="space-y-4">
          <div className="rounded-xl border-2 border-primary bg-primary/5 p-6">
            <p className="text-xs text-muted-foreground mb-2">
              Invitation Code
            </p>
            <p className="text-3xl font-mono font-bold tracking-[0.3em] text-primary">
              {state.data.code}
            </p>
          </div>
          <button
            onClick={() => copyCode(state.data!.code)}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            {copied ? "Copied!" : "Copy Code"}
          </button>
          <p className="text-xs text-muted-foreground">
            Share this code with your neighbor. It can only be used once.
          </p>
        </div>
      ) : (
        <form action={formAction}>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isPending ? "Generating..." : "Generate Invitation Code"}
          </button>
        </form>
      )}
    </div>
  );
}
