"use server";

import { createServiceClient } from "@/lib/supabase/server";
import type { SkillDomain } from "@/lib/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DomainStat {
  domain: SkillDomain;
  practitioners: number;
  totalXp: number;
  avgLevel: number;
  questsCompleted: number;
}

export interface TierCount {
  tier: number;
  name: string;
  count: number;
}

export interface WeeklyPoint {
  week: string; // ISO date of week start
  value: number;
  secondary?: number;
}

export interface DiffCount {
  difficulty: string;
  count: number;
}

export interface GuildStat {
  name: string;
  domain: SkillDomain;
  memberCount: number;
  charterHealthDays: number;
}

export interface GovStats {
  totalProposals: number;
  byStatus: { status: string; count: number }[];
  avgParticipation: number;
}

export interface DomainEdge {
  source: SkillDomain;
  target: SkillDomain;
  weight: number;
}

export interface GraphNode {
  id: string;
  type: "domain" | "guild" | "difficulty";
  label: string;
  size: number;
  color: string;
  domain?: SkillDomain;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: "guild-domain" | "endorsement" | "quest-domain";
  weight: number;
  color: string;
}

export interface CommonsData {
  community: {
    id: string;
    name: string;
    city: string;
    state: string;
    memberCount: number;
  } | null;
  communities: { id: string; name: string }[];
  healthScore: number;
  domainDistribution: DomainStat[];
  renownPyramid: TierCount[];
  questActivity: WeeklyPoint[];
  questDifficultyBreakdown: DiffCount[];
  guildEcosystem: GuildStat[];
  governanceMetrics: GovStats;
  endorsementFlows: DomainEdge[];
  graphNodes: GraphNode[];
  graphEdges: GraphEdge[];
  communityGrowth: WeeklyPoint[];
  generatedAt: string;
}

// ---------------------------------------------------------------------------
// K-anonymity threshold
// ---------------------------------------------------------------------------

const K_THRESHOLD = 3;

function suppress(count: number): number {
  return count >= K_THRESHOLD ? count : 0;
}

// ---------------------------------------------------------------------------
// Chart domain colors (must match CSS variables)
// ---------------------------------------------------------------------------

const DOMAIN_CHART_COLORS: Record<SkillDomain, string> = {
  craft: "var(--chart-craft)",
  green: "var(--chart-green)",
  care: "var(--chart-care)",
  bridge: "var(--chart-bridge)",
  signal: "var(--chart-signal)",
  hearth: "var(--chart-hearth)",
  weave: "var(--chart-weave)",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  spark: "var(--muted-foreground)",
  ember: "var(--golden-hour)",
  flame: "var(--rose-clay)",
  blaze: "var(--horizon)",
  inferno: "var(--destructive)",
};

const TIER_NAMES: Record<number, string> = {
  1: "Newcomer",
  2: "Neighbor",
  3: "Pillar",
  4: "Keeper",
  5: "Founder",
};

// ---------------------------------------------------------------------------
// Main data fetcher
// ---------------------------------------------------------------------------

