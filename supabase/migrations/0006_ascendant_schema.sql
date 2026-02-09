-- ============================================================================
-- CivicForge Ascendant: V2.5+ Schema Extension
-- Adds quests, skills, guilds, governance, endorsements, sunset rules,
-- federation agreements, and extends profiles with renown/privacy.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- New Enum Types
-- ---------------------------------------------------------------------------

CREATE TYPE quest_difficulty AS ENUM (
  'spark', 'ember', 'flame', 'blaze', 'inferno'
);

CREATE TYPE quest_validation_method AS ENUM (
  'self_report', 'peer_confirm', 'photo_and_peer',
  'community_vote', 'community_vote_and_evidence'
);

CREATE TYPE quest_status AS ENUM (
  'open', 'claimed', 'in_progress', 'pending_validation',
  'completed', 'expired', 'cancelled'
);

CREATE TYPE skill_domain AS ENUM (
  'craft', 'green', 'care', 'bridge', 'signal', 'hearth', 'weave'
);

CREATE TYPE guild_role AS ENUM ('member', 'steward');

CREATE TYPE proposal_status AS ENUM (
  'draft', 'deliberation', 'voting', 'passed', 'rejected', 'expired'
);

CREATE TYPE vote_type AS ENUM ('quadratic', 'approval', 'liquid_delegate');

CREATE TYPE privacy_tier AS ENUM ('ghost', 'quiet', 'open', 'mentor');

CREATE TYPE sunset_rule_type AS ENUM (
  'neighborhood_charter', 'guild_charter', 'tier_threshold',
  'federation_agreement', 'seasonal_quest_template',
  'reputation_multiplier', 'moderation_policy'
);

-- ---------------------------------------------------------------------------
-- Extend Profiles with Ascendant Fields
-- ---------------------------------------------------------------------------

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS renown_tier integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS renown_score integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS privacy_tier privacy_tier NOT NULL DEFAULT 'quiet';

CREATE INDEX IF NOT EXISTS profiles_renown_tier_idx ON profiles (renown_tier);

-- ---------------------------------------------------------------------------
-- Quests
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  neighborhood_id uuid NOT NULL REFERENCES neighborhoods(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  difficulty quest_difficulty NOT NULL DEFAULT 'spark',
  validation_method quest_validation_method NOT NULL DEFAULT 'self_report',
  status quest_status NOT NULL DEFAULT 'open',
  skill_domains text[] NOT NULL DEFAULT '{}',
  xp_reward integer NOT NULL DEFAULT 5,
  max_party_size integer NOT NULL DEFAULT 1,
  requested_by_other boolean NOT NULL DEFAULT false,
  validation_count integer NOT NULL DEFAULT 0,
  validation_threshold integer NOT NULL DEFAULT 1,
  is_emergency boolean NOT NULL DEFAULT false,
  is_seasonal boolean NOT NULL DEFAULT false,
  seasonal_template_id uuid,
  completed_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS quests_post_idx ON quests (post_id);
CREATE INDEX IF NOT EXISTS quests_neighborhood_idx ON quests (neighborhood_id);
CREATE INDEX IF NOT EXISTS quests_created_by_idx ON quests (created_by);
CREATE INDEX IF NOT EXISTS quests_status_idx ON quests (status);
CREATE INDEX IF NOT EXISTS quests_difficulty_idx ON quests (difficulty);
CREATE INDEX IF NOT EXISTS quests_created_at_idx ON quests (created_at);

ALTER TABLE quests ENABLE ROW LEVEL SECURITY;

-- Anyone in the neighborhood can view quests
CREATE POLICY quests_select ON quests FOR SELECT USING (
  neighborhood_id IN (
    SELECT neighborhood_id FROM profiles WHERE id = auth.uid()
  )
);

-- Tier 2+ can create quests in their own neighborhood
CREATE POLICY quests_insert ON quests FOR INSERT WITH CHECK (
  created_by = auth.uid()
  AND neighborhood_id IN (
    SELECT p.neighborhood_id FROM profiles p
    WHERE p.id = auth.uid() AND p.trust_tier >= 2
  )
);

-- Quest creator can update their own quests
CREATE POLICY quests_update ON quests FOR UPDATE USING (
  created_by = auth.uid()
);

-- Quest creator can delete their own quests
CREATE POLICY quests_delete ON quests FOR DELETE USING (
  created_by = auth.uid()
);

-- ---------------------------------------------------------------------------
-- Quest Validations
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS quest_validations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id uuid NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
  validator_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  approved boolean NOT NULL,
  message text,
  photo_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (quest_id, validator_id)
);

