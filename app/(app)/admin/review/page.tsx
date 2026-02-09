import { createClient } from "@/lib/supabase/server";
import { ReviewActions } from "./review-actions";
import { formatRelativeTime } from "@/lib/utils";

export const metadata = { title: "Review Queue" };

export default async function AdminReviewPage() {
  const supabase = await createClient();

  // Fetch posts pending review
  const { data: pendingPosts } = await supabase
    .from("posts")
    .select(
      `
      id, type, title, description, category, review_status, created_at,
      author:profiles!author_id (id, display_name, renown_tier, reputation_score)
    `
    )
    .eq("review_status", "pending_review")
    .order("created_at", { ascending: true });

  // Fetch flagged/hidden posts
  const { data: flaggedPosts } = await supabase
    .from("posts")
    .select(
      `
      id, type, title, description, flag_count, hidden, created_at,
      author:profiles!author_id (id, display_name, renown_tier)
    `
    )
    .gt("flag_count", 0)
    .order("flag_count", { ascending: false })
    .limit(20);

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Admin Review</h1>

      {/* Pending review section */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4">
          Pending Review ({pendingPosts?.length ?? 0})
        </h2>
        {pendingPosts && pendingPosts.length > 0 ? (
          <div className="space-y-4">
            {pendingPosts.map((post) => {
              const author = Array.isArray(post.author)
                ? post.author[0]
                : post.author;
              return (
                <div
                  key={post.id}
                  className="rounded-xl border border-border bg-card p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-muted-foreground capitalize">
                          {post.type}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {post.category.replace(/_/g, " ")}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(new Date(post.created_at))}
                        </span>
                      </div>
                      <h3 className="font-semibold mb-1">{post.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {post.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        By {author?.display_name ?? "Unknown"} (Tier{" "}
                        {author?.renown_tier ?? 1})
                      </p>
                    </div>
                    <ReviewActions postId={post.id} type="review" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No posts pending review.
          </p>
        )}
      </section>

      {/* Flagged posts section */}
      <section>
        <h2 className="text-lg font-semibold mb-4">
          Flagged Posts ({flaggedPosts?.length ?? 0})
        </h2>
        {flaggedPosts && flaggedPosts.length > 0 ? (
          <div className="space-y-4">
            {flaggedPosts.map((post) => {
              const author = Array.isArray(post.author)
                ? post.author[0]
                : post.author;
              return (
                <div
                  key={post.id}
                  className="rounded-xl border border-border bg-card p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-destructive">
                          {post.flag_count} flag
                          {post.flag_count === 1 ? "" : "s"}
                        </span>
                        {post.hidden && (
                          <span className="text-xs font-medium text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">
                            Hidden
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold mb-1">{post.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {post.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        By {author?.display_name ?? "Unknown"}
                      </p>
                    </div>
                    <ReviewActions
                      postId={post.id}
                      type="flag"
                      isHidden={post.hidden}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No flagged posts.
          </p>
        )}
      </section>
    </div>
  );
}
