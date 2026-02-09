import {
  pgTable,
  pgEnum,
  uuid,
  text,
  varchar,
  integer,
  real,
  boolean,
  timestamp,
  date,
  jsonb,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const postTypeEnum = pgEnum("post_type", ["need", "offer"]);

export const postStatusEnum = pgEnum("post_status", [
  "active",
  "in_progress",
  "completed",
  "expired",
]);

export const urgencyLevelEnum = pgEnum("urgency_level", [
  "low",
  "medium",
  "high",
]);

export const responseStatusEnum = pgEnum("response_status", [
  "pending",
  "accepted",
  "declined",
]);

export const membershipStatusEnum = pgEnum("membership_status", [
  "pending",
  "approved",
  "denied",
]);

export const deletionStatusEnum = pgEnum("deletion_status", [
  "pending",
  "processing",
  "completed",
]);

export const reviewStatusEnum = pgEnum("review_status", [
  "none",
  "pending_review",
  "approved",
  "rejected",
]);

// Ascendant enums

export const questDifficultyEnum = pgEnum("quest_difficulty", [
  "spark",
  "ember",
  "flame",
  "blaze",
  "inferno",
]);

export const questValidationEnum = pgEnum("quest_validation_method", [
  "self_report",
  "peer_confirm",
  "photo_and_peer",
  "community_vote",
  "community_vote_and_evidence",
]);

export const questStatusEnum = pgEnum("quest_status", [
  "open",
  "claimed",
  "in_progress",
  "pending_validation",
  "completed",
  "expired",
  "cancelled",
]);

export const skillDomainEnum = pgEnum("skill_domain", [
  "craft",
  "green",
  "care",
  "bridge",
  "signal",
  "hearth",
  "weave",
]);

export const guildRoleEnum = pgEnum("guild_role", ["member", "steward"]);

export const proposalStatusEnum = pgEnum("proposal_status", [
  "draft",
  "deliberation",
  "voting",
  "passed",
  "rejected",
  "expired",
]);

export const voteTypeEnum = pgEnum("vote_type", [
  "quadratic",
  "approval",
  "liquid_delegate",
]);

export const privacyTierEnum = pgEnum("privacy_tier", [
  "ghost",
  "quiet",
  "open",
  "mentor",
]);

export const sunsetRuleTypeEnum = pgEnum("sunset_rule_type", [
  "neighborhood_charter",
  "guild_charter",
  "tier_threshold",
  "federation_agreement",
  "seasonal_quest_template",
  "reputation_multiplier",
  "moderation_policy",
]);

// ---------------------------------------------------------------------------
// 1. Neighborhoods (defined before profiles because profiles references it)
// ---------------------------------------------------------------------------

export const neighborhoods = pgTable(
  "neighborhoods",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    city: text("city").notNull(),
    state: text("state").notNull(),
    zipCodes: text("zip_codes").array().notNull(),
    description: text("description"),
    createdBy: uuid("created_by"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("neighborhoods_city_state_idx").on(table.city, table.state),
  ],
);

// ---------------------------------------------------------------------------
// 2. Profiles
// ---------------------------------------------------------------------------

export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").primaryKey(), // references auth.users; set by trigger/app
    displayName: text("display_name").notNull(),
    neighborhoodId: uuid("neighborhood_id").references(
      () => neighborhoods.id,
      { onDelete: "set null" },
    ),
    bio: text("bio"),
    skills: text("skills").array().notNull().default([]),
    reputationScore: integer("reputation_score").notNull().default(0),
    renownTier: integer("renown_tier").notNull().default(1),
    phoneVerified: boolean("phone_verified").notNull().default(false),
    avatarUrl: text("avatar_url"),
    // Ascendant fields
    renownScore: integer("renown_score").notNull().default(0),
    privacyTier: privacyTierEnum("privacy_tier").notNull().default("quiet"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("profiles_neighborhood_idx").on(table.neighborhoodId),
    index("profiles_renown_tier_idx").on(table.renownTier),
  ],
);