CREATE INDEX IF NOT EXISTS quest_validations_quest_idx ON quest_validations (quest_id);
CREATE INDEX IF NOT EXISTS quest_validations_validator_idx ON quest_validations (validator_id);

ALTER TABLE quest_validations ENABLE ROW LEVEL SECURITY;

CREATE POLICY quest_validations_select ON quest_validations FOR SELECT USING (
  quest_id IN (
    SELECT q.id FROM quests q WHERE q.neighborhood_id IN (
      SELECT neighborhood_id FROM profiles WHERE id = auth.uid()
    )
  )
);

CREATE POLICY quest_validations_insert ON quest_validations FOR INSERT WITH CHECK (
  validator_id = auth.uid()
);

-- ---------------------------------------------------------------------------
-- Skill Progress
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS skill_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  domain skill_domain NOT NULL,
  total_xp integer NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 0,
  quests_completed integer NOT NULL DEFAULT 0,
  last_quest_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, domain)
);

CREATE INDEX IF NOT EXISTS skill_progress_user_idx ON skill_progress (user_id);
CREATE INDEX IF NOT EXISTS skill_progress_domain_idx ON skill_progress (domain);
CREATE INDEX IF NOT EXISTS skill_progress_level_idx ON skill_progress (level);

ALTER TABLE skill_progress ENABLE ROW LEVEL SECURITY;

-- Users can see their own skill progress; others see if privacy allows
CREATE POLICY skill_progress_select_own ON skill_progress FOR SELECT USING (
  user_id = auth.uid()
);

CREATE POLICY skill_progress_select_public ON skill_progress FOR SELECT USING (
  user_id IN (
    SELECT id FROM profiles
    WHERE privacy_tier IN ('open', 'mentor')
    AND neighborhood_id IN (
      SELECT neighborhood_id FROM profiles WHERE id = auth.uid()
    )
  )
);

-- Only system (service role) updates skill progress
-- App-level code uses service client for XP awards

-- ---------------------------------------------------------------------------
-- Parties (ephemeral quest groups)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS parties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id uuid NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
  name text,
  created_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  disbanded boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS parties_quest_idx ON parties (quest_id);
CREATE INDEX IF NOT EXISTS parties_created_by_idx ON parties (created_by);

ALTER TABLE parties ENABLE ROW LEVEL SECURITY;

CREATE POLICY parties_select ON parties FOR SELECT USING (
  quest_id IN (
    SELECT q.id FROM quests q WHERE q.neighborhood_id IN (
      SELECT neighborhood_id FROM profiles WHERE id = auth.uid()
    )
  )
);

CREATE POLICY parties_insert ON parties FOR INSERT WITH CHECK (
  created_by = auth.uid()
);

CREATE POLICY parties_update ON parties FOR UPDATE USING (
  created_by = auth.uid()
);

-- ---------------------------------------------------------------------------
-- Party Members
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS party_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id uuid NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (party_id, user_id)
);

CREATE INDEX IF NOT EXISTS party_members_party_idx ON party_members (party_id);
CREATE INDEX IF NOT EXISTS party_members_user_idx ON party_members (user_id);

ALTER TABLE party_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY party_members_select ON party_members FOR SELECT USING (
  party_id IN (
    SELECT p.id FROM parties p
    JOIN quests q ON q.id = p.quest_id
    WHERE q.neighborhood_id IN (
      SELECT neighborhood_id FROM profiles WHERE id = auth.uid()
    )
  )
);

CREATE POLICY party_members_insert ON party_members FOR INSERT WITH CHECK (
  user_id = auth.uid()
);

CREATE POLICY party_members_delete ON party_members FOR DELETE USING (
  user_id = auth.uid()
);

-- ---------------------------------------------------------------------------
-- Guilds
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS guilds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  neighborhood_id uuid NOT NULL REFERENCES neighborhoods(id) ON DELETE CASCADE,
  name text NOT NULL,
  domain skill_domain NOT NULL,
  description text,
  charter text,
  charter_sunset_at timestamptz,
  created_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  member_count integer NOT NULL DEFAULT 1,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS guilds_neighborhood_idx ON guilds (neighborhood_id);
CREATE INDEX IF NOT EXISTS guilds_domain_idx ON guilds (domain);
CREATE INDEX IF NOT EXISTS guilds_created_by_idx ON guilds (created_by);

ALTER TABLE guilds ENABLE ROW LEVEL SECURITY;

