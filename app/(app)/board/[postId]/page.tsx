import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Clock, Eye, MapPin, TriangleAlert } from "lucide-react";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { cn, formatRelativeTime } from "@/lib/utils";
import { CATEGORY_ICON_MAP } from "@/components/category-icons";
import { ResponseList } from "@/components/response-list";
import { ThanksButton } from "@/components/thanks-button";
import { FlagButton } from "@/components/flag-button";
import { AiBadge } from "@/components/ai-badge";
import { InterestButton } from "@/components/interest-button";
import { CompletionStoryForm } from "@/components/completion-story-form";
import { StoryCard } from "@/components/story-card";
import { incrementViewCount } from "@/app/actions/posts";
import { getInterestData } from "@/app/actions/interests";
import { getStoryForPost } from "@/app/actions/stories";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  const admin = createServiceClient();
  const { data: post } = await admin
    .from("posts")
    .select("title")
    .eq("id", postId)
    .single();
  return { title: post?.title ?? "Post" };
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

  if (!user) redirect("/login");

  // Use service client to bypass self-referencing RLS policy on profiles
  const admin = createServiceClient();

  const { data: viewerProfile } = await admin
    .from("profiles")
    .select("community_id, renown_tier")
    .eq("id", user.id)
    .single();

  if (!viewerProfile?.community_id) notFound();

  // Fetch post with author, photos, and responses
  const { data: post } = await admin
    .from("posts")
    .select(
      `
      *,
      author:profiles!author_id (id, display_name, bio, skills),
      post_photos (id, url, thumbnail_url),
      responses (
        id, message, status, created_at,
        responder:profiles!responder_id (id, display_name)
      )
    `
    )
    .eq("id", postId)
    .single();

  if (!post || post.hidden) notFound();
  if (post.community_id !== viewerProfile.community_id) notFound();

  const author = Array.isArray(post.author) ? post.author[0] : post.author;
  const isAuthor = user?.id === author?.id;
  const isNeed = post.type === "need";
  const resolvedPhotos = await Promise.all(
    (post.post_photos ?? []).map(
      async (photo: { id: string; url: string; thumbnail_url: string }) => {
        if (photo.url.startsWith("http")) {
          return photo;
        }

        const [imageSigned, thumbSigned] = await Promise.all([
          supabase.storage.from("post-photos").createSignedUrl(photo.url, 3600),
          supabase.storage
            .from("post-photos")
            .createSignedUrl(photo.thumbnail_url, 3600),
        ]);

        return {
          ...photo,
          url: imageSigned.data?.signedUrl ?? "",
          thumbnail_url: thumbSigned.data?.signedUrl ?? "",
        };
      }
    )
  );

  // Check if current user has already responded
  const hasResponded = post.responses?.some(
    (r: { responder: { id: string } | null }) =>
      r.responder && r.responder.id === user?.id
  );

  const canRespond = (viewerProfile.renown_tier ?? 1) >= 2;

  // Momentum signals — don't count author's own views
  if (!isAuthor) await incrementViewCount(postId);
  const interestData = await getInterestData(postId);

  // Completion story
  const completionStory = await getStoryForPost(postId);
  const hasAcceptedResponse = post.responses?.some(
    (r: { status: string }) => r.status === "accepted"
  );
  const showStoryForm = isAuthor && hasAcceptedResponse && !completionStory;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back link */}
      <Link
        href="/board"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ChevronLeft className="h-4 w-4" />
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
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground capitalize">
            {(() => { const Icon = CATEGORY_ICON_MAP[post.category]; return Icon ? <Icon className="h-3 w-3" /> : null; })()}
            {post.category.replace(/_/g, " ")}
          </span>
          {post.urgency === "high" && (
            <span className="inline-flex items-center gap-1 text-xs text-destructive font-medium">
              <TriangleAlert className="h-3 w-3" />
              Urgent
            </span>
          )}
          {post.ai_assisted && <AiBadge />}
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
                <Clock className="h-3.5 w-3.5" /> {post.available_times}
              </span>
            )}
            {post.location_hint && (
              <span className="inline-flex items-center gap-1.5 bg-muted rounded-lg px-3 py-1.5">
                <MapPin className="h-3.5 w-3.5" /> {post.location_hint}
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

      {/* Momentum signals */}
      <div className="mb-6 flex items-center gap-4">
        <InterestButton
          postId={postId}
          initialCount={interestData.count}
          initialInterested={interestData.isInterested}
        />
        {(post.view_count ?? 0) > 0 && (
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <Eye className="h-4 w-4" />
            {post.view_count} {post.view_count === 1 ? "neighbor has" : "neighbors have"} seen this
          </span>
        )}
      </div>

      {/* Photos */}
      {resolvedPhotos.length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-2 rounded-xl overflow-hidden">
          {resolvedPhotos
            .filter((photo) => photo.url.length > 0)
            .map((photo: { id: string; url: string; thumbnail_url: string }) => (
              <div key={photo.id} className="aspect-square bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
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
            <span className="font-medium text-sm">
              {author?.display_name}
            </span>
          </Link>
          <div className="flex items-center gap-3">
            {!isAuthor && (
              <>
                <ThanksButton toUserId={author?.id ?? ""} postId={post.id} />
                <FlagButton postId={post.id} />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Completion story */}
      {completionStory && (
        <div className="mb-6">
          <StoryCard
            story={completionStory.story}
            authorName={
              (() => {
                const a = completionStory.author as { display_name: string } | { display_name: string }[] | null;
                if (Array.isArray(a)) return a[0]?.display_name ?? "Someone";
                return a?.display_name ?? "Someone";
              })()
            }
            createdAt={completionStory.created_at}
          />
        </div>
      )}

      {/* Story form (shown to author when a response is accepted but no story yet) */}
      {showStoryForm && (
        <div className="mb-6">
          <CompletionStoryForm postId={postId} />
        </div>
      )}

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
            };
          }) => ({
            id: r.id,
            message: r.message,
            status: r.status as "pending" | "accepted" | "declined",
            responder: {
              id: r.responder.id,
              display_name: r.responder.display_name,
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
