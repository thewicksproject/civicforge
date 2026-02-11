"use client";

import dynamic from "next/dynamic";
import type { CommonsData } from "@/app/actions/commons";
import { PrivacyNotice } from "./components/privacy-notice";
import { StatCard } from "./components/stat-card";

const CommonsHeader = dynamic(
  () =>
    import("./components/commons-header").then((m) => m.CommonsHeader),
  { ssr: false }
);

const KnowledgeGraph = dynamic(
  () => import("./components/knowledge-graph").then((m) => m.KnowledgeGraph),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[400px] items-center justify-center rounded-xl border border-border bg-card">
        <p className="text-muted-foreground">Loading knowledge graph…</p>
      </div>
    ),
  }
);

const DomainRadar = dynamic(
  () => import("./components/domain-radar").then((m) => m.DomainRadar),
  { ssr: false }
);

const RenownPyramid = dynamic(
  () => import("./components/renown-pyramid").then((m) => m.RenownPyramid),
  { ssr: false }
);

const QuestActivity = dynamic(
  () => import("./components/quest-activity").then((m) => m.QuestActivity),
  { ssr: false }
);

const GuildHealth = dynamic(
  () => import("./components/guild-health").then((m) => m.GuildHealth),
  { ssr: false }
);

const GovernanceGauge = dynamic(
  () => import("./components/governance-gauge").then((m) => m.GovernanceGauge),
  { ssr: false }
);

const CommunityGrowth = dynamic(
  () => import("./components/community-growth").then((m) => m.CommunityGrowth),
  { ssr: false }
);

interface CommonsDashboardProps {
  data: CommonsData;
}

export function CommonsDashboard({ data }: CommonsDashboardProps) {
  const activeDomains = data.domainDistribution.filter(
    (d) => d.practitioners > 0
  ).length;
  const totalQuests = data.questDifficultyBreakdown.reduce(
    (a, b) => a + b.count,
    0
  );
  const totalEndorsements = data.endorsementFlows.reduce(
    (a, b) => a + b.weight,
    0
  );
  const memberCount =
    data.community?.memberCount ??
    data.renownPyramid.reduce((a, b) => a + b.count, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <CommonsHeader
          communities={data.communities}
          currentCommunityId={data.community?.id}
          currentCommunityName={data.community?.name}
          generatedAt={data.generatedAt}
        />

        {/* Privacy Notice */}
        <PrivacyNotice />

        {/* Knowledge Graph — centerpiece */}
        <KnowledgeGraph
          nodes={data.graphNodes}
          edges={data.graphEdges}
        />

        {/* KPI Stat Cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Health Score"
            value={data.healthScore}
            subtitle="out of 100"
          />
          <StatCard
            label="Members"
            value={memberCount}
            subtitle={
              data.community ? data.community.name : "across all communities"
            }
          />
          <StatCard
            label="Active Domains"
            value={`${activeDomains} / 7`}
            subtitle="skill domains with practitioners"
          />
          <StatCard
            label="Total Quests"
            value={totalQuests}
            subtitle={`${totalEndorsements} cross-domain endorsements`}
          />
        </div>

        {/* Charts grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <DomainRadar domains={data.domainDistribution} />
          <RenownPyramid tiers={data.renownPyramid} />
          <QuestActivity weeks={data.questActivity} />
          <GuildHealth guilds={data.guildEcosystem} />
          <GovernanceGauge metrics={data.governanceMetrics} />
          <CommunityGrowth
            weeks={data.communityGrowth}
            hiddenForPrivacy={data.privacy.growthHidden}
          />
        </div>
      </div>
    </div>
  );
}
