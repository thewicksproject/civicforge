/**
 * CivicForge Dev — Test User Setup
 *
 * Creates/manages 4 test users at different renown tiers on the dev Supabase.
 * Generates magic links for browser-based E2E testing.
 *
 * Usage:
 *   npm run test:setup      Create users + profiles + magic links
 *   npm run test:relogin    Generate fresh magic links for existing users
 *   npm run test:teardown   Remove all test user data + auth users
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

interface TestUser {
  key: string;
  displayName: string;
  email: string;
  bio: string;
  skills: string[];
  renownTier: number;
  renownScore: number;
  communityMember: boolean; // false = Ava (no community)
  privacyTier: "ghost" | "quiet" | "open" | "mentor";
}

const TEST_USERS: TestUser[] = [
  {
    key: "victor",
    displayName: "Victor (dev)",
    email: "victor-dev@civicforge.org",
    bio: "Dev test account — Keeper tier. Governance, validation, vouching.",
    skills: ["coordination", "technology", "governance"],
    renownTier: 4,
    renownScore: 200,
    communityMember: true,
    privacyTier: "open",
  },
  {
    key: "stella",
    displayName: "Stella Park",
    email: "stella-dev@civicforge.org",
    bio: "Neighbor tier — posts, responses, quests, gardening enthusiast.",
    skills: ["gardening", "cooking", "tutoring"],
    renownTier: 2,
    renownScore: 25,
    communityMember: true,
    privacyTier: "quiet",
  },
  {
    key: "marco",
    displayName: "Marco Reyes",
    email: "marco-dev@civicforge.org",
    bio: "Pillar tier — guilds, vouching, moderation, neighborhood handyman.",
    skills: ["home repair", "woodworking", "mentoring"],
    renownTier: 3,
    renownScore: 75,
    communityMember: true,
    privacyTier: "open",
  },
  {
    key: "ava",
    displayName: "Ava Moreno",
    email: "ava-dev@civicforge.org",
    bio: "Newcomer — invite/join flow testing.",
    skills: ["translation", "event planning"],
    renownTier: 1,
    renownScore: 0,
    communityMember: false,
    privacyTier: "quiet",
  },
];

// ---------------------------------------------------------------------------
// Env loading (no Next.js — read .env.local manually)
// ---------------------------------------------------------------------------

function loadEnv(): { supabaseUrl: string; serviceRoleKey: string; appUrl: string } {
  // Try .env.local first, then .env (which may be a 1Password named pipe)
  const candidates = [
    resolve(process.cwd(), ".env.local"),
    resolve(process.cwd(), ".env"),
  ];

  let envContent = "";
  for (const envPath of candidates) {
    try {
      const content = readFileSync(envPath, "utf-8");
      envContent += content + "\n";
    } catch {
      // Skip missing files
    }
  }

  if (!envContent.trim()) {
    console.error("Could not read .env.local or .env — make sure one exists in the project root.");
    process.exit(1);
  }

  const vars: Record<string, string> = {};
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    // Strip surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    vars[key] = value;
  }

  const supabaseUrl = vars["NEXT_PUBLIC_SUPABASE_URL"];
  const serviceRoleKey = vars["SUPABASE_SERVICE_ROLE_KEY"];
  const appUrl = vars["NEXT_PUBLIC_APP_URL"] || "http://localhost:3000";

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }

  return { supabaseUrl, serviceRoleKey, appUrl };
}

// ---------------------------------------------------------------------------
// Supabase admin client
// ---------------------------------------------------------------------------

function createAdminClient(supabaseUrl: string, serviceRoleKey: string) {
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ---------------------------------------------------------------------------
// Community bootstrap
// ---------------------------------------------------------------------------

async function ensureWicksLanding(
  supabase: ReturnType<typeof createClient>,
  founderUserId: string
): Promise<string> {
  // Look for existing
  const { data: existing } = await supabase
    .from("communities")
    .select("id")
    .ilike("name", "%Wicks%Landing%")
    .maybeSingle();

  if (existing) return existing.id;

  // Create it
  const { data: created, error } = await supabase
    .from("communities")
    .insert({
      name: "Wicks Landing",
      city: "Carmel",
      state: "IN",
      zip_codes: ["46032"],
      created_by: founderUserId,
    })
    .select("id")
    .single();

  if (error || !created) {
    console.error("Failed to create Wicks Landing community:", error?.message);
    process.exit(1);
  }

  console.log("  Created Wicks Landing community:", created.id);
  return created.id;
}

// ---------------------------------------------------------------------------
// Wait for profile trigger
// ---------------------------------------------------------------------------

async function waitForProfile(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  maxAttempts = 10
): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (data) return true;
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

// ---------------------------------------------------------------------------
// Magic link generation
// ---------------------------------------------------------------------------

async function generateMagicLink(
  supabase: ReturnType<typeof createClient>,
  email: string,
  appUrl: string
): Promise<string | null> {
  const { data, error } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: {
      redirectTo: `${appUrl}/api/auth/callback?next=/board`,
    },
  });

  if (error) {
    console.error(`  Failed to generate magic link for ${email}:`, error.message);
    return null;
  }

  return data.properties.action_link;
}

// ---------------------------------------------------------------------------
// --setup: Create users, profiles, magic links
// ---------------------------------------------------------------------------

async function setupUsers() {
  const { supabaseUrl, serviceRoleKey, appUrl } = loadEnv();
  const supabase = createAdminClient(supabaseUrl, serviceRoleKey);

  console.log("\n  Setting up test users on:", supabaseUrl);
  console.log();

  // Step 1: Create auth users (idempotent)
  const userIds: Record<string, string> = {};

  for (const user of TEST_USERS) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      email_confirm: true,
      user_metadata: { display_name: user.displayName },
    });

    if (error) {
      if (error.message.includes("already been registered") || error.message.includes("already exists")) {
        // Look up existing user
        const { data: listData } = await supabase.auth.admin.listUsers();
        const existing = listData?.users?.find((u) => u.email === user.email);
        if (existing) {
          userIds[user.key] = existing.id;
          console.log(`  ${user.displayName}: exists (${existing.id.slice(0, 8)}...)`);
          continue;
        }
      }
      console.error(`  Failed to create ${user.displayName}:`, error.message);
      process.exit(1);
    }

    if (data.user) {
      userIds[user.key] = data.user.id;
      console.log(`  ${user.displayName}: created (${data.user.id.slice(0, 8)}...)`);
    }
  }

  // Step 2: Wait for profile triggers to fire
  console.log("\n  Waiting for profile triggers...");
  for (const user of TEST_USERS) {
    const userId = userIds[user.key];
    if (!userId) continue;
    const found = await waitForProfile(supabase, userId);
    if (!found) {
      console.error(`  Profile trigger did not fire for ${user.displayName} — creating manually`);
      await supabase.from("profiles").insert({
        id: userId,
        display_name: user.displayName,
        skills: user.skills,
      });
    }
  }

  // Step 3: Ensure Wicks Landing exists (use first user as founder)
  const victorId = userIds["victor"];
  if (!victorId) {
    console.error("  Victor user not found — cannot create community");
    process.exit(1);
  }
  const communityId = await ensureWicksLanding(supabase, victorId);
  console.log("  Wicks Landing community:", communityId.slice(0, 8) + "...");

  // Step 4: Update profiles with correct tiers, scores, community
  console.log("\n  Updating profiles...");
  for (const user of TEST_USERS) {
    const userId = userIds[user.key];
    if (!userId) continue;

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: user.displayName,
        bio: user.bio,
        skills: user.skills,
        renown_tier: user.renownTier,
        renown_score: user.renownScore,
        reputation_score: user.renownScore,
        community_id: user.communityMember ? communityId : null,
        privacy_tier: user.privacyTier,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      console.error(`  Failed to update ${user.displayName}:`, error.message);
    } else {
      console.log(`  ${user.displayName}: T${user.renownTier} / ${user.renownScore} renown`);
    }
  }

  // Step 5: Generate magic links
  console.log();
  const links: Record<string, string> = {};
  for (const user of TEST_USERS) {
    const link = await generateMagicLink(supabase, user.email, appUrl);
    if (link) links[user.key] = link;
  }

  // Print summary
  printSummary(links, communityId);
}

// ---------------------------------------------------------------------------
// --relogin: Fresh magic links for existing users
// ---------------------------------------------------------------------------

async function reloginUsers() {
  const { supabaseUrl, serviceRoleKey, appUrl } = loadEnv();
  const supabase = createAdminClient(supabaseUrl, serviceRoleKey);

  console.log("\n  Generating fresh magic links...\n");

  const links: Record<string, string> = {};
  for (const user of TEST_USERS) {
    const link = await generateMagicLink(supabase, user.email, appUrl);
    if (link) {
      links[user.key] = link;
      console.log(`  ${user.displayName}: link generated`);
    }
  }

  // Get community ID for display
  const { data: community } = await supabase
    .from("communities")
    .select("id")
    .ilike("name", "%Wicks%Landing%")
    .maybeSingle();

  printSummary(links, community?.id ?? "(unknown)");
}

// ---------------------------------------------------------------------------
// --teardown: Remove all test user data + auth users
// ---------------------------------------------------------------------------

async function teardownUsers() {
  const { supabaseUrl, serviceRoleKey } = loadEnv();
  const supabase = createAdminClient(supabaseUrl, serviceRoleKey);

  console.log("\n  Tearing down test users on:", supabaseUrl);
  console.log();

  // Collect user IDs
  const userIds: string[] = [];
  for (const user of TEST_USERS) {
    const { data: listData } = await supabase.auth.admin.listUsers();
    const existing = listData?.users?.find((u) => u.email === user.email);
    if (existing) {
      userIds.push(existing.id);
      console.log(`  Found ${user.displayName}: ${existing.id.slice(0, 8)}...`);
    } else {
      console.log(`  ${user.displayName}: not found (skipping)`);
    }
  }

  if (userIds.length === 0) {
    console.log("\n  No test users found. Nothing to tear down.");
    return;
  }

  // Delete from leaf tables first (same order as cleanup-seed-data.sql)
  const leafTables = [
    "governance_votes",
    "quest_validations",
    "quest_narratives",
    "party_members",
    "guild_members",
    "endorsements",
    "vouches",
    "vouch_usage",
    "thanks",
    "post_flags",
    "post_interests",
    "post_photos",
    "completion_stories",
    "responses",
    "ai_matches",
    "ai_usage",
    "user_consents",
    "skill_progress",
    "audit_log",
    "deletion_requests",
  ];

  // Tables with user FK columns that aren't just "user_id"
  const userFkMap: Record<string, string[]> = {
    thanks: ["from_user", "to_user"],
    endorsements: ["from_user", "to_user"],
    vouches: ["from_user", "to_user"],
    posts: ["author_id"],
    quests: ["created_by"],
    guilds: ["created_by"],
    governance_proposals: ["author_id"],
    governance_votes: ["voter_id"],
    quest_validations: ["validator_id"],
    party_members: ["user_id"],
    guild_members: ["user_id"],
    responses: ["responder_id"],
    post_flags: ["user_id"],
    post_interests: ["user_id"],
    post_photos: ["uploaded_by"],
    completion_stories: ["author_id"],
    ai_matches: ["suggested_user_id"],
    quest_narratives: ["user_id"],
    invitations: ["created_by"],
    membership_requests: ["user_id"],
    parties: ["created_by"],
  };

  console.log("\n  Cleaning leaf tables...");
  for (const table of leafTables) {
    const fkCols = userFkMap[table] || ["user_id"];
    for (const col of fkCols) {
      const { error } = await supabase.from(table).delete().in(col, userIds);
      if (error && !error.message.includes("0 rows")) {
        console.error(`  ${table}.${col}: ${error.message}`);
      }
    }
  }

  // Mid-level tables
  console.log("  Cleaning mid-level tables...");
  const midTables = [
    "membership_requests",
    "invitations",
    "parties",
    "governance_proposals",
    "quests",
    "guilds",
  ];
  for (const table of midTables) {
    const fkCols = userFkMap[table] || ["user_id"];
    for (const col of fkCols) {
      const { error } = await supabase.from(table).delete().in(col, userIds);
      if (error && !error.message.includes("0 rows")) {
        console.error(`  ${table}.${col}: ${error.message}`);
      }
    }
  }

  // Posts
  console.log("  Cleaning posts...");
  await supabase.from("posts").delete().in("author_id", userIds);

  // Profiles
  console.log("  Cleaning profiles...");
  await supabase.from("profiles").delete().in("id", userIds);

  // Auth users
  console.log("  Deleting auth users...");
  for (const userId of userIds) {
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) {
      console.error(`  auth.deleteUser(${userId.slice(0, 8)}...): ${error.message}`);
    }
  }

  // Clean up Wicks Landing community if no profiles remain
  const { data: remainingProfiles } = await supabase
    .from("profiles")
    .select("id")
    .not("community_id", "is", null)
    .limit(1);

  if (!remainingProfiles || remainingProfiles.length === 0) {
    console.log("  No remaining community members — removing Wicks Landing...");
    await supabase.from("communities").delete().ilike("name", "%Wicks%Landing%");
  }

  console.log("\n  Teardown complete.\n");
}

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------

function printSummary(links: Record<string, string>, communityId: string) {
  const line = "=".repeat(70);
  const dash = "-".repeat(70);

  console.log(`\n${line}`);
  console.log(" CivicForge Dev — Test Users Ready");
  console.log(line);
  console.log(" User            Tier  Community       Email");
  console.log(` ${"-".repeat(15)} ${"-".repeat(4)}  ${"-".repeat(14)} ${"-".repeat(30)}`);

  for (const user of TEST_USERS) {
    const community = user.communityMember ? "Wicks Landing" : "(none)";
    const name = user.displayName.padEnd(15);
    const tier = `T${user.renownTier}`.padEnd(4);
    const comm = community.padEnd(14);
    console.log(` ${name} ${tier}  ${comm} ${user.email}`);
  }

  console.log(line);
  console.log();
  console.log(" Magic Links (valid ~1 hour, run npm run test:relogin for fresh ones):");
  console.log();

  for (const user of TEST_USERS) {
    const link = links[user.key];
    if (link) {
      console.log(` ${user.displayName}:`);
      console.log(`   ${link}`);
      console.log();
    }
  }

  console.log(dash);
  console.log(" Open each in a separate browser profile/window.");
  console.log(" Run `npm run dev` first.");
  if (communityId && communityId !== "(unknown)") {
    console.log(` Community ID: ${communityId}`);
  }
  console.log(line);
  console.log();
}

// ---------------------------------------------------------------------------
// CLI dispatch
// ---------------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case "--setup":
      await setupUsers();
      break;
    case "--relogin":
      await reloginUsers();
      break;
    case "--teardown":
      await teardownUsers();
      break;
    default:
      console.log(`
  Usage:
    npm run test:setup      Create test users + profiles + magic links
    npm run test:relogin    Generate fresh magic links for existing users
    npm run test:teardown   Remove all test user data + auth users
      `);
      process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
