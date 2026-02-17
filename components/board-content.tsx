"use client";

import { useState } from "react";
import { PostCard } from "@/components/post-card";
import { cn } from "@/lib/utils";

type PostType = "need" | "offer";
type Filter = "all" | PostType;

interface BoardPost {
  id: string;
  type: string;
  title: string;
  description: string;
  category: string;
  urgency: string | null;
  created_at: string;
  ai_assisted: boolean;
  view_count?: number;
  author: { display_name: string }[] | { display_name: string } | null;
  post_photos: { id: string; thumbnail_url?: string }[];
  responses: { id: string }[];
  post_interests?: { id: string }[];
}

const FILTERS: { label: string; value: Filter }[] = [
  { label: "All", value: "all" },
  { label: "Needs", value: "need" },
  { label: "Offers", value: "offer" },
];

export function BoardContent({ posts }: { posts: BoardPost[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = filter === "all"
    ? posts
    : posts.filter((p) => p.type === filter);

  return (
    <>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium border transition-colors whitespace-nowrap",
              filter === f.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border hover:bg-muted"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Posts grid */}
      {filtered.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((post) => {
            const author = Array.isArray(post.author)
              ? post.author[0]
              : post.author;
            return (
              <PostCard
                key={post.id}
                id={post.id}
                type={post.type as PostType}
                title={post.title}
                description={post.description}
                category={post.category}
                authorName={author?.display_name ?? "Anonymous"}
                responseCount={post.responses?.length ?? 0}
                photoCount={post.post_photos?.length ?? 0}
                thumbnailUrl={post.post_photos?.[0]?.thumbnail_url}
                createdAt={post.created_at}
                urgency={post.urgency as "low" | "medium" | "high" | null}
                aiAssisted={post.ai_assisted}
                viewCount={post.view_count ?? 0}
                interestCount={post.post_interests?.length ?? 0}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 rounded-xl border border-dashed border-border">
          <p className="text-sm text-muted-foreground">
            No {filter === "need" ? "needs" : "offers"} posted yet. Check back soon or try a different filter.
          </p>
        </div>
      )}
    </>
  );
}
