-- CivicForge Production Content Cleanup
-- Removes ALL content from production, keeping only:
--   - Victor's auth user
--   - Victor's profile (reset to clean state)
--   - Wicks Landing community
--
-- Run AFTER cleanup-seed-data.sql via Supabase SQL Editor on PRODUCTION.
-- BEFORE RUNNING: Take a backup via Supabase Dashboard > Database > Backups

-- ============================================================================
-- PRE-CLEANUP VERIFICATION
-- Run this block first to see what exists
-- ============================================================================

SELECT 'profiles' as tbl, count(*) FROM profiles
UNION ALL SELECT 'communities', count(*) FROM communities
UNION ALL SELECT 'posts', count(*) FROM posts
UNION ALL SELECT 'quests', count(*) FROM quests
UNION ALL SELECT 'guilds', count(*) FROM guilds
UNION ALL SELECT 'responses', count(*) FROM responses
UNION ALL SELECT 'thanks', count(*) FROM thanks
UNION ALL SELECT 'endorsements', count(*) FROM endorsements
UNION ALL SELECT 'vouches', count(*) FROM vouches
UNION ALL SELECT 'governance_proposals', count(*) FROM governance_proposals
UNION ALL SELECT 'game_designs', count(*) FROM game_designs;

-- ============================================================================
-- CLEANUP (run after verifying counts above)
-- ============================================================================

BEGIN;

-- Temporarily disable FK constraint checking (requires service role)
SET session_replication_role = 'replica';

-- Phase 1: Leaf tables (no children depend on these)
DELETE FROM governance_votes;
DELETE FROM quest_validations;
DELETE FROM quest_narratives;
DELETE FROM party_members;
DELETE FROM guild_members;
DELETE FROM endorsements;
DELETE FROM vouches;
DELETE FROM vouch_usage;
DELETE FROM thanks;
DELETE FROM post_flags;
DELETE FROM post_interests;
DELETE FROM post_photos;
DELETE FROM completion_stories;
DELETE FROM responses;
DELETE FROM ai_matches;
DELETE FROM ai_usage;
DELETE FROM user_consents;
DELETE FROM skill_progress;
DELETE FROM audit_log;
DELETE FROM deletion_requests;

-- Phase 1b: Game Designer leaf tables
DELETE FROM game_recognition_sources;
DELETE FROM game_recognition_tiers;
DELETE FROM game_skill_domains;
DELETE FROM game_quest_types;

-- Phase 2: Mid-level tables
DELETE FROM membership_requests;
DELETE FROM invitations;
DELETE FROM parties;
DELETE FROM sunset_rules;
DELETE FROM governance_proposals;
DELETE FROM quests;
DELETE FROM guilds;
DELETE FROM federation_agreements;
DELETE FROM game_designs;
DELETE FROM game_templates;

-- Phase 3: Content tables
DELETE FROM posts;

-- Phase 4: Reset Victor's profile (keep auth user + community membership)
-- Set renown to tier 2 (Neighbor) with zeroed scores
UPDATE profiles
SET renown_tier = 2,
    renown_score = 0,
    reputation_score = 0,
    updated_at = now()
WHERE community_id IS NOT NULL;

-- Delete any orphan profiles (no community assigned — leftover test accounts)
-- Victor's profile has community_id set; others are leftover
DELETE FROM profiles WHERE community_id IS NULL;

-- Delete non-Wicks-Landing communities if any extras exist
-- First check: SELECT id, name FROM communities;
-- Uncomment and adjust the line below if needed:
-- DELETE FROM communities WHERE name NOT ILIKE '%Wicks Landing%';

-- Re-enable FK constraint checking
SET session_replication_role = 'origin';

COMMIT;

-- ============================================================================
-- POST-CLEANUP VERIFICATION
-- Expected: 1 profile, 1 community, 0 posts, 0 quests
-- ============================================================================

SELECT 'profiles' as tbl, count(*) FROM profiles
UNION ALL SELECT 'communities', count(*) FROM communities
UNION ALL SELECT 'posts', count(*) FROM posts
UNION ALL SELECT 'quests', count(*) FROM quests
UNION ALL SELECT 'guilds', count(*) FROM guilds
UNION ALL SELECT 'responses', count(*) FROM responses
UNION ALL SELECT 'game_designs', count(*) FROM game_designs;
