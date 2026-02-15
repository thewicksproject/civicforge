import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Zap, Users, Clock, CheckCircle, Calendar } from "lucide-react";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { formatRelativeTime } from "@/lib/utils";
import { QUEST_DIFFICULTY_TIERS, type QuestDifficulty, type RenownTier, type SkillDomain } from "@/lib/types";
import { RenownTierBadge } from "@/components/trust-tier-badge";
import { SkillDomainBadge, DifficultyBadge } from "@/components/skill-domain-badge";
import { QuestActions } from "@/components/quest-actions";

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

  // C2: Community scoping — verify user belongs to quest's community
  const { data: userProfile } = await admin
    .from("profiles")
    .select("community_id")
    .eq("id", user.id)
    .single();

  const { data: quest } = await admin
    .from("quests")
    .select(`
      *,
      author:profiles!quests_created_by_fkey(id, display_name, renown_tier, avatar_url),
      quest_validations(id, approved, message, validator_id, created_at,
        validator:profiles!quest_validations_validator_id_fkey(display_name))
    `)
    .eq("id", questId)
    .single();

  if (!quest) notFound();

  if (userProfile?.community_id !== quest.community_id) notFound();

  const author = Array.isArray(quest.author) ? quest.author[0] : quest.author;
  const isAuthor = user.id === author?.id;
  const diffConfig = QUEST_DIFFICULTY_TIERS[quest.difficulty as QuestDifficulty];

  // Check if user has already validated
  const validations = (quest.quest_validations ?? []) as Array<{
    id: string;
    approved: boolean;
    message: string | null;
    validator_id: string;
    created_at: string;
    validator: { display_name: string } | null;
  }>;
  const hasValidated = validations.some((v) => v.validator_id === user.id);

  // Fetch party + all members for this quest
  const { data: partyData } = await admin
    .from("parties")
    .select("id, party_members(user_id, profiles!inner(display_name, avatar_url))")
    .eq("quest_id", questId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  type PartyMemberRow = {
    user_id: string;
    profiles: { display_name: string; avatar_url: string | null };
  };
  const partyMembers: PartyMemberRow[] = (partyData?.party_members as PartyMemberRow[] | undefined) ?? [];
  const isPartyMember = partyMembers.some((m) => m.user_id === user.id);
  const currentPartySize = partyMembers.length;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back link */}
      <Link
        href="/board?tab=quests"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Quests
      </Link>

      {/* Quest header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <DifficultyBadge difficulty={quest.difficulty} />
          <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground capitalize">
            {quest.status.replace(/_/g, " ")}
          </span>
          {quest.is_emergency && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive">
              Urgent
            </span>
          )}
          <span className="text-xs text-muted-foreground ml-auto">
            {formatRelativeTime(new Date(quest.created_at))}
          </span>
        </div>

        <h1 className="text-2xl font-semibold mb-3">{quest.title}</h1>
        <p className="text-foreground leading-relaxed whitespace-pre-wrap">
          {quest.description}
        </p>

        {/* Skill domains */}
        <div className="mt-4 flex flex-wrap gap-2">
          {(quest.skill_domains as string[]).map((domain) => (
            <SkillDomainBadge
              key={domain}
              domain={domain as SkillDomain}
              size="md"
            />
          ))}
        </div>

        {/* Quest meta */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 bg-muted rounded-lg px-3 py-1.5">
            <Zap className="h-3.5 w-3.5" />
            {quest.xp_reward} XP reward
          </span>
          {quest.max_party_size > 1 && (
            <span className="inline-flex items-center gap-1.5 bg-muted rounded-lg px-3 py-1.5">
              <Users className="h-3.5 w-3.5" />
              Party of up to {quest.max_party_size}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 bg-muted rounded-lg px-3 py-1.5">
            <CheckCircle className="h-3.5 w-3.5" />
            {diffConfig?.validationMethod.replace(/_/g, " ")}
          </span>
          {quest.scheduled_for && (
            <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary rounded-lg px-3 py-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {new Intl.DateTimeFormat("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              }).format(new Date(quest.scheduled_for))}
            </span>
          )}
          {quest.expires_at && (
            <span className="inline-flex items-center gap-1.5 bg-muted rounded-lg px-3 py-1.5">
              <Clock className="h-3.5 w-3.5" />
              Expires {formatRelativeTime(new Date(quest.expires_at))}
            </span>
          )}
        </div>
      </div>

      {/* Author card */}
      <div className="rounded-xl border border-border bg-card p-4 mb-6">
        <div className="flex items-center gap-3">
          <Link
            href={`/profile/${author?.id}`}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
              {author?.display_name?.charAt(0).toUpperCase() ?? "?"}
            </div>
            <div>
              <span className="font-medium text-sm block">
                {author?.display_name ?? "Anonymous"}
              </span>
              <RenownTierBadge tier={(author?.renown_tier ?? 1) as RenownTier} />
            </div>
          </Link>
        </div>
      </div>

      {/* Party members */}
      {quest.max_party_size > 1 && currentPartySize > 0 && (
        <div className="rounded-xl border border-border bg-card p-4 mb-6">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Party Members ({currentPartySize} / {quest.max_party_size})
          </h2>
          <div className="flex flex-wrap gap-3">
            {partyMembers.map((member) => {
              const profile = Array.isArray(member.profiles)
                ? member.profiles[0]
                : member.profiles;
              return (
                <Link
                  key={member.user_id}
                  href={`/profile/${member.user_id}`}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">
                    {profile?.display_name?.charAt(0).toUpperCase() ?? "?"}
                  </div>
                  <span className="text-sm font-medium">
                    {profile?.display_name ?? "Anonymous"}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions: claim / complete / validate */}
      <QuestActions
        questId={quest.id}
        questStatus={quest.status}
        isAuthor={isAuthor}
        isPartyMember={isPartyMember}
        hasValidated={hasValidated}
        validationMethod={quest.validation_method}
        validationCount={quest.validation_count}
        validationThreshold={quest.validation_threshold}
        maxPartySize={quest.max_party_size}
        currentPartySize={currentPartySize}
      />

      {/* Validations */}
      {validations.length > 0 && (
        <section className="mt-6">
          <h2 className="text-lg font-semibold mb-3">Validations</h2>
          <div className="space-y-2">
            {validations.map((v) => {
              const validator = Array.isArray(v.validator)
                ? v.validator[0]
                : v.validator;
              return (
                <div
                  key={v.id}
                  className={`rounded-lg border p-3 ${
                    v.approved
                      ? "border-offer/20 bg-offer/5"
                      : "border-need/20 bg-need/5"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {validator?.display_name ?? "Unknown"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {v.approved ? "Approved" : "Rejected"}
                    </span>
                  </div>
                  {v.message && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {v.message}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