// Back-reference: neighborhoods.created_by -> profiles
// Drizzle doesn't support circular FK at declaration time, so we define
// the column as a plain uuid above and document the relationship here.
// The actual FK is enforced via a Supabase migration / raw SQL.

// ---------------------------------------------------------------------------
// 3. Posts
// ---------------------------------------------------------------------------

export const posts = pgTable(
  "posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    authorId: uuid("author_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    neighborhoodId: uuid("neighborhood_id")
      .notNull()
      .references(() => neighborhoods.id, { onDelete: "cascade" }),
    type: postTypeEnum("type").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    category: text("category").notNull(),
    skillsRelevant: text("skills_relevant").array().notNull().default([]),
    urgency: urgencyLevelEnum("urgency"),
    status: postStatusEnum("status").notNull().default("active"),
    locationHint: text("location_hint"),
    availableTimes: text("available_times"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    flagCount: integer("flag_count").notNull().default(0),
    hidden: boolean("hidden").notNull().default(false),
    aiAssisted: boolean("ai_assisted").notNull().default(false),
    reviewStatus: reviewStatusEnum("review_status").notNull().default("none"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("posts_author_idx").on(table.authorId),
    index("posts_neighborhood_idx").on(table.neighborhoodId),
    index("posts_type_status_idx").on(table.type, table.status),
    index("posts_category_idx").on(table.category),
    index("posts_created_at_idx").on(table.createdAt),
  ],
);

// ---------------------------------------------------------------------------
// 3b. Post Flags
// ---------------------------------------------------------------------------

export const postFlags = pgTable(
  "post_flags",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    reason: text("reason"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("post_flags_post_user_uniq").on(table.postId, table.userId),
    index("post_flags_post_idx").on(table.postId),
    index("post_flags_user_idx").on(table.userId),
  ],
);

// ---------------------------------------------------------------------------
// 4. Post Photos
// ---------------------------------------------------------------------------

export const postPhotos = pgTable(
  "post_photos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    thumbnailUrl: text("thumbnail_url").notNull(),
    uploadedBy: uuid("uploaded_by")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("post_photos_post_idx").on(table.postId)],
);

// ---------------------------------------------------------------------------
// 5. Responses
// ---------------------------------------------------------------------------

export const responses = pgTable(
  "responses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    responderId: uuid("responder_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    message: text("message").notNull(),
    status: responseStatusEnum("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("responses_post_responder_uniq").on(
      table.postId,
      table.responderId,
    ),
    index("responses_post_idx").on(table.postId),
    index("responses_responder_idx").on(table.responderId),
  ],
);

// ---------------------------------------------------------------------------
// 6. Thanks
// ---------------------------------------------------------------------------

export const thanks = pgTable(
  "thanks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fromUser: uuid("from_user")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    toUser: uuid("to_user")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    postId: uuid("post_id").references(() => posts.id, {
      onDelete: "set null",
    }),
    message: text("message"),
    photoUrl: text("photo_url"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("thanks_from_user_idx").on(table.fromUser),
    index("thanks_to_user_idx").on(table.toUser),
  ],
);

// ---------------------------------------------------------------------------
// 7. Invitations
// ---------------------------------------------------------------------------

export const invitations = pgTable(
  "invitations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: varchar("code", { length: 32 }).notNull().unique(),
    neighborhoodId: uuid("neighborhood_id")
      .notNull()
      .references(() => neighborhoods.id, { onDelete: "cascade" }),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    usedBy: uuid("used_by").references(() => profiles.id, {
      onDelete: "set null",
    }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("invitations_code_uniq").on(table.code),
    index("invitations_neighborhood_idx").on(table.neighborhoodId),
  ],
);

// ---------------------------------------------------------------------------
// 8. Membership Requests
// ---------------------------------------------------------------------------

