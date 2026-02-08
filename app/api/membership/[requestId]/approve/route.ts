import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { reviewMembership } from "@/app/actions/membership";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const hasRedisConfig = !!redisUrl && !!redisToken;

const redis = hasRedisConfig
  ? new Redis({ url: redisUrl, token: redisToken })
  : null;

const ratelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, "5 m"),
      prefix: "membership:review",
    })
  : null;

function resolveReturnUrl(request: Request): URL {
  const fallback = new URL("/board", request.url);
  const referer = request.headers.get("referer");
  if (!referer) return fallback;

  try {
    const parsed = new URL(referer);
    if (parsed.origin !== fallback.origin) return fallback;
    return new URL(`${parsed.pathname}${parsed.search}`, fallback.origin);
  } catch {
    return fallback;
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!ratelimit && process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Membership review temporarily unavailable" },
      { status: 503 }
    );
  }

  if (ratelimit) {
    const { success } = await ratelimit.limit(user.id);
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }
  }

  const { requestId } = await params;
  const returnUrl = resolveReturnUrl(request);

  const result = await reviewMembership(requestId, "approved");
  if (!result.success) {
    returnUrl.searchParams.set("membership_error", result.error ?? "approve_failed");
  } else {
    returnUrl.searchParams.set("membership_status", "approved");
  }

  return NextResponse.redirect(returnUrl, { status: 303 });
}