export async function getCommonsData(
  communityId?: string
): Promise<CommonsData> {
  const admin = createServiceClient();

  // Fetch communities list for picker
  const { data: allCommunities } = await admin
    .from("communities")
    .select("id, name")
    .order("name");

  const communities = (allCommunities ?? []).map((c) => ({
    id: c.id,
    name: c.name,
  }));

  // If a specific community is requested, fetch its info
  let community: CommonsData["community"] = null;
  let communityFilter: { column: string; value: string } | null = null;

  if (communityId) {
    const { data: comm } = await admin
      .from("communities")
      .select("id, name, city, state")
      .eq("id", communityId)
      .single();

    if (comm) {
      const { count: memberCount } = await admin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("community_id", communityId);

      community = {
        id: comm.id,
        name: comm.name,
        city: comm.city ?? "",
        state: comm.state ?? "",
        memberCount: memberCount ?? 0,
      };
      communityFilter = { column: "community_id", value: communityId };
    }
  }

  // Fetch all data in parallel
  const [
    domainDistribution,
    renownPyramid,
    questActivity,
    questDifficultyBreakdown,
    guildEcosystem,
    governanceMetrics,
    endorsementFlows,
    communityGrowth,
    totalMembers,
  ] = await Promise.all([
    fetchDomainDistribution(admin, communityFilter),
    fetchRenownPyramid(admin, communityFilter),
    fetchQuestActivity(admin, communityFilter),
    fetchQuestDifficultyBreakdown(admin, communityFilter),
    fetchGuildEcosystem(admin, communityFilter),
    fetchGovernanceMetrics(admin, communityFilter),
    fetchEndorsementFlows(admin, communityFilter),
    fetchCommunityGrowth(admin, communityFilter),
    fetchTotalMembers(admin, communityFilter),
  ]);

  // Build graph
  const { graphNodes, graphEdges } = buildGraph(
    domainDistribution,
    guildEcosystem,
    questDifficultyBreakdown,
    endorsementFlows
  );

  // Compute health score
  const healthScore = computeHealthScore(
    questActivity,
    guildEcosystem,
    endorsementFlows,
    governanceMetrics,
    communityGrowth,
    totalMembers
  );

  return {
    community,
    communities,
    healthScore,
    domainDistribution,
    renownPyramid,
    questActivity,
    questDifficultyBreakdown,
    guildEcosystem,
    governanceMetrics,
    endorsementFlows,
    graphNodes,
    graphEdges,
    communityGrowth,
    generatedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Query helpers
// ---------------------------------------------------------------------------

type AdminClient = ReturnType<typeof createServiceClient>;
type Filter = { column: string; value: string } | null;

async function fetchTotalMembers(
  admin: AdminClient,
  filter: Filter
): Promise<number> {
  let q = admin.from("profiles").select("id", { count: "exact", head: true });
  if (filter) q = q.eq(filter.column, filter.value);
  const { count } = await q;
  return count ?? 0;
}

async function fetchDomainDistribution(
  admin: AdminClient,
  filter: Filter
): Promise<DomainStat[]> {
  // Supabase JS doesn't support raw SQL GROUP BY, so we fetch skill_progress
  // rows and aggregate in TypeScript. The table is small (seed: 70 rows).
  let q = admin
    .from("skill_progress")
    .select("domain, user_id, total_xp, level, quests_completed");

  if (filter) {
    // skill_progress doesn't have community_id, join through profiles
    const { data: profileIds } = await admin
      .from("profiles")
      .select("id")
      .eq(filter.column, filter.value);

    const ids = (profileIds ?? []).map((p) => p.id);
    if (ids.length === 0) return [];
    q = q.in("user_id", ids);
  }

  const { data: rows } = await q;
  if (!rows || rows.length === 0) return [];

  // Group by domain
  const grouped: Record<
    string,
    { users: Set<string>; totalXp: number; levels: number[]; quests: number }
  > = {};

  for (const row of rows) {
    const d = row.domain as string;
    if (!grouped[d]) {
      grouped[d] = { users: new Set(), totalXp: 0, levels: [], quests: 0 };
    }
    grouped[d].users.add(row.user_id);
    grouped[d].totalXp += row.total_xp ?? 0;
    grouped[d].levels.push(row.level ?? 0);
    grouped[d].quests += row.quests_completed ?? 0;
  }

  return Object.entries(grouped)
    .map(([domain, g]) => ({
      domain: domain as SkillDomain,
      practitioners: suppress(g.users.size),
      totalXp: g.users.size >= K_THRESHOLD ? g.totalXp : 0,
      avgLevel:
        g.users.size >= K_THRESHOLD
          ? Math.round(
              (g.levels.reduce((a, b) => a + b, 0) / g.levels.length) * 10
            ) / 10
          : 0,
      questsCompleted: g.users.size >= K_THRESHOLD ? g.quests : 0,
    }))
    .filter((d) => d.practitioners > 0);
}

async function fetchRenownPyramid(
  admin: AdminClient,
  filter: Filter
): Promise<TierCount[]> {
  let q = admin.from("profiles").select("renown_tier");
  if (filter) q = q.eq(filter.column, filter.value);

  const { data: rows } = await q;
  if (!rows) return [];

  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const row of rows) {
    const tier = row.renown_tier ?? 1;
    counts[tier] = (counts[tier] ?? 0) + 1;
  }

  return Object.entries(counts).map(([tier, count]) => ({
    tier: Number(tier),
    name: TIER_NAMES[Number(tier)] ?? `Tier ${tier}`,
    count: suppress(count),
  }));
}

async function fetchQuestActivity(
  admin: AdminClient,
  filter: Filter
): Promise<WeeklyPoint[]> {
  // Fetch completed quests from the last 12 weeks
  const twelveWeeksAgo = new Date();
  twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84);

  let q = admin
    .from("quests")
    .select("completed_at, xp_reward, status")
    .gte("created_at", twelveWeeksAgo.toISOString());

  if (filter) q = q.eq(filter.column, filter.value);

  const { data: quests } = await q;
  if (!quests) return [];

  // Bucket by week
  const weeks: Record<string, { completions: number; xp: number }> = {};

  // Initialize 12 weeks
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i * 7);
    // Start of week (Monday)
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    const key = d.toISOString().split("T")[0];
    weeks[key] = { completions: 0, xp: 0 };
  }

  for (const quest of quests) {
    if (quest.status !== "completed" || !quest.completed_at) continue;
    const d = new Date(quest.completed_at);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    const key = d.toISOString().split("T")[0];
    if (weeks[key]) {
      weeks[key].completions += 1;
      weeks[key].xp += quest.xp_reward ?? 0;
    }
  }

  return Object.entries(weeks)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, data]) => ({
      week,
      value: data.completions,
      secondary: data.xp,
    }));
}

