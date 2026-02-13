"use client";

import { useActionState, useState } from "react";
import { Shield } from "lucide-react";
import { createVouch } from "@/app/actions/vouches";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface VouchButtonProps {
  toUserId: string;
}

type ActionState = { success: boolean; promoted: boolean; error: string };
const initialState: ActionState = { success: false, promoted: false, error: "" };

export function VouchButton({ toUserId }: VouchButtonProps) {
  const [showForm, setShowForm] = useState(false);

  const boundAction = async (
    _prev: ActionState,
    formData: FormData,
  ): Promise<ActionState> => {
    const message = (formData.get("message") as string) || undefined;
    const result = await createVouch({ to_user: toUserId, message });
    return {
      success: result.success,
      promoted: result.success ? (result.promoted ?? false) : false,
      error: result.error ?? "",
    };
  };

  const [state, formAction, isPending] = useActionState(
    boundAction,
    initialState,
  );

  if (state.success) {
    return (
      <div className="flex items-center gap-2 text-sm text-golden-hour font-medium">
        <Shield className="h-4 w-4 fill-current" />
        {state.promoted ? "Vouched — promoted to Pillar!" : "Vouch sent!"}
      </div>
    );
  }

  if (!showForm) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowForm(true)}
        className="border-golden-hour/30 bg-golden-hour/5 hover:bg-golden-hour/10"
      >
        <Shield className="h-4 w-4 text-golden-hour mr-1" />
        Vouch
      </Button>
    );
  }

  return (
    <form action={formAction} className="space-y-2">
      {state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      <p className="text-xs text-muted-foreground">
        Vouching helps this person reach Pillar status (Tier 3). This cannot be
        undone.
      </p>
      <Textarea
        name="message"
        rows={2}
        maxLength={500}
        placeholder="Why are you vouching for this person? (optional)"
        className="resize-none"
      />
      <div className="flex gap-2">
        <Button
          type="submit"
          size="sm"
          disabled={isPending}
          className="bg-golden-hour/20 text-foreground hover:bg-golden-hour/30"
        >
          {isPending ? "Vouching..." : "Confirm Vouch"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowForm(false)}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
