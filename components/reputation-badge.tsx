import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReputationBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function ReputationBadge({
  score,
  size = "md",
  showLabel = false,
}: ReputationBadgeProps) {
  if (score === 0) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-golden-hour/30 bg-golden-hour/[0.08] font-semibold reputation-gradient",
        size === "sm" && "text-xs px-1.5 py-0.5",
        size === "md" && "text-sm px-2 py-0.5",
        size === "lg" && "text-base px-2.5 py-0.5"
      )}
      title={`${score} thanks received`}
    >
      {size !== "sm" && <Heart className="h-3 w-3 text-golden-hour" />}
      {score}
      {showLabel && (
        <span className="ml-0.5 text-muted-foreground font-normal">
          {score === 1 ? "thank" : "thanks"}
        </span>
      )}
    </span>
  );
}