export const membershipRequests = pgTable(
  "membership_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    neighborhoodId: uuid("neighborhood_id")
      .notNull()
      .references(() => neighborhoods.id, { onDelete: "cascade" }),
    status: membershipStatusEnum("status").notNull().default("pending"),
    reviewedBy: uuid("reviewed_by").references(() => profiles.id, {
      onDelete: "set null",
    }),
    message: text("message"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("membership_requests_user_idx").on(table.userId),
    index("membership_requests_neighborhood_idx").on(table.neighborhoodId),
    index("membership_requests_status_idx").on(table.status),
  ],
);

// ---------------------------------------------------------------------------
// 9. AI Matches
// ---------------------------------------------------------------------------

export const aiMatches = pgTable(
  "ai_matches",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    suggestedUserId: uuid("suggested_user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    matchScore: real("match_score").notNull(),
    matchReason: text("match_reason").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("ai_matches_post_idx").on(table.postId),
    index("ai_matches_suggested_user_idx").on(table.suggestedUserId),
    index("ai_matches_score_idx").on(table.matchScore),
  ],
);

// ---------------------------------------------------------------------------
// 10. AI Usage
// ---------------------------------------------------------------------------

export const aiUsage = pgTable(
  "ai_usage",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    tokensUsed: integer("tokens_used").notNull().default(0),
    requestsCount: integer("requests_count").notNull().default(0),
  },
  (table) => [
    uniqueIndex("ai_usage_user_date_uniq").on(table.userId, table.date),
    index("ai_usage_user_idx").on(table.userId),
  ],
);

// ---------------------------------------------------------------------------
// 11. User Consents
// ---------------------------------------------------------------------------

export const userConsents = pgTable(
  "user_consents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    consentType: text("consent_type").notNull(),
    policyVersion: text("policy_version").notNull(),
    grantedAt: timestamp("granted_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
  },
  (table) => [
    index("user_consents_user_idx").on(table.userId),
    index("user_consents_type_idx").on(table.consentType),
  ],
);

// ---------------------------------------------------------------------------
// 12. Audit Log
// ---------------------------------------------------------------------------

export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id"),
    action: text("action").notNull(),
    resourceType: text("resource_type").notNull(),
    resourceId: uuid("resource_id"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("audit_log_user_idx").on(table.userId),
    index("audit_log_action_idx").on(table.action),
    index("audit_log_resource_idx").on(table.resourceType, table.resourceId),
    index("audit_log_created_at_idx").on(table.createdAt),
  ],
);

// ---------------------------------------------------------------------------
// 13. Deletion Requests
// ---------------------------------------------------------------------------

export const deletionRequests = pgTable(
  "deletion_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    status: deletionStatusEnum("status").notNull().default("pending"),
    requestedAt: timestamp("requested_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => [
    index("deletion_requests_user_idx").on(table.userId),
    index("deletion_requests_status_idx").on(table.status),
  ],
);

// ===========================================================================
// ASCENDANT TABLES (V2.5+)
// ===========================================================================

// ---------------------------------------------------------------------------
// 14. Quests (extends posts with game mechanics)
// ---------------------------------------------------------------------------

export const quests = pgTable(
  "quests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    postId: uuid("post_id")
      .references(() => posts.id, { onDelete: "cascade" }),
    neighborhoodId: uuid("neighborhood_id")
      .notNull()
      .references(() => neighborhoods.id, { onDelete: "cascade" }),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").notNull(),
    difficulty: questDifficultyEnum("difficulty").notNull().default("spark"),
    validationMethod: questValidationEnum("validation_method")
      .notNull()
      .default("self_report"),
    status: questStatusEnum("status").notNull().default("open"),
    skillDomains: text("skill_domains").array().notNull().default([]),
    xpReward: integer("xp_reward").notNull().default(5),
    maxPartySize: integer("max_party_size").notNull().default(1),
    requestedByOther: boolean("requested_by_other").notNull().default(false),
    validationCount: integer("validation_count").notNull().default(0),
    validationThreshold: integer("validation_threshold").notNull().default(1),
    isEmergency: boolean("is_emergency").notNull().default(false),
    isSeasonal: boolean("is_seasonal").notNull().default(false),
    seasonalTemplateId: uuid("seasonal_template_id"),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("quests_post_idx").on(table.postId),
    index("quests_neighborhood_idx").on(table.neighborhoodId),
    index("quests_created_by_idx").on(table.createdBy),
    index("quests_status_idx").on(table.status),
    index("quests_difficulty_idx").on(table.difficulty),
    index("quests_created_at_idx").on(table.createdAt),
  ],
);

