import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { matchQuests } from "@/lib/ai/client";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { AI_RATE_LIMIT_PER_MINUTE } from "@/lib/types";
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
      limiter: Ratelimit.slidingWindow(AI_RATE_LIMIT_PER_MINUTE, "1 m"),
      prefix: "ai:quest-match",
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

  const parsedBody = await parseJsonBody<{ availability?: unknown }>(request);
  if (!parsedBody.ok) {
    return NextResponse.json({ error: parsedBody.error }, { status: 400 });
  }
  const availability =
    typeof parsedBody.data.availability === "string"
      ? parsedBody.data.availability
      : null;

  const admin = createServiceClient();

  // Fetch user's profile and skill progress
  const { data: profile } = await admin
    .from("profiles")
    .select("id, display_name, skills, community_id")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.community_id) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  // Fetch user's skill domain levels
  const { data: skillData } = await admin
    .from("skill_progress")
    .select("domain, level")
    .eq("user_id", user.id);

  // Fetch open quests in the user's community
  const { data: quests } = await admin
    .from("quests")
    .select("id, title, description, difficulty, skill_domains, created_by, status")
    .eq("community_id", profile.community_id)
    .eq("status", "open")
    .neq("created_by", user.id)
    .limit(20);

  if (!quests || quests.length === 0) {
    return NextResponse.json({ data: { matches: [] } });
  }

  // Fetch display names for quest creators
  const creatorIds = [...new Set(quests.map((q) => q.created_by))];
  const { data: creators } = await admin
    .from("profiles")
    .select("id, display_name")
    .in("id", creatorIds);

  const creatorMap = new Map(
    (creators ?? []).map((c) => [c.id, c.display_name])
  );

  try {
    const result = await matchQuests(
      {
        user_id: user.id,
        skills: profile.skills ?? [],
        skill_domains: (skillData ?? []).map((s) => ({
          domain: s.domain,
          level: s.level,
        })),
        availability,
      },
      quests.map((q) => ({
        quest_id: q.id,
        title: q.title,
        description: q.description,
        difficulty: q.difficulty,
        skill_domains: q.skill_domains ?? [],
        posted_by: creatorMap.get(q.created_by) ?? "A neighbor",
        urgency: null,
      }))
    );

    return NextResponse.json({
      data: result,
      meta: { ai_assisted: true },
    });
  } catch {
    return NextResponse.json(
      { error: "Quest matching failed. Please try again." },
      { status: 500 }
    );
  }
}
