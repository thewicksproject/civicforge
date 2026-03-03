import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { decomposeIssue } from "@/lib/ai/client";
import { checkDailyBudget } from "@/lib/ai/budget";
import { parseJsonBody } from "@/lib/http/json";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { AI_RATE_LIMIT_PER_MINUTE } from "@/lib/types";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const hasRedisConfig = !!redisUrl && !!redisToken;

const redis = hasRedisConfig
  ? new Redis({
      url: redisUrl,
      token: redisToken,
    })
  : null;

const ratelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(AI_RATE_LIMIT_PER_MINUTE, "1 m"),
      prefix: "ai:issue-decompose",
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

  if (!ratelimit && process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "AI temporarily unavailable due to rate-limit configuration" },
      { status: 503 }
    );
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

  const parsedBody = await parseJsonBody<{ text?: unknown; guidance?: unknown }>(request);
  if (!parsedBody.ok) {
    return NextResponse.json({ error: parsedBody.error }, { status: 400 });
  }
  const { text, guidance } = parsedBody.data;

  if (!text || typeof text !== "string" || text.length > 5000) {
    return NextResponse.json(
      { error: "Invalid input text (max 5000 characters)" },
      { status: 400 }
    );
  }

  if (guidance !== undefined && (typeof guidance !== "string" || guidance.length > 500)) {
    return NextResponse.json(
      { error: "Invalid guidance text (max 500 characters)" },
      { status: 400 }
    );
  }

  // Enforce daily token budget before making the LLM call
  const { allowed, used } = await checkDailyBudget(supabase, user.id);
  if (!allowed) {
    return NextResponse.json(
      {
        error: "Daily AI budget reached. Try again tomorrow.",
        meta: { tokens_used: used },
      },
      { status: 429 }
    );
  }

  try {
    const decomposition = await decomposeIssue(
      text,
      typeof guidance === "string" ? guidance : undefined
    );

    // Log AI usage (decomposition uses more tokens than single extraction)
    const today = new Date().toISOString().split("T")[0];
    await supabase.rpc("increment_ai_usage", {
      p_user_id: user.id,
      p_date: today,
      p_tokens: 1500,
      p_requests: 1,
    });

    return NextResponse.json({
      data: decomposition,
      meta: { ai_assisted: true },
    });
  } catch (err) {
    console.error(
      "Issue decompose failed:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      { error: "Failed to decompose issue. Please try again or use the manual form." },
      { status: 500 }
    );
  }
}
