import Link from "next/link";
import { Image as ImageIcon, TriangleAlert } from "lucide-react";
import { cn, formatRelativeTime, truncate } from "@/lib/utils";
import type { TrustTier } from "@/lib/types";
import { CATEGORY_ICON_MAP } from "./category-icons";
import { TrustTierBadge } from "./trust-tier-badge";
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
      className={cn(
        "block rounded-xl bg-card border border-border p-5 card-hover border-l-[3px]",
        isNeed ? "border-l-need" : "border-l-offer"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Type badge */}
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

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 capitalize">
              {(() => { const Icon = CATEGORY_ICON_MAP[category]; return Icon ? <Icon className="h-3 w-3" /> : null; })()}
              {category.replace(/_/g, " ")}
            </span>
            <span>{responseCount} response{responseCount === 1 ? "" : "s"}</span>
            {urgency === "high" && (
              <span className="inline-flex items-center gap-1 font-medium text-destructive">
                <TriangleAlert className="h-3 w-3" />
                Urgent
              </span>
            )}
          </div>
        </div>

        {/* Photo indicator */}
        {photoCount > 0 && (
          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
            <ImageIcon className="h-5 w-5 text-muted-foreground" />
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
          <TrustTierBadge tier={authorTrustTier} />
          <ReputationBadge score={authorReputation} size="sm" />
        </div>
        <span className="text-xs text-muted-foreground">{formatRelativeTime(new Date(createdAt))}</span>
      </div>
    </Link>
  );
}
