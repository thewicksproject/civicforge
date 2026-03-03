"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { createServiceClient } from "@/lib/supabase/server";
import { sendPushover } from "@/lib/notify/pushover";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const ratelimit =
  redisUrl && redisToken
    ? new Ratelimit({
        redis: new Redis({ url: redisUrl, token: redisToken }),
        limiter: Ratelimit.slidingWindow(5, "15 m"),
        prefix: "waitlist",
      })
    : null;

const EmailSchema = z.string().email("Please enter a valid email address").max(320);

export async function submitAlphaInterest(email: string) {
  const parsed = EmailSchema.safeParse(email);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0].message };
  }

  // Rate limit by IP: 5 requests per 15 minutes
  if (ratelimit) {
    const h = await headers();
    const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const { success } = await ratelimit.limit(ip);
    if (!success) {
      return { success: false as const, error: "Too many requests. Please try again later." };
    }
  }

  const supabase = createServiceClient();

  const { error } = await supabase
    .from("alpha_interest")
    .upsert({ email: parsed.data }, { onConflict: "email" });

  if (error) {
    return { success: false as const, error: "Something went wrong. Please try again." };
  }

  await sendPushover({
    title: "CivicForge Alpha Interest",
    message: `New interest signup: ${parsed.data}`,
    priority: -1,
  });

  return { success: true as const };
}
