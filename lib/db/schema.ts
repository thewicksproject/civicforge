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
    trustTier: integer("trust_tier").notNull().default(1),
    phoneVerified: boolean("phone_verified").notNull().default(false),
    avatarUrl: text("avatar_url"),
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
    index("profiles_trust_tier_idx").on(table.trustTier),
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