async function fetchQuestDifficultyBreakdown(
  admin: AdminClient,
  filter: Filter
): Promise<DiffCount[]> {
  let q = admin.from("quests").select("difficulty");
  if (filter) q = q.eq(filter.column, filter.value);

  const { data: quests } = await q;
  if (!quests) return [];

  const counts: Record<string, number> = {};
  for (const quest of quests) {
    const d = quest.difficulty as string;
    counts[d] = (counts[d] ?? 0) + 1;
  }

  return ["spark", "ember", "flame", "blaze", "inferno"].map((d) => ({
    difficulty: d,
    count: counts[d] ?? 0,
  }));
}

async function fetchGuildEcosystem(
  admin: AdminClient,
  filter: Filter
): Promise<GuildStat[]> {
  let q = admin
    .from("guilds")
    .select("id, name, domain, created_at");
  if (filter) q = q.eq(filter.column, filter.value);

  const { data: guilds } = await q;
  if (!guilds || guilds.length === 0) return [];

  // Fetch member counts per guild
  const guildIds = guilds.map((g) => g.id);
  const { data: members } = await admin
    .from("guild_members")
    .select("guild_id")
    .in("guild_id", guildIds);

  const memberCounts: Record<string, number> = {};
  for (const m of members ?? []) {
    memberCounts[m.guild_id] = (memberCounts[m.guild_id] ?? 0) + 1;
  }

  // Fetch sunset rules for charter health
  const { data: sunsets } = await admin
    .from("sunset_rules")
    .select("resource_id, expires_at")
    .eq("resource_type", "guild_charter")
    .in("resource_id", guildIds);

  const charterExpiry: Record<string, string> = {};
  for (const s of sunsets ?? []) {
    charterExpiry[s.resource_id] = s.expires_at;
  }

  return guilds.map((g) => {
    const mc = memberCounts[g.id] ?? 0;
    const expiresAt = charterExpiry[g.id];
    let charterHealthDays = 365; // default if no sunset
    if (expiresAt) {
      charterHealthDays = Math.max(
        0,
        Math.round(
          (new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )
      );
    }

    return {
      name: g.name,
      domain: g.domain as SkillDomain,
      memberCount: suppress(mc),
      charterHealthDays,
    };
  });
}

async function fetchGovernanceMetrics(
  admin: AdminClient,
  filter: Filter
): Promise<GovStats> {
  let q = admin
    .from("governance_proposals")
    .select("id, status, votes_for, votes_against");
  if (filter) q = q.eq(filter.column, filter.value);

  const { data: proposals } = await q;
  if (!proposals || proposals.length === 0) {
    return { totalProposals: 0, byStatus: [], avgParticipation: 0 };
  }

  const statusCounts: Record<string, number> = {};
  let totalVotes = 0;
  let proposalsWithVotes = 0;

  for (const p of proposals) {
    statusCounts[p.status] = (statusCounts[p.status] ?? 0) + 1;
    const votes = (p.votes_for ?? 0) + (p.votes_against ?? 0);
    if (votes > 0) {
      totalVotes += votes;
      proposalsWithVotes++;
    }
  }

  return {
    totalProposals: proposals.length,
    byStatus: Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
    })),
    avgParticipation:
      proposalsWithVotes > 0
        ? Math.round((totalVotes / proposalsWithVotes) * 10) / 10
        : 0,
  };
}