// ---------------------------------------------------------------------------
// 15. Quest Validations (peer confirmations and votes)
// ---------------------------------------------------------------------------

export const questValidations = pgTable(
  "quest_validations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    questId: uuid("quest_id")
      .notNull()
      .references(() => quests.id, { onDelete: "cascade" }),
    validatorId: uuid("validator_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    approved: boolean("approved").notNull(),
    message: text("message"),
    photoUrl: text("photo_url"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("quest_validations_quest_validator_uniq").on(
      table.questId,
      table.validatorId,
    ),
    index("quest_validations_quest_idx").on(table.questId),
    index("quest_validations_validator_idx").on(table.validatorId),
  ],
);

// ---------------------------------------------------------------------------
// 16. Skill Progress
// ---------------------------------------------------------------------------

export const skillProgress = pgTable(
  "skill_progress",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    domain: skillDomainEnum("domain").notNull(),
    totalXp: integer("total_xp").notNull().default(0),
    level: integer("level").notNull().default(0),
    questsCompleted: integer("quests_completed").notNull().default(0),
    lastQuestAt: timestamp("last_quest_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("skill_progress_user_domain_uniq").on(
      table.userId,
      table.domain,
    ),
    index("skill_progress_user_idx").on(table.userId),
    index("skill_progress_domain_idx").on(table.domain),
    index("skill_progress_level_idx").on(table.level),
  ],
);

// ---------------------------------------------------------------------------
// 17. Parties (ephemeral quest groups)
// ---------------------------------------------------------------------------

export const parties = pgTable(
  "parties",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    questId: uuid("quest_id")
      .notNull()
      .references(() => quests.id, { onDelete: "cascade" }),
    name: text("name"),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    disbanded: boolean("disbanded").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("parties_quest_idx").on(table.questId),
    index("parties_created_by_idx").on(table.createdBy),
  ],
);

// ---------------------------------------------------------------------------
// 18. Party Members
// ---------------------------------------------------------------------------

export const partyMembers = pgTable(
  "party_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    partyId: uuid("party_id")
      .notNull()
      .references(() => parties.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    joinedAt: timestamp("joined_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("party_members_party_user_uniq").on(
      table.partyId,
      table.userId,
    ),
    index("party_members_party_idx").on(table.partyId),
    index("party_members_user_idx").on(table.userId),
  ],
);

// ---------------------------------------------------------------------------
// 19. Guilds (persistent domain groups)
// ---------------------------------------------------------------------------

export const guilds = pgTable(
  "guilds",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    neighborhoodId: uuid("neighborhood_id")
      .notNull()
      .references(() => neighborhoods.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    domain: skillDomainEnum("domain").notNull(),
    description: text("description"),
    charter: text("charter"),
    charterSunsetAt: timestamp("charter_sunset_at", { withTimezone: true }),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    memberCount: integer("member_count").notNull().default(1),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("guilds_neighborhood_idx").on(table.neighborhoodId),
    index("guilds_domain_idx").on(table.domain),
    index("guilds_created_by_idx").on(table.createdBy),
  ],
);

// ---------------------------------------------------------------------------
// 20. Guild Members
// ---------------------------------------------------------------------------

export const guildMembers = pgTable(
  "guild_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    guildId: uuid("guild_id")
      .notNull()
      .references(() => guilds.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    role: guildRoleEnum("role").notNull().default("member"),
    stewardTermStart: timestamp("steward_term_start", { withTimezone: true }),
    consecutiveTerms: integer("consecutive_terms").notNull().default(0),
    joinedAt: timestamp("joined_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("guild_members_guild_user_uniq").on(
      table.guildId,
      table.userId,
    ),
    index("guild_members_guild_idx").on(table.guildId),
    index("guild_members_user_idx").on(table.userId),
    index("guild_members_role_idx").on(table.role),
  ],
);

