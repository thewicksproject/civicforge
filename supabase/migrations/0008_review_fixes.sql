-- ============================================================================
-- CivicForge Ascendant: Review Fixes Migration
-- Atomic RPCs, RLS hardening, triggers, constraints, index improvements
-- ============================================================================

-- ---------------------------------------------------------------------------
-- C8 + W15. Atomic increment_renown with SET search_path
-- Replace existing function to set both renown_score and renown_tier atomically
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION increment_renown(p_user_id uuid, p_amount numeric)
RETURNS void AS $$
DECLARE
  new_score integer;
  new_tier integer;
BEGIN
  IF p_amount <= 0 THEN
    RETURN;
  END IF;

  UPDATE profiles
  SET
    renown_score = renown_score + ROUND(p_amount),
    renown_tier = GREATEST(renown_tier, CASE
      WHEN renown_score + ROUND(p_amount) >= 500 THEN 5
      WHEN renown_score + ROUND(p_amount) >= 200 THEN 4
      WHEN renown_score + ROUND(p_amount) >= 50 THEN 3
      ELSE 2
    END)
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ---------------------------------------------------------------------------
-- C6. Atomic increment_quest_validation RPC
-- Returns new count, threshold, and whether quest should complete
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION increment_quest_validation(p_quest_id uuid)
RETURNS TABLE(new_count integer, threshold integer, quest_status quest_status) AS $$
BEGIN
  RETURN QUERY
  UPDATE quests
  SET validation_count = validation_count + 1
  WHERE id = p_quest_id
  RETURNING
    quests.validation_count,
    quests.validation_threshold,
    quests.status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ---------------------------------------------------------------------------
-- C7. Atomic increment_proposal_votes RPC
-- Increments for/against tallies atomically
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION increment_proposal_votes(
  p_proposal_id uuid,
  p_for_delta integer,
  p_against_delta integer
)
RETURNS void AS $$
BEGIN
  UPDATE governance_proposals
  SET
    votes_for = votes_for + p_for_delta,
    votes_against = votes_against + p_against_delta
  WHERE id = p_proposal_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ---------------------------------------------------------------------------
-- W5. Guild member_count trigger (replaces manual read-modify-write)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_guild_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE guilds SET member_count = member_count + 1 WHERE id = NEW.guild_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE guilds SET member_count = GREATEST(0, member_count - 1) WHERE id = OLD.guild_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER guild_members_count_trigger
  AFTER INSERT OR DELETE ON guild_members
  FOR EACH ROW EXECUTE FUNCTION update_guild_member_count();

-- ---------------------------------------------------------------------------
-- W7. Endorsement uniqueness constraint
-- Prevents duplicate endorsements for same (from, to, domain) tuple
-- ---------------------------------------------------------------------------

ALTER TABLE endorsements ADD CONSTRAINT endorsements_unique_from_to_domain
  UNIQUE (from_user, to_user, domain);

-- ---------------------------------------------------------------------------
-- W9. Restrict guild_members UPDATE policy
-- Drop overly permissive policy. Replace with two targeted policies:
-- 1. Self-update: members can update own row (but not role)
-- 2. Steward-update: stewards can change roles of others (not self)
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS guild_members_update ON guild_members;

CREATE POLICY guild_members_self_update ON guild_members FOR UPDATE USING (
  user_id = auth.uid()
) WITH CHECK (
  user_id = auth.uid()
  AND role = (SELECT gm.role FROM guild_members gm WHERE gm.id = guild_members.id)
);

CREATE POLICY guild_members_steward_update ON guild_members FOR UPDATE USING (
  user_id != auth.uid()
  AND guild_id IN (
    SELECT gm.guild_id FROM guild_members gm
    WHERE gm.user_id = auth.uid() AND gm.role = 'steward'
  )
);

-- ---------------------------------------------------------------------------
-- W16. Document service-role-only tables
-- ---------------------------------------------------------------------------

COMMENT ON TABLE skill_progress IS
  'Skill XP and level progression per user per domain. Updated via service role only (awardQuestXp). RLS allows read for own + public profiles.';

COMMENT ON TABLE sunset_rules IS
  'Expiration rules for charters, agreements, and policies. Created via service role during governance actions. Read-only for neighborhood members.';

COMMENT ON TABLE federation_agreements IS
  'Cross-neighborhood federation agreements (V5 placeholder). Managed via service role by Founders. Read-only for local neighborhood members.';

-- ---------------------------------------------------------------------------
-- W17. Quest validations RLS: neighborhood scope + tier gating
-- Drop current insert policy and recreate with neighborhood + renown checks
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS quest_validations_insert ON quest_validations;

CREATE POLICY quest_validations_insert ON quest_validations FOR INSERT WITH CHECK (
  validator_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.renown_tier >= 2
    AND p.neighborhood_id IN (
      SELECT q.neighborhood_id FROM quests q WHERE q.id = quest_validations.quest_id
    )
  )
);

-- ---------------------------------------------------------------------------
-- M4. skill_domains text[] -> skill_domain[] (proper enum array)
-- ---------------------------------------------------------------------------

ALTER TABLE quests ALTER COLUMN skill_domains
  TYPE skill_domain[] USING skill_domains::skill_domain[];

-- ---------------------------------------------------------------------------
-- M5. Composite index for common quest listing query
-- ---------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS quests_neighborhood_status_idx
  ON quests (neighborhood_id, status, created_at DESC);

-- ---------------------------------------------------------------------------
-- RLS fix: quests_insert trust_tier -> renown_tier
-- The original policy used trust_tier; should use renown_tier
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS quests_insert ON quests;

CREATE POLICY quests_insert ON quests FOR INSERT WITH CHECK (
  created_by = auth.uid()
  AND neighborhood_id IN (
    SELECT p.neighborhood_id FROM profiles p
    WHERE p.id = auth.uid() AND p.renown_tier >= 2
  )
);