async function fetchEndorsementFlows(
  admin: AdminClient,
  filter: Filter
): Promise<DomainEdge[]> {
  // Fetch endorsements with the endorser's primary skill domain
  // endorsements have: from_user, to_user, domain (target domain)
  // We need the source domain from the endorser's skill_progress

  let endorsementQuery = admin
    .from("endorsements")
    .select("from_user, domain");

  if (filter) {
    // Filter by community: get profile IDs first
    const { data: profileIds } = await admin
      .from("profiles")
      .select("id")
      .eq(filter.column, filter.value);

    const ids = (profileIds ?? []).map((p) => p.id);
    if (ids.length === 0) return [];
    endorsementQuery = endorsementQuery.in("from_user", ids);
  }

  const { data: endorsements } = await endorsementQuery;
  if (!endorsements || endorsements.length === 0) return [];

  // Get each endorser's top skill domain (highest XP)
  const endorserIds = [...new Set(endorsements.map((e) => e.from_user))];
  const { data: skills } = await admin
    .from("skill_progress")
    .select("user_id, domain, total_xp")
    .in("user_id", endorserIds);

  // Find top domain per user
  const topDomain: Record<string, string> = {};
  const domainXp: Record<string, Record<string, number>> = {};
  for (const s of skills ?? []) {
    if (!domainXp[s.user_id]) domainXp[s.user_id] = {};
    domainXp[s.user_id][s.domain] = s.total_xp ?? 0;
  }
  for (const [userId, domains] of Object.entries(domainXp)) {
    let best = "";
    let bestXp = -1;
    for (const [d, xp] of Object.entries(domains)) {
      if (xp > bestXp) {
        best = d;
        bestXp = xp;
      }
    }
    if (best) topDomain[userId] = best;
  }

  // Aggregate domain->domain flows
  const flows: Record<string, number> = {};
  for (const e of endorsements) {
    const src = topDomain[e.from_user];
    if (!src) continue;
    const tgt = e.domain as string;
    if (src === tgt) continue; // skip self-domain endorsements for graph clarity
    const key = `${src}->${tgt}`;
    flows[key] = (flows[key] ?? 0) + 1;
  }

  return Object.entries(flows)
    .filter(([, count]) => count >= K_THRESHOLD)
    .map(([key, weight]) => {
      const [source, target] = key.split("->") as [SkillDomain, SkillDomain];
      return { source, target, weight };
    });
}

async function fetchCommunityGrowth(
  admin: AdminClient,
  filter: Filter
): Promise<WeeklyPoint[]> {
  let q = admin.from("profiles").select("created_at");
  if (filter) q = q.eq(filter.column, filter.value);

  const { data: profiles } = await q;
  if (!profiles) return [];

  // Bucket by week for last 12 weeks
  const weeks: Record<string, number> = {};
  const weekKeys: string[] = [];

  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i * 7);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    const key = d.toISOString().split("T")[0];
    weeks[key] = 0;
    weekKeys.push(key);
  }

  for (const profile of profiles) {
    if (!profile.created_at) continue;
    const d = new Date(profile.created_at);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    const key = d.toISOString().split("T")[0];
    if (weeks[key] !== undefined) {
      weeks[key]++;
    }
  }

  // Build cumulative
  let cumulative = 0;
  // Count members before the window
  const firstWeek = weekKeys[0];
  for (const profile of profiles) {
    if (!profile.created_at) continue;
    const d = new Date(profile.created_at);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    const key = d.toISOString().split("T")[0];
    if (key < firstWeek) cumulative++;
  }

  return weekKeys.map((week) => {
    cumulative += weeks[week];
    return {
      week,
      value: weeks[week], // new members this week
      secondary: cumulative, // cumulative
    };
  });
}

