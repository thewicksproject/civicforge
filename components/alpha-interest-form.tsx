"use client";

import { useState } from "react";
import { submitAlphaInterest } from "@/app/actions/waitlist";

export function AlphaInterestForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    const result = await submitAlphaInterest(email);
    if (result.success) {
      setStatus("success");
      setEmail("");
    } else {
      setError(result.error);
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <p className="mt-6 text-base text-muted-foreground">
        Thanks! We&apos;ll be in touch when your community is ready.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        required
        className="h-12 w-full max-w-xs rounded-full border border-border bg-card px-5 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:w-64"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex h-12 items-center justify-center rounded-full bg-golden-hour px-8 text-base font-medium text-accent-foreground shadow-sm transition-colors hover:bg-golden-hour/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-golden-hour disabled:opacity-50"
      >
        {status === "loading" ? "Sending..." : "Notify Me"}
      </button>
      {error && <p className="w-full text-center text-sm text-destructive">{error}</p>}
    </form>
  );
}