// ---------------------------------------------------------------------------
// 21. Endorsements
// ---------------------------------------------------------------------------

export const endorsements = pgTable(
  "endorsements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fromUser: uuid("from_user")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    toUser: uuid("to_user")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    domain: skillDomainEnum("domain").notNull(),
    skill: text("skill"),
    message: text("message"),
    questId: uuid("quest_id").references(() => quests.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("endorsements_from_user_idx").on(table.fromUser),
    index("endorsements_to_user_idx").on(table.toUser),
    index("endorsements_domain_idx").on(table.domain),
    index("endorsements_quest_idx").on(table.questId),
  ],
);

// ---------------------------------------------------------------------------
// 22. Governance Proposals
// ---------------------------------------------------------------------------

export const governanceProposals = pgTable(
  "governance_proposals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    neighborhoodId: uuid("neighborhood_id")
      .notNull()
      .references(() => neighborhoods.id, { onDelete: "cascade" }),
    guildId: uuid("guild_id").references(() => guilds.id, {
      onDelete: "set null",
    }),
    authorId: uuid("author_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").notNull(),
    category: text("category").notNull(),
    status: proposalStatusEnum("status").notNull().default("draft"),
    voteType: voteTypeEnum("vote_type").notNull().default("quadratic"),
    votesFor: integer("votes_for").notNull().default(0),
    votesAgainst: integer("votes_against").notNull().default(0),
    quorum: integer("quorum").notNull().default(3),
    deliberationEndsAt: timestamp("deliberation_ends_at", {
      withTimezone: true,
    }),
    votingEndsAt: timestamp("voting_ends_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("governance_proposals_neighborhood_idx").on(table.neighborhoodId),
    index("governance_proposals_guild_idx").on(table.guildId),
    index("governance_proposals_author_idx").on(table.authorId),
    index("governance_proposals_status_idx").on(table.status),
    index("governance_proposals_category_idx").on(table.category),
  ],
);

// ---------------------------------------------------------------------------
// 23. Governance Votes
// ---------------------------------------------------------------------------

export const governanceVotes = pgTable(
  "governance_votes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    proposalId: uuid("proposal_id")
      .notNull()
      .references(() => governanceProposals.id, { onDelete: "cascade" }),
    voterId: uuid("voter_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    voteType: voteTypeEnum("vote_type").notNull(),
    // For quadratic: credits spent (N votes costs N^2 credits)
    creditsSpent: integer("credits_spent").notNull().default(1),
    // For quadratic: actual vote weight (sqrt of credits)
    voteWeight: real("vote_weight").notNull().default(1),
    // For liquid_delegate: who they're delegating to
    delegateToId: uuid("delegate_to_id").references(() => profiles.id, {
      onDelete: "set null",
    }),
    inFavor: boolean("in_favor").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("governance_votes_proposal_voter_uniq").on(
      table.proposalId,
      table.voterId,
    ),
    index("governance_votes_proposal_idx").on(table.proposalId),
    index("governance_votes_voter_idx").on(table.voterId),
  ],
);

// ---------------------------------------------------------------------------
// 24. Sunset Rules
// ---------------------------------------------------------------------------

export const sunsetRules = pgTable(
  "sunset_rules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    neighborhoodId: uuid("neighborhood_id")
      .notNull()
      .references(() => neighborhoods.id, { onDelete: "cascade" }),
    ruleType: sunsetRuleTypeEnum("rule_type").notNull(),
    resourceId: uuid("resource_id"),
    description: text("description").notNull(),
    enactedAt: timestamp("enacted_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    renewalCount: integer("renewal_count").notNull().default(0),
    lastRenewedAt: timestamp("last_renewed_at", { withTimezone: true }),
    renewalProposalId: uuid("renewal_proposal_id").references(
      () => governanceProposals.id,
      { onDelete: "set null" },
    ),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("sunset_rules_neighborhood_idx").on(table.neighborhoodId),
    index("sunset_rules_type_idx").on(table.ruleType),
    index("sunset_rules_expires_idx").on(table.expiresAt),
    index("sunset_rules_active_idx").on(table.active),
  ],
);

