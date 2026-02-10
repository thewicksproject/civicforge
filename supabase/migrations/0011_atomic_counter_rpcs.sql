-- Migration 0011: Atomic counter RPCs for moderation/reputation updates
--
-- Adds two SECURITY DEFINER functions used by server actions:
-- 1) increment_post_flag: atomically increments flag_count and applies hide threshold
-- 2) increment_reputation: atomically increments reputation_score

CREATE OR REPLACE FUNCTION public.increment_post_flag(
  p_post_id uuid,
  p_threshold integer
)
RETURNS TABLE(new_flag_count integer, is_hidden boolean) AS $$
BEGIN
  RETURN QUERY
  UPDATE posts
  SET
    flag_count = posts.flag_count + 1,
    hidden = CASE
      WHEN posts.flag_count + 1 >= p_threshold THEN true
      ELSE posts.hidden
    END
  WHERE id = p_post_id
  RETURNING posts.flag_count, posts.hidden;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.increment_reputation(
  p_user_id uuid,
  p_amount integer DEFAULT 1
)
RETURNS integer AS $$
DECLARE
  new_score integer;
BEGIN
  UPDATE profiles
  SET
    reputation_score = profiles.reputation_score + p_amount,
    updated_at = now()
  WHERE id = p_user_id
  RETURNING reputation_score INTO new_score;

  RETURN COALESCE(new_score, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE ALL ON FUNCTION public.increment_post_flag(uuid, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.increment_post_flag(uuid, integer) FROM anon;
REVOKE ALL ON FUNCTION public.increment_post_flag(uuid, integer) FROM authenticated;

REVOKE ALL ON FUNCTION public.increment_reputation(uuid, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.increment_reputation(uuid, integer) FROM anon;
REVOKE ALL ON FUNCTION public.increment_reputation(uuid, integer) FROM authenticated;

GRANT EXECUTE ON FUNCTION public.increment_post_flag(uuid, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.increment_post_flag(uuid, integer) TO postgres;

GRANT EXECUTE ON FUNCTION public.increment_reputation(uuid, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.increment_reputation(uuid, integer) TO postgres;
