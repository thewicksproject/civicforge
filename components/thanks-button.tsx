"use client";

import { useActionState, useState } from "react";
import { Heart } from "lucide-react";
import { createThanks } from "@/app/actions/thanks";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

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
        <Heart className="h-4 w-4 fill-current" />
        Thanks sent!
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
        <Heart className="h-4 w-4 text-golden-hour mr-1" />
        Say Thanks
      </Button>
    );
  }

  return (
    <form action={formAction} className="space-y-2">
      {state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      <Textarea
        name="message"
        rows={2}
        maxLength={500}
        placeholder="Add a thank you message (optional)"
        className="resize-none"
      />
      <div className="flex gap-2">
        <Button
          type="submit"
          size="sm"
          disabled={isPending}
          className="bg-golden-hour/20 text-foreground hover:bg-golden-hour/30"
        >
          {isPending ? "Sending..." : "Send Thanks"}
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
