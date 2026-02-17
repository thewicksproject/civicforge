"use client";

import { useState, useTransition } from "react";
import { BookOpen } from "lucide-react";
import { createCompletionStory } from "@/app/actions/stories";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface CompletionStoryFormProps {
  postId: string;
}

export function CompletionStoryForm({ postId }: CompletionStoryFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [story, setStory] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (submitted) {
    return (
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
        <BookOpen className="h-6 w-6 mx-auto mb-2 text-primary" />
        <p className="text-sm font-medium">Story shared! Thanks for telling your community what happened.</p>
      </div>
    );
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4 text-center hover:bg-primary/10 transition-colors"
      >
        <BookOpen className="h-5 w-5 mx-auto mb-1.5 text-primary" />
        <p className="text-sm font-medium text-primary">This need was fulfilled! Tell the story.</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          What happened? Who helped? Share the story with your community.
        </p>
      </button>
    );
  }

  function handleSubmit() {
    setError("");
    startTransition(async () => {
      const result = await createCompletionStory(postId, story);
      if (result.success) {
        setSubmitted(true);
      } else {
        setError(result.error ?? "Something went wrong");
      }
    });
  }

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
      <div className="flex items-center gap-2 mb-3">
        <BookOpen className="h-5 w-5 text-primary" />
        <h3 className="text-sm font-semibold">What happened?</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Tell your community the story of how this need was met. Who helped? What was it like?
      </p>
      {error && <p className="text-sm text-destructive mb-2">{error}</p>}
      <Textarea
        value={story}
        onChange={(e) => setStory(e.target.value)}
        placeholder="James showed up with his truck on Saturday morning. We had the whole apartment moved by noon..."
        rows={4}
        maxLength={2000}
        className="resize-y mb-3"
      />
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsOpen(false)}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Cancel
        </button>
        <Button onClick={handleSubmit} disabled={isPending || story.length < 10}>
          {isPending ? "Sharing..." : "Share Story"}
        </Button>
      </div>
    </div>
  );
}