CREATE POLICY guilds_select ON guilds FOR SELECT USING (
  neighborhood_id IN (
    SELECT neighborhood_id FROM profiles WHERE id = auth.uid()
  )
);

-- Only Pillar (renown_tier >= 3) can create guilds
CREATE POLICY guilds_insert ON guilds FOR INSERT WITH CHECK (
  created_by = auth.uid()
  AND neighborhood_id IN (
    SELECT p.neighborhood_id FROM profiles p
    WHERE p.id = auth.uid() AND p.renown_tier >= 3
  )
);

-- Stewards can update guild details
CREATE POLICY guilds_update ON guilds FOR UPDATE USING (
  id IN (
    SELECT gm.guild_id FROM guild_members gm
    WHERE gm.user_id = auth.uid() AND gm.role = 'steward'
  )
);

-- ---------------------------------------------------------------------------
-- Guild Members
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS guild_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id uuid NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role guild_role NOT NULL DEFAULT 'member',
  steward_term_start timestamptz,
  consecutive_terms integer NOT NULL DEFAULT 0,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (guild_id, user_id)
);

CREATE INDEX IF NOT EXISTS guild_members_guild_idx ON guild_members (guild_id);
CREATE INDEX IF NOT EXISTS guild_members_user_idx ON guild_members (user_id);
CREATE INDEX IF NOT EXISTS guild_members_role_idx ON guild_members (role);

ALTER TABLE guild_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY guild_members_select ON guild_members FOR SELECT USING (
  guild_id IN (
    SELECT g.id FROM guilds g WHERE g.neighborhood_id IN (
      SELECT neighborhood_id FROM profiles WHERE id = auth.uid()
    )
  )
);

CREATE POLICY guild_members_insert ON guild_members FOR INSERT WITH CHECK (
  user_id = auth.uid()
);

CREATE POLICY guild_members_update ON guild_members FOR UPDATE USING (
  -- Stewards can update member roles; members can leave
  user_id = auth.uid()
  OR guild_id IN (
    SELECT gm.guild_id FROM guild_members gm
    WHERE gm.user_id = auth.uid() AND gm.role = 'steward'
  )
);

CREATE POLICY guild_members_delete ON guild_members FOR DELETE USING (
  user_id = auth.uid()
);

-- ---------------------------------------------------------------------------
-- Endorsements
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS endorsements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  to_user uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  domain skill_domain NOT NULL,
  skill text,
  message text,
  quest_id uuid REFERENCES quests(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS endorsements_from_user_idx ON endorsements (from_user);
CREATE INDEX IF NOT EXISTS endorsements_to_user_idx ON endorsements (to_user);
CREATE INDEX IF NOT EXISTS endorsements_domain_idx ON endorsements (domain);
CREATE INDEX IF NOT EXISTS endorsements_quest_idx ON endorsements (quest_id);

ALTER TABLE endorsements ENABLE ROW LEVEL SECURITY;

CREATE POLICY endorsements_select ON endorsements FOR SELECT USING (
  to_user = auth.uid()
  OR from_user = auth.uid()
  OR to_user IN (
    SELECT id FROM profiles
    WHERE privacy_tier IN ('open', 'mentor')
    AND neighborhood_id IN (
      SELECT neighborhood_id FROM profiles WHERE id = auth.uid()
    )
  )
);

CREATE POLICY endorsements_insert ON endorsements FOR INSERT WITH CHECK (
  from_user = auth.uid()
  AND from_user != to_user
);

-- ---------------------------------------------------------------------------
-- Governance Proposals
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS governance_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  neighborhood_id uuid NOT NULL REFERENCES neighborhoods(id) ON DELETE CASCADE,
  guild_id uuid REFERENCES guilds(id) ON DELETE SET NULL,
  author_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  status proposal_status NOT NULL DEFAULT 'draft',
  vote_type vote_type NOT NULL DEFAULT 'quadratic',
  votes_for integer NOT NULL DEFAULT 0,
  votes_against integer NOT NULL DEFAULT 0,
  quorum integer NOT NULL DEFAULT 3,
  deliberation_ends_at timestamptz,
  voting_ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS governance_proposals_neighborhood_idx ON governance_proposals (neighborhood_id);
CREATE INDEX IF NOT EXISTS governance_proposals_guild_idx ON governance_proposals (guild_id);
CREATE INDEX IF NOT EXISTS governance_proposals_author_idx ON governance_proposals (author_id);
CREATE INDEX IF NOT EXISTS governance_proposals_status_idx ON governance_proposals (status);
CREATE INDEX IF NOT EXISTS governance_proposals_category_idx ON governance_proposals (category);

ALTER TABLE governance_proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY governance_proposals_select ON governance_proposals FOR SELECT USING (
  neighborhood_id IN (
    SELECT neighborhood_id FROM profiles WHERE id = auth.uid()
  )
);

-- Keeper (renown_tier >= 4) can create proposals
CREATE POLICY governance_proposals_insert ON governance_proposals FOR INSERT WITH CHECK (
  author_id = auth.uid()
  AND neighborhood_id IN (
    SELECT p.neighborhood_id FROM profiles p
    WHERE p.id = auth.uid() AND p.renown_tier >= 4
  )
);

CREATE POLICY governance_proposals_update ON governance_proposals FOR UPDATE USING (
  author_id = auth.uid()
);

-- ---------------------------------------------------------------------------
-- Governance Votes
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS governance_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid NOT NULL REFERENCES governance_proposals(id) ON DELETE CASCADE,
  voter_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vote_type vote_type NOT NULL,
  credits_spent integer NOT NULL DEFAULT 1,
  vote_weight real NOT NULL DEFAULT 1,
  delegate_to_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  in_favor boolean NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (proposal_id, voter_id)
);

