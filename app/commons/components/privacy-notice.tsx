import { ShieldCheck } from "lucide-react";

export function PrivacyNotice() {
  return (
    <div className="rounded-xl border border-border bg-card px-6 py-4">
      <div className="flex items-start gap-3">
        <ShieldCheck
          className="mt-0.5 h-5 w-5 shrink-0 text-meadow"
          aria-hidden="true"
        />
        <div className="text-sm text-muted-foreground">
          <p className="font-medium text-foreground">
            Privacy-respecting dashboard
          </p>
          <p className="mt-1">
            The Commons shows only aggregate counts, distributions, and
            averages — never individual names, actions, or personal data.
            Groups smaller than 3 are suppressed to protect privacy.
          </p>
        </div>
      </div>
    </div>
  );
}
