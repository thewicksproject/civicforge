type CommunityId = string | null | undefined;

/**
 * Returns true only when both communities are present and equal.
 */
export function isSameCommunity(
  actorCommunityId: CommunityId,
  resourceCommunityId: CommunityId
): boolean {
  return Boolean(
    actorCommunityId &&
      resourceCommunityId &&
      actorCommunityId === resourceCommunityId
  );
}

interface ModerationScopeInput {
  renownTier: number | null | undefined;
  moderatorCommunityId: CommunityId;
  resourceCommunityId: CommunityId;
}

/**
 * Tier-3 moderation is scoped to the moderator's own community.
 */
export function canModerateCommunityResource({
  renownTier,
  moderatorCommunityId,
  resourceCommunityId,
}: ModerationScopeInput): boolean {
  return (
    (renownTier ?? 0) >= 3 &&
    isSameCommunity(moderatorCommunityId, resourceCommunityId)
  );
}
