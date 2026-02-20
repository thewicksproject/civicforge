import Link from "next/link";
import { BookOpen, Heart, MessageCircle, Plus } from "lucide-react";
import { formatRelativeTime, truncate } from "@/lib/utils";
import type { ActivityItem } from "@/app/actions/activity";

export function ActivityItemCard({ item }: { item: ActivityItem }) {
  switch (item.type) {
    case "post":
      return (
        <div className="flex gap-3 py-3">
          <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Plus className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm">
              <span className="font-medium">{item.authorName}</span>{" "}
              posted {item.postType === "offer" ? "an" : "a"} {item.postType}:{" "}
              <Link href={`/board/${item.postId}`} className="font-medium text-primary hover:underline">
                {item.postTitle}
              </Link>
            </p>
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(new Date(item.createdAt))}
            </span>
          </div>
        </div>
      );

    case "response":
      return (
        <div className="flex gap-3 py-3">
          <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-full bg-offer/10 flex items-center justify-center">
            <MessageCircle className="h-4 w-4 text-offer" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm">
              <span className="font-medium">{item.responderName}</span>{" "}
              offered to help with{" "}
              <Link href={`/board/${item.postId}`} className="font-medium text-primary hover:underline">
                {item.postTitle}
              </Link>
            </p>
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(new Date(item.createdAt))}
            </span>
          </div>
        </div>
      );

    case "story":
      return (
        <div className="flex gap-3 py-3">
          <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <BookOpen className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm">
              <Link href={`/board/${item.postId}`} className="font-medium text-primary hover:underline">
                {item.postTitle}
              </Link>{" "}
              is done!{" "}
              <span className="text-muted-foreground italic">
                &ldquo;{truncate(item.story, 100)}&rdquo;
              </span>
            </p>
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(new Date(item.createdAt))}
            </span>
          </div>
        </div>
      );

    case "thanks":
      return (
        <div className="flex gap-3 py-3">
          <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-full bg-golden-hour/10 flex items-center justify-center">
            <Heart className="h-4 w-4 text-golden-hour" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm">
              <span className="font-medium">{item.fromName}</span>{" "}
              thanked <span className="font-medium">{item.toName}</span>
              {item.message && (
                <span className="text-muted-foreground italic">
                  {" "}&ldquo;{truncate(item.message, 80)}&rdquo;
                </span>
              )}
            </p>
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(new Date(item.createdAt))}
            </span>
          </div>
        </div>
      );

    case "interest_milestone":
      return (
        <div className="flex gap-3 py-3">
          <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Heart className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm">
              <span className="font-medium">{item.count} neighbors</span>{" "}
              are interested in{" "}
              <Link href={`/board/${item.postId}`} className="font-medium text-primary hover:underline">
                {item.postTitle}
              </Link>
            </p>
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(new Date(item.createdAt))}
            </span>
          </div>
        </div>
      );
  }
}
