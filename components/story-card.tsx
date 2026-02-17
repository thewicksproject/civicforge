import Link from "next/link";
import { BookOpen } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

interface StoryCardProps {
  story: string;
  authorName: string;
  createdAt: string;
  postTitle?: string;
  postId?: string;
}

export function StoryCard({ story, authorName, createdAt, postTitle, postId }: StoryCardProps) {
  const content = (
    <div className={`rounded-xl border border-primary/20 bg-primary/5 p-4${postId ? " hover:bg-primary/10 transition-colors" : ""}`}>
      <div className="flex items-center gap-2 mb-2">
        <BookOpen className="h-4 w-4 text-primary flex-shrink-0" />
        <span className="text-xs font-medium text-primary">Completion Story</span>
        {postTitle && (
          <span className="text-xs text-muted-foreground truncate">
            — {postTitle}
          </span>
        )}
      </div>
      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
        {story}
      </p>
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-primary/10 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{authorName}</span>
        <span>{formatRelativeTime(new Date(createdAt))}</span>
      </div>
    </div>
  );

  if (postId) {
    return <Link href={`/board/${postId}`}>{content}</Link>;
  }

  return content;
}