// ---------------------------------------------------------------------------
// Graph builder
// ---------------------------------------------------------------------------

function buildGraph(
  domains: DomainStat[],
  guilds: GuildStat[],
  difficulties: DiffCount[],
  endorsementFlows: DomainEdge[]
): { graphNodes: GraphNode[]; graphEdges: GraphEdge[] } {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  // Domain nodes
  for (const d of domains) {
    nodes.push({
      id: `domain-${d.domain}`,
      type: "domain",
      label: d.domain.charAt(0).toUpperCase() + d.domain.slice(1),
      size: Math.max(20, Math.min(50, d.practitioners * 2)),
      color: DOMAIN_CHART_COLORS[d.domain],
      domain: d.domain,
    });
  }

  // Guild nodes
  for (const g of guilds) {
    if (g.memberCount === 0) continue;
    nodes.push({
      id: `guild-${g.name.replace(/\s+/g, "-").toLowerCase()}`,
      type: "guild",
      label: g.name,
      size: Math.max(15, Math.min(35, g.memberCount * 3)),
      color: DOMAIN_CHART_COLORS[g.domain],
      domain: g.domain,
    });

    // Guild -> Domain edge
    edges.push({
      source: `guild-${g.name.replace(/\s+/g, "-").toLowerCase()}`,
      target: `domain-${g.domain}`,
      type: "guild-domain",
      weight: g.memberCount,
      color: DOMAIN_CHART_COLORS[g.domain],
    });
  }

  // Difficulty nodes
  for (const d of difficulties) {
    if (d.count === 0) continue;
    nodes.push({
      id: `diff-${d.difficulty}`,
      type: "difficulty",
      label: d.difficulty.charAt(0).toUpperCase() + d.difficulty.slice(1),
      size: Math.max(12, Math.min(30, d.count)),
      color: DIFFICULTY_COLORS[d.difficulty] ?? "var(--muted-foreground)",
    });
  }

  // Endorsement flow edges (domain -> domain)
  for (const flow of endorsementFlows) {
    edges.push({
      source: `domain-${flow.source}`,
      target: `domain-${flow.target}`,
      type: "endorsement",
      weight: flow.weight,
      color: DOMAIN_CHART_COLORS[flow.target],
    });
  }

  return { graphNodes: nodes, graphEdges: edges };
}

// ---------------------------------------------------------------------------
// Health score (0-100 composite)
// ---------------------------------------------------------------------------

function computeHealthScore(
  questActivity: WeeklyPoint[],
  guilds: GuildStat[],
  endorsementFlows: DomainEdge[],
  governance: GovStats,
  growth: WeeklyPoint[],
  totalMembers: number
): number {
  let score = 0;

  // Quest completion rate (30%) — recent weeks with completions / 12
  const activeWeeks = questActivity.filter((w) => w.value > 0).length;
  score += (activeWeeks / Math.max(questActivity.length, 1)) * 30;

  // Active guild ratio (20%) — guilds with members / total guilds
  const activeGuilds = guilds.filter((g) => g.memberCount > 0).length;
  score +=
    guilds.length > 0
      ? (activeGuilds / guilds.length) * 20
      : 0;

  // Endorsement density (20%) — flows exist = healthy cross-pollination
  const maxFlows = 42; // 7 domains * 6 possible targets
  score += Math.min(1, endorsementFlows.length / Math.max(maxFlows * 0.2, 1)) * 20;

  // Governance participation (15%)
  score +=
    governance.totalProposals > 0
      ? Math.min(1, governance.avgParticipation / 5) * 15
      : 0;

  // Member growth trend (15%) — positive slope
  if (growth.length >= 4) {
    const recentHalf = growth.slice(-Math.floor(growth.length / 2));
    const earlierHalf = growth.slice(0, Math.floor(growth.length / 2));
    const recentAvg =
      recentHalf.reduce((a, b) => a + b.value, 0) /
      Math.max(recentHalf.length, 1);
    const earlierAvg =
      earlierHalf.reduce((a, b) => a + b.value, 0) /
      Math.max(earlierHalf.length, 1);
    const growthRate = earlierAvg > 0 ? recentAvg / earlierAvg : 1;
    score += Math.min(1, growthRate) * 15;
  }

  return Math.round(Math.min(100, Math.max(0, score)));
}
