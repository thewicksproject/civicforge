-- ============================================================================
-- CivicForge Ascendant: increment_renown RPC + tier auto-promotion
-- ============================================================================

-- Increment renown score and auto-promote tier when thresholds are crossed.
-- Renown never decreases via this function (amount must be positive).
-- Tier thresholds: 2=0, 3=50, 4=200, 5=500
CREATE OR REPLACE FUNCTION increment_renown(p_user_id uuid, p_amount numeric)
RETURNS void AS $$
DECLARE
  new_score integer;
  new_tier integer;
BEGIN
  -- Guard: only positive increments (renown is never punitive)
  IF p_amount <= 0 THEN
    RETURN;
  END IF;

  UPDATE profiles
  SET renown_score = renown_score + ROUND(p_amount)
  WHERE id = p_user_id
  RETURNING renown_score INTO new_score;

  -- Auto-promote tier based on thresholds
  -- Note: tier requirements beyond score (time, vouching) are enforced app-side.
  -- This handles the score-based component only.
  IF new_score >= 500 THEN
    new_tier := 5;
  ELSIF new_score >= 200 THEN
    new_tier := 4;
  ELSIF new_score >= 50 THEN
    new_tier := 3;
  ELSIF new_score >= 0 THEN
    new_tier := 2;
  ELSE
    new_tier := 1;
  END IF;

  -- Only promote, never demote via this function
  UPDATE profiles
  SET renown_tier = GREATEST(renown_tier, new_tier)
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
