import Link from "next/link";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { GuildCard } from "@/components/guild-card";

export const metadata = { title: "Guilds" };

export default async function GuildsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admin = createServiceClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("neighborhood_id, renown_tier")
    .eq("id", user!.id)
    .single();

  if (!profile?.neighborhood_id) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Join a neighborhood to see guilds.</p>
      </div>
    );
  }

  const { data: guilds } = await admin
    .from("guilds")
    .select(`
      id, name, domain, description, charter_sunset_at,
      member_count, active, created_at,
      created_by, profiles!guilds_created_by_fkey(display_name)
    `)
    .eq("neighborhood_id", profile.neighborhood_id)
    .eq("active", true)
    .order("member_count", { ascending: false });

  // Check user's guild memberships
  const { data: memberships } = await admin
    .from("guild_members")
    .select("guild_id")
    .eq("user_id", user!.id);

  const memberGuildIds = new Set((memberships ?? []).map((m) => m.guild_id));
  const canCreateGuild = (profile.renown_tier ?? 1) >= 3;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Guilds</h1>
          <p className="text-sm text-muted-foreground">
            Persistent groups organized around skill domains
          </p>
        </div>
        {canCreateGuild && (
          <Link
            href="/guilds/new"
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Found a Guild
          </Link>
        )}
      </div>

      {guilds && guilds.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {guilds.map((guild) => {
            const author = Array.isArray(guild.profiles)
              ? guild.profiles[0]
              : guild.profiles;
            const isMember = memberGuildIds.has(guild.id);
            return (
              <div key={guild.id} className="relative">
                {isMember && (
                  <span className="absolute top-3 right-3 rounded-full bg-offer/10 text-offer px-2 py-0.5 text-xs font-medium z-10">
                    Member
                  </span>
                )}
                <GuildCard
                  id={guild.id}
                  name={guild.name}
                  domain={guild.domain}
                  description={guild.description}
                  memberCount={guild.member_count}
                  charterSunsetAt={guild.charter_sunset_at}
                  createdAt={guild.created_at}
                  createdByName={author?.display_name ?? "Unknown"}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 rounded-xl border border-dashed border-border">
          <h3 className="text-lg font-semibold mb-1">No guilds yet</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
            Guilds are persistent groups organized around skill domains.
            Pillars (Renown Tier 3+) can found new guilds.
          </p>
        </div>
      )}
    </div>
  );
}
