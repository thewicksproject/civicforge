import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Users,
  Clock,
  Sword,
  Shield,
  Zap,
} from "lucide-react";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { formatRelativeTime } from "@/lib/utils";
import { SkillDomainBadge } from "@/components/skill-domain-badge";
import { RenownTierBadge } from "@/components/trust-tier-badge";
import { QuestThread } from "@/components/quest-thread";
import { getQuestComments } from "@/app/actions/quest-comments";
import type { SkillDomain, RenownTier } from "@/lib/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ questId: string }>;
}) {
  const { questId } = await params;
  const admin = createServiceClient();
  const { data: quest } = await admin
    .from("quests")
    .select("title")
    .eq("id", questId)
    .single();

  if (!quest) return { title: "Quest Not Found" };
  return { title: quest.title };
}

export default async function QuestDetailPage({
  params,
}: {
  params: Promise<{ questId: string }>;
}) {
  const { questId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const admin = createServiceClient();

  // Community scoping
  const { data: userProfile } = await admin
    .from("profiles")
    .select("community_id")
    .eq("id", user.id)
    .single();

  const { data: quest } = await admin
    .from("quests")
    .select(`
      *,
      creator:profiles!quests_created_by_fkey(id, display_name, renown_tier, avatar_url),
      guild:guilds!quests_guild_id_fkey(id, name, domain)
    `)
    .eq("id", questId)
    .single();

  if (!quest) notFound();
  if (userProfile?.community_id !== quest.community_id) notFound();

  const creator = Array.isArray(quest.creator) ? quest.creator[0] : quest.creator;
  const guild = Array.isArray(quest.guild) ? quest.guild[0] : quest.guild;

  // Get party members
  const { data: parties } = await admin
    .from("parties")
    .select(`
      id,
      party_members(
        user_id,
        joined_at,
        member:profiles!party_members_user_id_fkey(display_name, renown_tier)
      )
    `)
    .eq("quest_id", questId);

  const partyMembers = (parties ?? []).flatMap((p) =>
    (p.party_members ?? []).map((pm: {
      user_id: string;
      joined_at: string;
      member: { display_name: string; renown_tier: number } | { display_name: string; renown_tier: number }[] | null;
    }) => ({
      userId: pm.user_id,
      joinedAt: pm.joined_at,
      member: Array.isArray(pm.member) ? pm.member[0] : pm.member,
    })),
  );

  // Check if current user is a participant
  const isCreator = quest.created_by === user.id;
  const isPartyMember = partyMembers.some((m) => m.userId === user.id);
  const isParticipant = isCreator || isPartyMember;

  // Fetch comments if participant
  let comments: Array<{
    id: string;
    body: string;
    created_at: string;
    author: { display_name: string; avatar_url: string | null } | null;
    authorId?: string;
  }> = [];

  if (isParticipant) {
    const commentsResult = await getQuestComments(questId);
    if (commentsResult.success) {
      comments = (commentsResult.comments ?? []).map((c) => ({
        ...c,
        author: Array.isArray(c.author) ? c.author[0] ?? null : c.author,
        authorId: (c as { author_id?: string }).author_id,
      }));
    }
  }

  // Get validation info if pending
  let validationCount = 0;
  if (quest.status === "pending_validation") {
    const { count } = await admin
      .from("quest_validations")
      .select("id", { count: "exact", head: true })
      .eq("quest_id", questId)
      .eq("approved", true);
    validationCount = count ?? 0;
  }

  const statusColors: Record<string, string> = {
    open: "text-meadow bg-meadow/10",
    claimed: "text-horizon bg-horizon/10",
    in_progress: "text-horizon bg-horizon/10",
    pending_validation: "text-golden-hour bg-golden-hour/10",
    completed: "text-meadow bg-meadow/10",
    expired: "text-muted-foreground bg-muted",
    cancelled: "text-muted-foreground bg-muted",
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/board"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </Link>

      {/* Quest header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          {quest.skill_domains.map((d: string) => (
            <SkillDomainBadge key={d} domain={d as SkillDomain} size="md" />
          ))}
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
              statusColors[quest.status] ?? "text-muted-foreground bg-muted"
            }`}
          >
            {quest.status.replace("_", " ")}
          </span>
        </div>

        <h1 className="text-2xl font-semibold mb-2">{quest.title}</h1>
        <p className="text-foreground leading-relaxed whitespace-pre-wrap">
          {quest.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 bg-muted rounded-lg px-3 py-1.5">
            <Sword className="h-3.5 w-3.5" />
            <span className="capitalize">{quest.difficulty}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 bg-muted rounded-lg px-3 py-1.5">
            <Zap className="h-3.5 w-3.5" />
            {quest.xp_reward} XP
          </span>
          {quest.max_party_size > 1 && (
            <span className="inline-flex items-center gap-1.5 bg-muted rounded-lg px-3 py-1.5">
              <Users className="h-3.5 w-3.5" />
              Party (max {quest.max_party_size})
            </span>
          )}
          {quest.is_emergency && (
            <span className="inline-flex items-center gap-1.5 bg-rose-clay/10 text-rose-clay rounded-lg px-3 py-1.5">
              <Shield className="h-3.5 w-3.5" />
              Urgent
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 bg-muted rounded-lg px-3 py-1.5">
            <Clock className="h-3.5 w-3.5" />
            {formatRelativeTime(new Date(quest.created_at))}
          </span>
        </div>

        {/* Guild badge */}
        {guild && (
          <div className="mt-3">
            <Link
              href={`/guilds/${guild.id}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-muted/50 transition-colors"
            >
              <SkillDomainBadge domain={guild.domain as SkillDomain} size="sm" />
              {guild.name}
            </Link>
          </div>
        )}
      </div>

      {/* Validation status */}
      {quest.status === "pending_validation" && (
        <div className="rounded-xl border border-border bg-card p-4 mb-6">
          <h2 className="text-sm font-semibold mb-1">Validation Progress</h2>
          <p className="text-sm text-muted-foreground">
            {validationCount} of {quest.validation_threshold} validations received
          </p>
        </div>
      )}

      {/* Creator */}
      <div className="rounded-xl border border-border bg-card p-4 mb-6">
        <h2 className="text-sm font-semibold mb-2">Created by</h2>
        <div className="flex items-center gap-3">
          <Link
            href={`/profile/${creator?.id}`}
            className="text-sm font-medium hover:underline"
          >
            {creator?.display_name ?? "Unknown"}
          </Link>
          <RenownTierBadge tier={(creator?.renown_tier ?? 1) as RenownTier} />
        </div>
      </div>

      {/* Party Members */}
      {partyMembers.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Party Members</h2>
          <div className="space-y-2">
            {partyMembers.map((m) => (
              <div
                key={m.userId}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
              >
                <div className="flex items-center gap-3">
                  <Link
                    href={`/profile/${m.userId}`}
                    className="font-medium text-sm hover:underline"
                  >
                    {m.member?.display_name ?? "Unknown"}
                  </Link>
                  <RenownTierBadge tier={(m.member?.renown_tier ?? 1) as RenownTier} />
                </div>
                <span className="text-xs text-muted-foreground">
                  Joined {formatRelativeTime(new Date(m.joinedAt))}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Quest Thread — participants only */}
      {isParticipant && (
        <section className="mb-6">
          <QuestThread
            questId={questId}
            initialComments={comments}
            currentUserId={user.id}
          />
        </section>
      )}
    </div>
  );
}
