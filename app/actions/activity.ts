"use server";

import { createServiceClient } from "@/lib/supabase/server";

export type ActivityItem =
  | { type: "post"; id: string; authorName: string; postTitle: string; postType: "need" | "offer"; postId: string; createdAt: string }
  | { type: "response"; id: string; responderName: string; postTitle: string; postId: string; createdAt: string }
  | { type: "story"; id: string; authorName: string; story: string; postTitle: string; postId: string; createdAt: string }
  | { type: "thanks"; id: string; fromName: string; toName: string; message: string | null; createdAt: string }
  | { type: "interest_milestone"; id: string; postTitle: string; postId: string; count: number; createdAt: string };

export async function getCommunityActivity(
  communityId: string,
  limit = 20
): Promise<ActivityItem[]> {
  const admin = createServiceClient();
  const items: ActivityItem[] = [];

  // Fetch recent posts
  const { data: posts } = await admin
    .from("posts")
    .select("id, title, type, created_at, author:profiles!author_id(display_name)")
    .eq("community_id", communityId)
    .eq("hidden", false)
    .order("created_at", { ascending: false })
    .limit(limit);

  for (const p of posts ?? []) {
    const author = Array.isArray(p.author) ? p.author[0] : p.author;
    items.push({
      type: "post",
      id: `post-${p.id}`,
      authorName: author?.display_name ?? "Someone",
      postTitle: p.title,
      postType: p.type as "need" | "offer",
      postId: p.id,
      createdAt: p.created_at,
    });
  }

  // Fetch recent responses (scoped to community via join filter)
  const { data: responses } = await admin
    .from("responses")
    .select(`
      id, created_at,
      responder:profiles!responder_id(display_name),
      post:posts!post_id!inner(id, title, community_id)
    `)
    .eq("post.community_id", communityId)
    .order("created_at", { ascending: false })
    .limit(limit);

  for (const r of responses ?? []) {
    const post = Array.isArray(r.post) ? r.post[0] : r.post;
    const responder = Array.isArray(r.responder) ? r.responder[0] : r.responder;
    items.push({
      type: "response",
      id: `response-${r.id}`,
      responderName: responder?.display_name ?? "Someone",
      postTitle: post?.title ?? "",
      postId: post?.id ?? "",
      createdAt: r.created_at,
    });
  }

  // Fetch recent completion stories (scoped to community via join filter)
  const { data: stories } = await admin
    .from("completion_stories")
    .select(`
      id, story, created_at,
      author:profiles!author_id(display_name),
      post:posts!post_id!inner(id, title, community_id)
    `)
    .eq("post.community_id", communityId)
    .order("created_at", { ascending: false })
    .limit(limit);

  for (const s of stories ?? []) {
    const post = Array.isArray(s.post) ? s.post[0] : s.post;
    const author = Array.isArray(s.author) ? s.author[0] : s.author;
    items.push({
      type: "story",
      id: `story-${s.id}`,
      authorName: author?.display_name ?? "Someone",
      story: s.story,
      postTitle: post?.title ?? "",
      postId: post?.id ?? "",
      createdAt: s.created_at,
    });
  }

  // Fetch recent thanks (scoped to community via receiver's profile)
  const { data: thanksData } = await admin
    .from("thanks")
    .select(`
      id, message, created_at,
      sender:profiles!from_user(display_name),
      receiver:profiles!to_user!inner(display_name, community_id)
    `)
    .eq("receiver.community_id", communityId)
    .order("created_at", { ascending: false })
    .limit(limit);

  for (const t of thanksData ?? []) {
    const receiver = Array.isArray(t.receiver) ? t.receiver[0] : t.receiver;
    const sender = Array.isArray(t.sender) ? t.sender[0] : t.sender;
    items.push({
      type: "thanks",
      id: `thanks-${t.id}`,
      fromName: sender?.display_name ?? "Someone",
      toName: receiver?.display_name ?? "someone",
      message: t.message,
      createdAt: t.created_at,
    });
  }

  // Sort by date, most recent first
  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return items.slice(0, limit);
}
