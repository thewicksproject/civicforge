export const COMMONS_K_THRESHOLD = 3;
export const COMMONS_GROWTH_HIDE_THRESHOLD = 10;

export interface WeeklyPointLike {
  week: string;
  value: number;
  secondary?: number;
}

export function suppressCount(count: number): number {
  return count >= COMMONS_K_THRESHOLD ? count : 0;
}

export function getCommonsPrivacyFlags(memberCount: number | null): {
  growthHidden: boolean;
  smallGroupSuppressed: boolean;
} {
  return {
    smallGroupSuppressed:
      memberCount !== null && memberCount < COMMONS_K_THRESHOLD,
    growthHidden:
      memberCount !== null && memberCount < COMMONS_GROWTH_HIDE_THRESHOLD,
  };
}

export function sanitizeCommunityGrowthSeries(
  communityGrowth: WeeklyPointLike[]
): WeeklyPointLike[] {
  let cumulative = 0;
  return communityGrowth.map((point) => {
    const safeValue = suppressCount(point.value);
    cumulative += safeValue;
    return {
      week: point.week,
      value: safeValue,
      secondary: cumulative,
    };
  });
}
