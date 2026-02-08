import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requestDeletion } from "@/lib/privacy/deletion";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

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
      limiter: Ratelimit.slidingWindow(1, "1 d"),
      prefix: "privacy:delete",
    })
  : null;

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!ratelimit && process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Account deletion temporarily unavailable" },
      { status: 503 }
    );
  }

  if (ratelimit) {
    const { success } = await ratelimit.limit(user.id);
    if (!success) {
      return NextResponse.json(
        { error: "Too many deletion requests. Please try again later." },
        { status: 429 }
      );
    }
  }

  await requestDeletion(user.id);
  return NextResponse.json({ success: true, message: "Deletion requested. Your data will be removed within 30 days." });
}
