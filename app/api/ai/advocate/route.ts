import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { advocateChat } from "@/lib/ai/client";
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
      prefix: "ai:advocate",
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

  const body = await request.json();

  // W12: Accept both single message (backward compat) and messages array (history)
  const message = body.message;
  const messages: Array<{ role: string; content: string }> = body.messages ?? [];

  // Validate: need either a message string or a non-empty messages array
  if (messages.length > 0) {
    // Validate messages array
    const valid = messages.every(
      (m: unknown) =>
        typeof m === "object" &&
        m !== null &&
        typeof (m as Record<string, unknown>).role === "string" &&
        typeof (m as Record<string, unknown>).content === "string" &&
        ((m as Record<string, unknown>).content as string).length <= 1000
    );
    if (!valid || messages.length > 50) {
      return NextResponse.json(
        { error: "Invalid messages" },
        { status: 400 }
      );
    }
  } else if (!message || typeof message !== "string" || message.length > 1000) {
    return NextResponse.json(
      { error: "Invalid message" },
      { status: 400 }
    );
  }

  // Build the current user message (last message in history, or single message)
  const currentMessage =
    messages.length > 0
      ? messages[messages.length - 1].content
      : message;

  // Build conversation history for context (excluding the current message)
  const history = messages.length > 1
    ? messages.slice(0, -1).map((m) => ({
        role: m.role === "advocate" ? ("assistant" as const) : ("user" as const),
        content: m.content,
      }))
    : undefined;

  const admin = createServiceClient();

  // Fetch user context for the advocate
  const { data: profile } = await admin
    .from("profiles")
    .select("display_name, renown_tier, community_id")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  // Fetch skill domains
  const { data: skillData } = await admin
    .from("skill_progress")
    .select("domain, level")
    .eq("user_id", user.id);

  // Fetch guild memberships
  const { data: guildData } = await admin
    .from("guild_members")
    .select("guild_id, guilds(name)")
    .eq("user_id", user.id);

  // Fetch recent community activity (last 5 completed quests)
  const { data: recentQuests } = await admin
    .from("quests")
    .select("title, difficulty, completed_at, created_by, profiles!quests_created_by_fkey(display_name)")
    .eq("community_id", profile.community_id)
    .eq("status", "completed")
    .order("completed_at", { ascending: false })
    .limit(5);

  // Fetch active quests the user is involved in
  const { data: activeQuests } = await admin
    .from("quests")
    .select("title, difficulty, status")
    .eq("community_id", profile.community_id)
    .eq("status", "open")
    .limit(10);

  const recentActivitySummary = (recentQuests ?? [])
    .map((q) => `"${q.title}" (${q.difficulty}) completed`)
    .join("; ") || "No recent completions";

  const activeQuestsSummary = (activeQuests ?? [])
    .map((q) => `"${q.title}" (${q.difficulty}, ${q.status})`)
    .join("; ") || "No active quests";

  try {
    // W12: Build conversation context string from history
    const historyContext = history && history.length > 0
      ? "\n\nCONVERSATION HISTORY:\n" +
        history
          .map((m) => `${m.role === "assistant" ? "Advocate" : "User"}: ${m.content}`)
          .join("\n")
      : "";

    const response = await advocateChat(
      historyContext ? `${historyContext}\n\nUser: ${currentMessage}` : currentMessage,
      {
        profile: {
          display_name: profile.display_name,
          renown_tier: profile.renown_tier,
          skill_domains: (skillData ?? []).map((s) => ({
            domain: s.domain,
            level: s.level,
          })),
          guild_memberships: (guildData ?? []).map(
            (g) => {
              const guilds = g.guilds as unknown as { name: string } | null;
              return guilds?.name ?? "Unknown guild";
            }
          ),
        },
        recentActivity: recentActivitySummary,
        activeQuests: activeQuestsSummary,
      }
    );

    // Log AI usage
    const today = new Date().toISOString().split("T")[0];
    await supabase.rpc("increment_ai_usage", {
      p_user_id: user.id,
      p_date: today,
      p_tokens: 1000,
      p_requests: 1,
    });

    return NextResponse.json({
      data: { message: response },
      meta: { ai_assisted: true },
    });
  } catch {
    return NextResponse.json(
      { error: "Advocate unavailable. Please try again." },
      { status: 500 }
    );
  }
}