// ---------------------------------------------------------------------------
// 25. Federation Agreements (V5 placeholder, schema-ready)
// ---------------------------------------------------------------------------

export const federationAgreements = pgTable(
  "federation_agreements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    localNeighborhoodId: uuid("local_neighborhood_id")
      .notNull()
      .references(() => neighborhoods.id, { onDelete: "cascade" }),
    remoteInstanceUrl: text("remote_instance_url").notNull(),
    remoteNeighborhoodName: text("remote_neighborhood_name").notNull(),
    terms: text("terms"),
    active: boolean("active").notNull().default(true),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("federation_agreements_local_idx").on(table.localNeighborhoodId),
    index("federation_agreements_active_idx").on(table.active),
  ],
);

// ---------------------------------------------------------------------------
// Type Inference Helpers
// ---------------------------------------------------------------------------

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;

export type Neighborhood = typeof neighborhoods.$inferSelect;
export type NewNeighborhood = typeof neighborhoods.$inferInsert;

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;

export type PostPhoto = typeof postPhotos.$inferSelect;
export type NewPostPhoto = typeof postPhotos.$inferInsert;

export type Response = typeof responses.$inferSelect;
export type NewResponse = typeof responses.$inferInsert;

export type Thanks = typeof thanks.$inferSelect;
export type NewThanks = typeof thanks.$inferInsert;

export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;

export type MembershipRequest = typeof membershipRequests.$inferSelect;
export type NewMembershipRequest = typeof membershipRequests.$inferInsert;

export type AiMatch = typeof aiMatches.$inferSelect;
export type NewAiMatch = typeof aiMatches.$inferInsert;

export type AiUsage = typeof aiUsage.$inferSelect;
export type NewAiUsage = typeof aiUsage.$inferInsert;

export type UserConsent = typeof userConsents.$inferSelect;
export type NewUserConsent = typeof userConsents.$inferInsert;

export type AuditLogEntry = typeof auditLog.$inferSelect;
export type NewAuditLogEntry = typeof auditLog.$inferInsert;

export type DeletionRequest = typeof deletionRequests.$inferSelect;
export type NewDeletionRequest = typeof deletionRequests.$inferInsert;

export type PostFlag = typeof postFlags.$inferSelect;
export type NewPostFlag = typeof postFlags.$inferInsert;

// Ascendant types

export type Quest = typeof quests.$inferSelect;
export type NewQuest = typeof quests.$inferInsert;

export type QuestValidation = typeof questValidations.$inferSelect;
export type NewQuestValidation = typeof questValidations.$inferInsert;

export type SkillProgress = typeof skillProgress.$inferSelect;
export type NewSkillProgress = typeof skillProgress.$inferInsert;

export type Party = typeof parties.$inferSelect;
export type NewParty = typeof parties.$inferInsert;

export type PartyMember = typeof partyMembers.$inferSelect;
export type NewPartyMember = typeof partyMembers.$inferInsert;

export type Guild = typeof guilds.$inferSelect;
export type NewGuild = typeof guilds.$inferInsert;

export type GuildMember = typeof guildMembers.$inferSelect;
export type NewGuildMember = typeof guildMembers.$inferInsert;

export type Endorsement = typeof endorsements.$inferSelect;
export type NewEndorsement = typeof endorsements.$inferInsert;

export type GovernanceProposal = typeof governanceProposals.$inferSelect;
export type NewGovernanceProposal = typeof governanceProposals.$inferInsert;

export type GovernanceVote = typeof governanceVotes.$inferSelect;
export type NewGovernanceVote = typeof governanceVotes.$inferInsert;

export type SunsetRule = typeof sunsetRules.$inferSelect;
export type NewSunsetRule = typeof sunsetRules.$inferInsert;

export type FederationAgreement = typeof federationAgreements.$inferSelect;
export type NewFederationAgreement = typeof federationAgreements.$inferInsert;
