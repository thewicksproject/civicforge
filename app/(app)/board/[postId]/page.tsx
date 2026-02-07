import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { cn, formatRelativeTime } from "@/lib/utils";
import { TRUST_TIER_LABELS, type TrustTier } from "@/lib/types";
import { ReputationBadge } from "@/components/reputation-badge";
import { ResponseList } from "@/components/response-list";
import { ThanksButton } from "@/components/thanks-button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("posts")
    .select("title, type")
    .eq("id", postId)
    .single();

  if (!post) return { title: "Post Not Found" };
  return { title: post.title };
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch post with author, photos, and responses
  const { data: post } = await supabase
    .from("posts")
    .select(
      `
      *,
      author:profiles!author_id (id, display_name, reputation_score, trust_tier, bio, skills),
      post_photos (id, url, thumbnail_url),
      responses (
        id, message, status, created_at,
        responder:profiles!responder_id (id, display_name, reputation_score)
      )
    `
    )
    .eq("id", postId)
    .single();

  if (!post || post.hidden) notFound();

  const author = Array.isArray(post.author) ? post.author[0] : post.author;
  const isAuthor = user?.id === author?.id;
  const isNeed = post.type === "need";

  // Check if current user has already responded
  const hasResponded = post.responses?.some(
    (r: { responder: { id: string } | null }) =>
      r.responder && r.responder.id === user?.id
  );

  // Get user's trust tier for permission checks
  const { data: profile } = await supabase
    .from("profiles")
    .select("trust_tier")
    .eq("id", user!.id)
    .single();

  const canRespond = (profile?.trust_tier ?? 1) >= 2;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back link */}
      <Link
        href="/board"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <svg
          className="h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
        Back to Board
      </Link>

      {/* Post header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
              isNeed
                ? "bg-need-light text-need"
                : "bg-offer-light text-offer"
            )}
          >
            {isNeed ? "Need" : "Offer"}
          </span>
          <span className="text-xs text-muted-foreground capitalize">
            {post.category.replace(/_/g, " ")}
          </span>
          {post.urgency === "high" && (
            <span className="text-xs text-destructive font-medium">
              Urgent
            </span>
          )}
          <span className="text-xs text-muted-foreground ml-auto">
            {formatRelativeTime(new Date(post.created_at))}
          </span>
        </div>

        <h1 className="text-2xl font-semibold mb-3">{post.title}</h1>
        <p className="text-foreground leading-relaxed whitespace-pre-wrap">
          {post.description}
        </p>

        {/* Additional details */}
        {(post.available_times || post.location_hint) && (
          <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
            {post.available_times && (
              <span className="inline-flex items-center gap-1.5 bg-muted rounded-lg px-3 py-1.5">
                🕐 {post.available_times}
              </span>
            )}
            {post.location_hint && (
              <span className="inline-flex items-center gap-1.5 bg-muted rounded-lg px-3 py-1.5">
                📍 {post.location_hint}
              </span>
            )}
          </div>
        )}

        {/* Skills */}
        {post.skills_relevant && post.skills_relevant.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {post.skills_relevant.map((skill: string) => (
              <span
                key={skill}
                className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Photos */}
      {post.post_photos && post.post_photos.length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-2 rounded-xl overflow-hidden">
          {post.post_photos.map(
            (photo: { id: string; url: string; thumbnail_url: string }) => (
              <div key={photo.id} className="aspect-square bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            )
          )}
        </div>
      )}

      {/* Author card */}
      <div className="rounded-xl border border-border bg-card p-4 mb-6">
        <div className="flex items-center justify-between">
          <Link
            href={`/profile/${author?.id}`}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
              {author?.display_name?.charAt(0).toUpperCase() ?? "?"}
            </div>
            <div>
              <span className="font-medium text-sm block">
                {author?.display_name}
              </span>
              <span className="text-xs text-muted-foreground">
                {TRUST_TIER_LABELS[(author?.trust_tier ?? 1) as TrustTier]}
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <ReputationBadge
              score={author?.reputation_score ?? 0}
              size="md"
              showLabel
            />
            {!isAuthor && (
              <ThanksButton toUserId={author?.id ?? ""} postId={post.id} />
            )}
          </div>
        </div>
      </div>

      {/* Responses */}
      <ResponseList
        postId={post.id}
        responses={(post.responses ?? []).map(
          (r: {
            id: string;
            message: string;
            status: string;
            created_at: string;
            responder: {
              id: string;
              display_name: string;
              reputation_score: number;
            };
          }) => ({
            id: r.id,
            message: r.message,
            status: r.status as "pending" | "accepted" | "declined",
            responder: {
              id: r.responder.id,
              display_name: r.responder.display_name,
              reputation_score: r.responder.reputation_score,
            },
            created_at: r.created_at,
          })
        )}
        isAuthor={isAuthor}
        canRespond={canRespond}
        hasResponded={!!hasResponded}
      />
    </div>
  );
}