CREATE INDEX IF NOT EXISTS governance_votes_proposal_idx ON governance_votes (proposal_id);
CREATE INDEX IF NOT EXISTS governance_votes_voter_idx ON governance_votes (voter_id);

ALTER TABLE governance_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY governance_votes_select ON governance_votes FOR SELECT USING (
  proposal_id IN (
    SELECT gp.id FROM governance_proposals gp
    WHERE gp.neighborhood_id IN (
      SELECT neighborhood_id FROM profiles WHERE id = auth.uid()
    )
  )
);

-- Neighbor (renown_tier >= 2) can vote
CREATE POLICY governance_votes_insert ON governance_votes FOR INSERT WITH CHECK (
  voter_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.renown_tier >= 2
  )
);

-- ---------------------------------------------------------------------------
-- Sunset Rules
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS sunset_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  neighborhood_id uuid NOT NULL REFERENCES neighborhoods(id) ON DELETE CASCADE,
  rule_type sunset_rule_type NOT NULL,
  resource_id uuid,
  description text NOT NULL,
  enacted_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  renewal_count integer NOT NULL DEFAULT 0,
  last_renewed_at timestamptz,
  renewal_proposal_id uuid REFERENCES governance_proposals(id) ON DELETE SET NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sunset_rules_neighborhood_idx ON sunset_rules (neighborhood_id);
CREATE INDEX IF NOT EXISTS sunset_rules_type_idx ON sunset_rules (rule_type);
CREATE INDEX IF NOT EXISTS sunset_rules_expires_idx ON sunset_rules (expires_at);
CREATE INDEX IF NOT EXISTS sunset_rules_active_idx ON sunset_rules (active);

ALTER TABLE sunset_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY sunset_rules_select ON sunset_rules FOR SELECT USING (
  neighborhood_id IN (
    SELECT neighborhood_id FROM profiles WHERE id = auth.uid()
  )
);

-- Only system / governance process creates sunset rules (service role)

-- ---------------------------------------------------------------------------
-- Federation Agreements (V5 placeholder)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS federation_agreements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  local_neighborhood_id uuid NOT NULL REFERENCES neighborhoods(id) ON DELETE CASCADE,
  remote_instance_url text NOT NULL,
  remote_neighborhood_name text NOT NULL,
  terms text,
  active boolean NOT NULL DEFAULT true,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS federation_agreements_local_idx ON federation_agreements (local_neighborhood_id);
CREATE INDEX IF NOT EXISTS federation_agreements_active_idx ON federation_agreements (active);

ALTER TABLE federation_agreements ENABLE ROW LEVEL SECURITY;

CREATE POLICY federation_agreements_select ON federation_agreements FOR SELECT USING (
  local_neighborhood_id IN (
    SELECT neighborhood_id FROM profiles WHERE id = auth.uid()
  )
);

-- Only Founders can manage federation agreements (via service role + auth check)

-- ---------------------------------------------------------------------------
-- Updated_at trigger for new tables
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER quests_updated_at
  BEFORE UPDATE ON quests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER skill_progress_updated_at
  BEFORE UPDATE ON skill_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER guilds_updated_at
  BEFORE UPDATE ON guilds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER governance_proposals_updated_at
  BEFORE UPDATE ON governance_proposals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
