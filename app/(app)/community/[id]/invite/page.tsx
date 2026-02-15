"use client";

import { useActionState, useState, use } from "react";
import { createInvitation } from "@/app/actions/invitations";

type ActionState = {
  success: boolean;
  error: string;
  data: { code: string; max_uses: number } | null;
};
const initialState: ActionState = { success: false, error: "", data: null };

export default function InvitePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [copied, setCopied] = useState<"code" | "link" | null>(null);
  const [maxUses, setMaxUses] = useState(1);

  const boundAction = async (prevState: ActionState): Promise<ActionState> => {
    void prevState;
    const result = await createInvitation(id, { maxUses });
    return {
      success: result.success,
      error: result.error ?? "",
      data:
        result.success && result.data
          ? { code: result.data.code, max_uses: result.data.max_uses }
          : null,
    };
  };

  const [state, formAction, isPending] = useActionState(
    boundAction,
    initialState
  );

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopied("code");
    setTimeout(() => setCopied(null), 2000);
  }

  function copyLink(code: string) {
    const url = `${window.location.origin}/join/${code}`;
    navigator.clipboard.writeText(url);
    setCopied("link");
    setTimeout(() => setCopied(null), 2000);
  }

  const isMultiUse = (state.data?.max_uses ?? 1) > 1;

  return (
    <div className="max-w-md mx-auto text-center py-8">
      <h1 className="text-2xl font-semibold mb-2">Invite Members</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Generate an invitation code to share with people you know.
        {maxUses > 1
          ? ` Multi-use codes expire after 30 days.`
          : ` Codes expire after 7 days.`}
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
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => copyCode(state.data!.code)}
              className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              {copied === "code" ? "Copied!" : "Copy Code"}
            </button>
            <button
              onClick={() => copyLink(state.data!.code)}
              className="rounded-lg border border-primary px-6 py-2.5 text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
            >
              {copied === "link" ? "Copied!" : "Copy Link"}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            {isMultiUse
              ? `This code can be used up to ${state.data.max_uses} times.`
              : "This code can only be used once."}
          </p>
        </div>
      ) : (
        <form action={formAction} className="space-y-6">
          {/* Multi-use toggle */}
          <div className="text-left">
            <label className="flex items-center gap-2 cursor-pointer mb-3">
              <input
                type="checkbox"
                checked={maxUses > 1}
                onChange={(e) => setMaxUses(e.target.checked ? 10 : 1)}
                className="rounded border-border"
              />
              <span className="text-sm">Allow multiple uses</span>
            </label>
            {maxUses > 1 && (
              <div className="flex items-center gap-3">
                <label htmlFor="maxUses" className="text-sm text-muted-foreground">
                  Max uses:
                </label>
                <input
                  id="maxUses"
                  type="number"
                  min={2}
                  max={50}
                  value={maxUses}
                  onChange={(e) =>
                    setMaxUses(Math.min(50, Math.max(2, Number(e.target.value))))
                  }
                  className="w-20 rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 w-full"
          >
            {isPending ? "Generating..." : "Generate Invitation Code"}
          </button>
        </form>
      )}
    </div>
  );
}
