-- Migration 0010: Rename "neighborhood" -> "community" across the schema
--
-- PostgreSQL stores RLS policy expressions as parsed trees referencing
-- columns/tables by OID, not by name. ALTER TABLE RENAME and
-- ALTER TABLE RENAME COLUMN do NOT break existing RLS policies.
-- Only SQL function bodies (stored as text) need explicit recreation.

-- =========================================================================
-- 1a. Rename table
-- =========================================================================
ALTER TABLE neighborhoods RENAME TO communities;

-- =========================================================================
-- 1b. Rename columns (10 tables)
-- =========================================================================
ALTER TABLE profiles RENAME COLUMN neighborhood_id TO community_id;
ALTER TABLE posts RENAME COLUMN neighborhood_id TO community_id;
ALTER TABLE invitations RENAME COLUMN neighborhood_id TO community_id;
ALTER TABLE membership_requests RENAME COLUMN neighborhood_id TO community_id;
ALTER TABLE quests RENAME COLUMN neighborhood_id TO community_id;
ALTER TABLE guilds RENAME COLUMN neighborhood_id TO community_id;
ALTER TABLE governance_proposals RENAME COLUMN neighborhood_id TO community_id;
ALTER TABLE sunset_rules RENAME COLUMN neighborhood_id TO community_id;
ALTER TABLE federation_agreements RENAME COLUMN local_neighborhood_id TO local_community_id;
ALTER TABLE federation_agreements RENAME COLUMN remote_neighborhood_name TO remote_community_name;

-- =========================================================================
-- 1c. Rename indexes
-- =========================================================================
ALTER INDEX neighborhoods_city_state_idx RENAME TO communities_city_state_idx;
ALTER INDEX profiles_neighborhood_idx RENAME TO profiles_community_idx;
ALTER INDEX posts_neighborhood_idx RENAME TO posts_community_idx;
ALTER INDEX invitations_neighborhood_idx RENAME TO invitations_community_idx;
ALTER INDEX membership_requests_neighborhood_idx RENAME TO membership_requests_community_idx;
ALTER INDEX quests_neighborhood_idx RENAME TO quests_community_idx;
-- 0008 added a compound index
ALTER INDEX quests_neighborhood_status_idx RENAME TO quests_community_status_idx;
-- These indexes may not exist on all environments (created by Drizzle push, not migrations)
DO $$ BEGIN ALTER INDEX guilds_neighborhood_idx RENAME TO guilds_community_idx; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN ALTER INDEX governance_proposals_neighborhood_idx RENAME TO governance_proposals_community_idx; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN ALTER INDEX sunset_rules_neighborhood_idx RENAME TO sunset_rules_community_idx; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN ALTER INDEX federation_agreements_local_idx RENAME TO federation_agreements_local_community_idx; EXCEPTION WHEN undefined_table THEN NULL; END $$;

-- =========================================================================
-- 1d. Rename + update function
-- =========================================================================
ALTER FUNCTION get_user_neighborhood_id() RENAME TO get_user_community_id;

CREATE OR REPLACE FUNCTION get_user_community_id()
RETURNS uuid AS $$
  SELECT community_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- =========================================================================
-- 1e. Rename enum value
-- =========================================================================
ALTER TYPE sunset_rule_type RENAME VALUE 'neighborhood_charter' TO 'community_charter';

-- =========================================================================
-- 1f. Rename RLS policies (cosmetic — the expressions still work via OIDs)
-- =========================================================================

-- Policy names vary between environments; wrap in safe exception handlers
DO $$ BEGIN ALTER POLICY profiles_select_same_neighborhood ON profiles RENAME TO profiles_select_same_community; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN ALTER POLICY neighborhoods_select_authenticated ON communities RENAME TO communities_select_authenticated; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN ALTER POLICY neighborhoods_update_creator ON communities RENAME TO communities_update_creator; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN ALTER POLICY neighborhoods_insert_owner_no_existing ON communities RENAME TO communities_insert_owner_no_existing; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN ALTER POLICY posts_select_neighborhood ON posts RENAME TO posts_select_community; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN ALTER POLICY invitations_select_neighborhood ON invitations RENAME TO invitations_select_community; EXCEPTION WHEN undefined_object THEN NULL; END $$;

-- =========================================================================
-- 1g. PostgREST schema cache reload
-- =========================================================================
NOTIFY pgrst, 'reload schema';
