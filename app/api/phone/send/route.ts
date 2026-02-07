import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendVerificationCode } from "@/lib/phone/twilio";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
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

  const body = await request.json();
  const phone = body.phone;

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
