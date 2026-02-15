-- ============================================================================
-- CivicForge: Pillar Vouching Requirement
-- Adds vouches table, vouch_usage rate-limiting, and caps increment_renown
-- at Tier 2. Tier 3+ promotion now requires app-side vouch checks.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Vouches table (one vouch per user pair, non-revocable)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS vouches (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user   uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  to_user     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  community_id uuid NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  message     text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT vouches_from_to_uniq UNIQUE (from_user, to_user),
  CONSTRAINT vouches_no_self CHECK (from_user <> to_user)
);

CREATE INDEX IF NOT EXISTS vouches_from_user_idx ON vouches(from_user);
CREATE INDEX IF NOT EXISTS vouches_to_user_idx ON vouches(to_user);
CREATE INDEX IF NOT EXISTS vouches_community_idx ON vouches(community_id);

-- ---------------------------------------------------------------------------
-- 2. Vouch usage (rate limiting: max 10 vouches per Pillar per calendar month)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS vouch_usage (
  user_id  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  month    date NOT NULL,
  count    integer NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, month)
);

-- ---------------------------------------------------------------------------
-- 3. RLS for vouches
-- ---------------------------------------------------------------------------

ALTER TABLE vouches ENABLE ROW LEVEL SECURITY;

-- Anyone in the same community can see vouches
DROP POLICY IF EXISTS vouches_select ON vouches;
CREATE POLICY vouches_select ON vouches
  FOR SELECT
  USING (
    community_id IN (
      SELECT community_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Insert: must be the from_user, must be Tier 3+, same community as target
DROP POLICY IF EXISTS vouches_insert ON vouches;
CREATE POLICY vouches_insert ON vouches
  FOR INSERT
  WITH CHECK (
    from_user = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND renown_tier >= 3
        AND community_id = vouches.community_id
    )
  );

-- Vouches are non-revocable: no UPDATE or DELETE policies

-- ---------------------------------------------------------------------------
-- 4. RLS for vouch_usage
-- ---------------------------------------------------------------------------

ALTER TABLE vouch_usage ENABLE ROW LEVEL SECURITY;

-- Users can only see/modify their own usage
DROP POLICY IF EXISTS vouch_usage_select ON vouch_usage;
CREATE POLICY vouch_usage_select ON vouch_usage
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS vouch_usage_insert ON vouch_usage;
CREATE POLICY vouch_usage_insert ON vouch_usage
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS vouch_usage_update ON vouch_usage;
CREATE POLICY vouch_usage_update ON vouch_usage
  FOR UPDATE USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 5. Modify increment_renown: cap auto-promotion at Tier 2
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION increment_renown(p_user_id uuid, p_amount numeric)
RETURNS void AS $$
DECLARE
  new_score integer;
BEGIN
  -- Guard: only positive increments (renown is never punitive)
  IF p_amount <= 0 THEN
    RETURN;
  END IF;

  UPDATE profiles
  SET renown_score = renown_score + ROUND(p_amount)
  WHERE id = p_user_id
  RETURNING renown_score INTO new_score;

  -- Auto-promote to Tier 2 only. Tier 3+ requires vouching (app-side).
  UPDATE profiles
  SET renown_tier = GREATEST(renown_tier, 2)
  WHERE id = p_user_id
    AND renown_tier < 2;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ---------------------------------------------------------------------------
-- 6. Helper: check_and_promote_tier3
--    Called app-side after a vouch is recorded.
--    Promotes to Tier 3 if score >= 50 AND vouch count >= 2.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION check_and_promote_tier3(p_user_id uuid)
RETURNS boolean AS $$
DECLARE
  v_score integer;
  v_tier integer;
  v_vouch_count integer;
BEGIN
  SELECT renown_score, renown_tier INTO v_score, v_tier
  FROM profiles WHERE id = p_user_id;

  -- Already Tier 3+, nothing to do
  IF v_tier >= 3 THEN
    RETURN false;
  END IF;

  -- Score must meet threshold
  IF v_score < 50 THEN
    RETURN false;
  END IF;

  -- Count vouches for this user
  SELECT COUNT(*) INTO v_vouch_count
  FROM vouches WHERE to_user = p_user_id;

  IF v_vouch_count >= 2 THEN
    UPDATE profiles
    SET renown_tier = 3
    WHERE id = p_user_id AND renown_tier = 2;
    RETURN true;
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
