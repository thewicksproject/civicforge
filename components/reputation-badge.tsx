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
        "inline-flex items-center font-semibold reputation-gradient",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        size === "lg" && "text-base"
      )}
      title={`${score} thanks received`}
    >
      {score}
      {showLabel && (
        <span className="ml-1 text-muted-foreground font-normal">
          {score === 1 ? "thank" : "thanks"}
        </span>
      )}
    </span>
  );
}
