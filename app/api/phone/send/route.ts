import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendVerificationCode } from "@/lib/phone/twilio";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { parseJsonBody } from "@/lib/http/json";

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
      limiter: Ratelimit.slidingWindow(3, "1 h"),
      prefix: "phone:send",
    })
  : null;

// E.164 format: +1234567890
const PHONE_REGEX = /^\+[1-9]\d{6,14}$/;

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
      { error: "Phone verification temporarily unavailable" },
      { status: 503 }
    );
  }

  // Rate limiting: 3 per hour
  if (ratelimit) {
    const { success } = await ratelimit.limit(user.id);
    if (!success) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429 }
      );
    }
  }

  const parsedBody = await parseJsonBody<{ phone?: unknown }>(request);
  if (!parsedBody.ok) {
    return NextResponse.json({ error: parsedBody.error }, { status: 400 });
  }
  const phone = parsedBody.data.phone;

  if (!phone || typeof phone !== "string" || !PHONE_REGEX.test(phone)) {
    return NextResponse.json(
      { error: "Invalid phone number. Use E.164 format (e.g., +15551234567)." },
      { status: 400 }
    );
  }

  try {
    await sendVerificationCode(phone);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to send verification code. Please try again." },
      { status: 500 }
    );
  }
}
