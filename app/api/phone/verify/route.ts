import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkVerificationCode } from "@/lib/phone/twilio";
import { recordConsent } from "@/lib/privacy/consent";
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
      limiter: Ratelimit.slidingWindow(5, "15 m"),
      prefix: "phone:verify",
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
      { error: "Phone verification temporarily unavailable" },
      { status: 503 }
    );
  }

  if (ratelimit) {
    const { success } = await ratelimit.limit(user.id);
    if (!success) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429 }
      );
    }
  }

  const parsedBody = await parseJsonBody<{
    phone?: unknown;
    code?: unknown;
  }>(request);
  if (!parsedBody.ok) {
    return NextResponse.json({ error: parsedBody.error }, { status: 400 });
  }
  const { phone, code } = parsedBody.data;

  if (!phone || typeof phone !== "string") {
    return NextResponse.json(
      { error: "Phone number is required" },
      { status: 400 }
    );
  }

  if (!code || typeof code !== "string" || code.length !== 6) {
    return NextResponse.json(
      { error: "A 6-digit verification code is required" },
      { status: 400 }
    );
  }

  try {
    const result = await checkVerificationCode(phone, code);

    if (!result.valid) {
      return NextResponse.json(
        { error: "Invalid or expired code. Please try again." },
        { status: 400 }
      );
    }

    // Set phone_verified = true on profile
    await supabase
      .from("profiles")
      .update({ phone_verified: true })
      .eq("id", user.id);

    // Record consent for phone verification
    await recordConsent(user.id, "phone_verification", "1.0.0");

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Verification failed. Please try again." },
      { status: 500 }
    );
  }
}
