-- CivicForge Production Seed Data Cleanup
-- Run against production Supabase with service role key
-- All seeded data uses UUID prefix 00000000-0000-0000-XXXX-
--
-- BEFORE RUNNING: Take a backup via Supabase Dashboard → Database → Backups

-- ============================================================================
-- PRE-CLEANUP VERIFICATION
-- Run this first to confirm counts match expected seed data
-- ============================================================================

-- Expected: ~110 profiles, ~5 communities
-- If counts are unexpected, STOP and investigate before proceeding
SELECT 'profiles' as tbl, count(*) FROM profiles WHERE id::text LIKE '00000000-0000-0000-%'
UNION ALL
SELECT 'communities', count(*) FROM communities WHERE id::text LIKE '00000000-0000-0000-%'
UNION ALL
SELECT 'posts', count(*) FROM posts WHERE id::text LIKE '00000000-0000-0000-%'
UNION ALL
SELECT 'quests', count(*) FROM quests WHERE id::text LIKE '00000000-0000-0000-%'
UNION ALL
SELECT 'guilds', count(*) FROM guilds WHERE id::text LIKE '00000000-0000-0000-%';

-- ============================================================================
-- CLEANUP (run after verifying counts above)
-- ============================================================================

BEGIN;

-- Temporarily disable FK constraint checking (requires service role)
SET session_replication_role = 'replica';

-- Phase 1: Leaf tables (no children depend on these)
DELETE FROM governance_votes WHERE id::text LIKE '00000000-0000-0000-0019-%';
DELETE FROM post_flags WHERE id::text LIKE '00000000-0000-0000-0004-%';
DELETE FROM post_photos WHERE id::text LIKE '00000000-0000-0000-0005-%';
DELETE FROM responses WHERE id::text LIKE '00000000-0000-0000-0006-%';
DELETE FROM thanks WHERE id::text LIKE '00000000-0000-0000-0007-%';
DELETE FROM ai_matches WHERE id::text LIKE '00000000-0000-0000-000a-%';
DELETE FROM quest_validations WHERE id::text LIKE '00000000-0000-0000-0011-%';
DELETE FROM party_members WHERE id::text LIKE '00000000-0000-0000-0014-%';
DELETE FROM guild_members WHERE id::text LIKE '00000000-0000-0000-0016-%';
DELETE FROM endorsements WHERE id::text LIKE '00000000-0000-0000-0017-%';
DELETE FROM ai_usage WHERE id::text LIKE '00000000-0000-0000-000b-%';
DELETE FROM user_consents WHERE id::text LIKE '00000000-0000-0000-000c-%';
DELETE FROM skill_progress WHERE id::text LIKE '00000000-0000-0000-0012-%';
DELETE FROM deletion_requests WHERE id::text LIKE '00000000-0000-0000-000e-%';
DELETE FROM vouches WHERE id::text LIKE '00000000-0000-0000-001b-%';

-- Phase 2: Mid-level tables
DELETE FROM membership_requests WHERE id::text LIKE '00000000-0000-0000-0009-%';
DELETE FROM invitations WHERE id::text LIKE '00000000-0000-0000-0008-%';
DELETE FROM parties WHERE id::text LIKE '00000000-0000-0000-0013-%';
DELETE FROM sunset_rules WHERE id::text LIKE '00000000-0000-0000-001a-%';
DELETE FROM governance_proposals WHERE id::text LIKE '00000000-0000-0000-0018-%';
DELETE FROM quests WHERE id::text LIKE '00000000-0000-0000-0010-%';
DELETE FROM audit_log WHERE id::text LIKE '00000000-0000-0000-000d-%';
DELETE FROM guilds WHERE id::text LIKE '00000000-0000-0000-0015-%';
DELETE FROM federation_agreements WHERE id::text LIKE '00000000-0000-0000-001b-%';

-- Phase 3: Posts, then profiles, then communities
DELETE FROM posts WHERE id::text LIKE '00000000-0000-0000-0003-%';
DELETE FROM profiles WHERE id::text LIKE '00000000-0000-0000-0002-%';
DELETE FROM communities WHERE id::text LIKE '00000000-0000-0000-0001-%';

-- Re-enable FK constraint checking
SET session_replication_role = 'origin';

COMMIT;

-- ============================================================================
-- POST-CLEANUP VERIFICATION
-- All should return 0
-- ============================================================================

SELECT 'communities' as tbl, count(*) FROM communities WHERE id::text LIKE '00000000-0000-0000-%'
UNION ALL SELECT 'profiles', count(*) FROM profiles WHERE id::text LIKE '00000000-0000-0000-%'
UNION ALL SELECT 'posts', count(*) FROM posts WHERE id::text LIKE '00000000-0000-0000-%'
UNION ALL SELECT 'quests', count(*) FROM quests WHERE id::text LIKE '00000000-0000-0000-%'
UNION ALL SELECT 'guilds', count(*) FROM guilds WHERE id::text LIKE '00000000-0000-0000-%';
