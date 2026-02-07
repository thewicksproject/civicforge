import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractPost } from "@/lib/ai/client";
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
      prefix: "ai:extract",
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

  // Rate limiting
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
  const text = body.text;

  if (!text || typeof text !== "string" || text.length > 2000) {
    return NextResponse.json(
      { error: "Invalid input text" },
      { status: 400 }
    );
  }

  try {
    const extracted = await extractPost(text);

    // Log AI usage
    const today = new Date().toISOString().split("T")[0];
    await supabase.rpc("increment_ai_usage", {
      p_user_id: user.id,
      p_date: today,
      p_tokens: 500, // approximate
      p_requests: 1,
    });

    return NextResponse.json({
      data: extracted,
      meta: { ai_assisted: true },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to process text. Please try the manual form." },
      { status: 500 }
    );
  }
}
