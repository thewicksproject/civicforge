import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function AiBadge() {
  return (
    <Badge variant="secondary" className="gap-1 text-xs font-normal">
      <Sparkles className="h-3 w-3" />
      AI-assisted
    </Badge>
  );
}
