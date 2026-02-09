import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Users, Clock } from "lucide-react";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { formatRelativeTime } from "@/lib/utils";
import { SkillDomainBadge } from "@/components/skill-domain-badge";
import { RenownTierBadge } from "@/components/trust-tier-badge";
import { GuildActions } from "@/components/guild-actions";
import type { SkillDomain, RenownTier } from "@/lib/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = await params;
  const admin = createServiceClient();
  const { data: guild } = await admin
    .from("guilds")
    .select("name")
    .eq("id", guildId)
    .single();

  if (!guild) return { title: "Guild Not Found" };
  return { title: guild.name };
}

export default async function GuildDetailPage({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admin = createServiceClient();

  const { data: guild } = await admin
    .from("guilds")
    .select(`
      *,
      founder:profiles!guilds_created_by_fkey(id, display_name, renown_tier),
      guild_members(
        id, role, user_id, joined_at,
        member:profiles!guild_members_user_id_fkey(display_name, renown_tier)
      )
    `)
    .eq("id", guildId)
    .single();

  if (!guild || !guild.active) notFound();

  const members = (guild.guild_members ?? []) as Array<{
    id: string;
    role: string;
    user_id: string;
    joined_at: string;
    member: { display_name: string; renown_tier: number } | null;
  }>;

  const userMembership = members.find((m) => m.user_id === user?.id);
  const isMember = !!userMembership;
  const isSteward = userMembership?.role === "steward";

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/guilds"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Guilds
      </Link>

      {/* Guild header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <SkillDomainBadge domain={guild.domain as SkillDomain} size="md" />
        </div>
        <h1 className="text-2xl font-semibold mb-2">{guild.name}</h1>
        {guild.description && (
          <p className="text-foreground leading-relaxed">
            {guild.description}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 bg-muted rounded-lg px-3 py-1.5">
            <Users className="h-3.5 w-3.5" />
            {guild.member_count} member{guild.member_count === 1 ? "" : "s"}
          </span>
          {guild.charter_sunset_at && (
            <span className="inline-flex items-center gap-1.5 bg-muted rounded-lg px-3 py-1.5">
              <Clock className="h-3.5 w-3.5" />
              Charter expires {formatRelativeTime(new Date(guild.charter_sunset_at))}
            </span>
          )}
        </div>
      </div>

      {/* Charter */}
      {guild.charter && (
        <div className="rounded-xl border border-border bg-card p-5 mb-6">
          <h2 className="text-lg font-semibold mb-2">Charter</h2>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {guild.charter}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="mb-6">
        <GuildActions
          guildId={guildId}
          isMember={isMember}
          isSteward={isSteward}
        />
      </div>

      {/* Members */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Members</h2>
        <div className="space-y-2">
          {members.map((m) => {
            const member = Array.isArray(m.member) ? m.member[0] : m.member;
            return (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
              >
                <div className="flex items-center gap-3">
                  <Link
                    href={`/profile/${m.user_id}`}
                    className="font-medium text-sm hover:underline"
                  >
                    {member?.display_name ?? "Unknown"}
                  </Link>
                  <RenownTierBadge tier={(member?.renown_tier ?? 1) as RenownTier} />
                </div>
                <div className="flex items-center gap-2">
                  {m.role === "steward" && (
                    <span className="rounded-full bg-golden-hour/10 text-golden-hour px-2 py-0.5 text-xs font-medium">
                      Steward
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    Joined {formatRelativeTime(new Date(m.joined_at))}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
