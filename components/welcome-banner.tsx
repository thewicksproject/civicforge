"use client";

import { useState } from "react";
import Link from "next/link";
import { X, Sparkles } from "lucide-react";
import { dismissWelcomeBanner } from "@/app/actions/onboarding-guide";

interface WelcomeBannerProps {
  inviterName: string | null;
  communityName: string | null;
  suggestedPosts: Array<{
    id: string;
    title: string;
    type: string;
    category: string;
  }>;
}

export function WelcomeBanner({
  inviterName,
  communityName,
  suggestedPosts,
}: WelcomeBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  async function handleDismiss() {
    setDismissed(true);
    await dismissWelcomeBanner();
  }

  return (
    <div className="relative rounded-xl border border-border bg-card p-5 mb-6">
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
        aria-label="Dismiss welcome banner"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-3 pr-8">
        <Sparkles className="h-5 w-5 text-golden-hour mt-0.5 flex-shrink-0" />
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">
            Welcome to {communityName ?? "CivicForge"}!
          </h3>
          <p className="text-sm text-muted-foreground">
            {inviterName
              ? `${inviterName} invited you. You're in good company.`
              : "Glad you're here."}
          </p>

          {suggestedPosts.length > 0 ? (
            <div className="mt-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Based on your skills, you might help with:
              </p>
              <div className="space-y-1.5">
                {suggestedPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/board/${post.id}`}
                    className="block rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted/50 transition-colors"
                  >
                    <span className="font-medium">{post.title}</span>
                    <span className="ml-2 text-xs text-muted-foreground capitalize">
                      {post.type}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Your first post or response is just a click away.
            </p>
          )}

          <button
            onClick={handleDismiss}
            className="mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors underline"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
