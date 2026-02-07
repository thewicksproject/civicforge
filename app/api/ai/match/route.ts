import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { findMatches } from "@/lib/ai/client";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { AI_RATE_LIMIT_PER_MINUTE } from "@/lib/types";

const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

const ratelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(AI_RATE_LIMIT_PER_MINUTE, "1 m"),
      prefix: "ai:match",
    })
  : null;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (ratelimit) {
    const { success } = await ratelimit.limit(user.id);
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again in a minute." },
        { status: 429 }
      );
    }
  }

  const body = await request.json();
  const { postId } = body;

  if (!postId) {
    return NextResponse.json({ error: "Post ID required" }, { status: 400 });
  }

  // Fetch the post (only structured fields — NEVER raw user text in matching context)
  const { data: post } = await supabase
    .from("posts")
    .select("id, title, category, skills_relevant, urgency, available_times, neighborhood_id, author_id")
    .eq("id", postId)
    .single();

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  // Fetch candidate profiles from the same neighborhood (excluding post author)
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, skills, reputation_score")
    .eq("neighborhood_id", post.neighborhood_id)
    .neq("id", post.author_id)
    .gte("trust_tier", 2)
    .limit(20);

  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ data: { matches: [] } });
  }

  try {
    // SECURITY: Only structured fields enter the matching context
    const result = await findMatches(
      {
        title: post.title,
        category: post.category,
        skills_relevant: post.skills_relevant ?? [],
        urgency: post.urgency,
        available_times: post.available_times,
      },
      profiles.map((p) => ({
        user_id: p.id,
        display_name: p.display_name,
        skills: p.skills ?? [],
        reputation_score: p.reputation_score ?? 0,
      }))
    );

    // Store matches for transparency (service role required by RLS policy)
    const serviceClient = createServiceClient();
    for (const match of result.matches) {
      await serviceClient.from("ai_matches").insert({
        post_id: postId,
        suggested_user_id: match.user_id,
        match_score: match.score,
        match_reason: match.reason,
      });
    }

    return NextResponse.json({
      data: result,
      meta: { ai_assisted: true },
    });
  } catch {
    return NextResponse.json(
      { error: "Matching failed. Please try again." },
      { status: 500 }
    );
  }
}
