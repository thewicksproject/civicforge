import Link from "next/link";
import { cn, formatRelativeTime, truncate } from "@/lib/utils";
import { TRUST_TIER_LABELS, type TrustTier } from "@/lib/types";
import { ReputationBadge } from "./reputation-badge";
import { AiBadge } from "./ai-badge";

interface PostCardProps {
  id: string;
  type: "need" | "offer";
  title: string;
  description: string;
  category: string;
  authorName: string;
  authorReputation: number;
  authorTrustTier: TrustTier;
  responseCount: number;
  photoCount: number;
  createdAt: string;
  urgency?: "low" | "medium" | "high" | null;
  aiAssisted?: boolean;
}

export function PostCard({
  id,
  type,
  title,
  description,
  category,
  authorName,
  authorReputation,
  authorTrustTier,
  responseCount,
  photoCount,
  createdAt,
  urgency,
  aiAssisted,
}: PostCardProps) {
  const isNeed = type === "need";

  return (
    <Link
      href={`/board/${id}`}
      className="block rounded-xl bg-card border border-border p-5 card-hover"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Type badge + category */}
          <div className="flex items-center gap-2 mb-2">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                isNeed
                  ? "bg-need-light text-need"
                  : "bg-offer-light text-offer"
              )}
            >
              {isNeed ? "Need" : "Offer"}
            </span>
            <span className="text-xs text-muted-foreground capitalize">
              {category.replace(/_/g, " ")}
            </span>
            {urgency === "high" && (
              <span className="text-xs text-destructive font-medium">
                Urgent
              </span>
            )}
            {aiAssisted && <AiBadge />}
          </div>

          {/* Title */}
          <h3 className="text-base font-semibold leading-snug mb-1">
            {title}
          </h3>

          {/* Description preview */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {truncate(description, 120)}
          </p>
        </div>

        {/* Photo indicator */}
        {photoCount > 0 && (
          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
            <svg
              className="h-5 w-5 text-muted-foreground"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
            {photoCount > 1 && (
              <span className="text-[10px] text-muted-foreground ml-0.5">
                {photoCount}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{authorName}</span>
          <ReputationBadge score={authorReputation} size="sm" />
          <span className="text-xs">
            {TRUST_TIER_LABELS[authorTrustTier]}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {responseCount > 0 && (
            <span>
              {responseCount} {responseCount === 1 ? "response" : "responses"}
            </span>
          )}
          <span>{formatRelativeTime(new Date(createdAt))}</span>
        </div>
      </div>
    </Link>
  );
}
