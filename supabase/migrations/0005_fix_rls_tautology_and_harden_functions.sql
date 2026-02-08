-- ==========================================================================
-- 0005: Fix RLS tautology bugs & harden SECURITY DEFINER functions
--
-- Addresses security assessment findings:
--   F1  (CRITICAL) — posts_insert_tier2 and invitations_insert_tier2
--       had a self-referencing tautology: `p.neighborhood_id = neighborhood_id`
--       resolved to `p.neighborhood_id = p.neighborhood_id` (always true),
--       breaking multi-tenancy isolation.
--   F2  (CRITICAL) — Already remediated in 0003_fix_invitation_rls.sql.
--       Verified: invitations_update_authenticated replaced with scoped policies.
--   F6  (HIGH) — handle_new_user() and increment_ai_usage() are SECURITY DEFINER
--       but were callable by PUBLIC/anon/authenticated.
--   F10 (MEDIUM) — neighborhoods_insert_authenticated allowed unlimited creation.
-- ==========================================================================

-- -------------------------------------------------------------------------
-- F1: Fix RLS tautology on posts INSERT
-- The original policy used an unqualified `neighborhood_id` inside a
-- subquery on `profiles`, which Postgres resolved to `p.neighborhood_id`
-- (the nearest column), making the condition always true.
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS posts_insert_tier2 ON posts;

CREATE POLICY posts_insert_tier2
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.trust_tier >= 2
        AND p.neighborhood_id = posts.neighborhood_id
    )
  );

-- -------------------------------------------------------------------------
-- F1: Fix RLS tautology on invitations INSERT
-- Same bug: unqualified `neighborhood_id` in the profiles subquery.
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS invitations_insert_tier2 ON invitations;

CREATE POLICY invitations_insert_tier2
  ON invitations FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.trust_tier >= 2
        AND p.neighborhood_id = invitations.neighborhood_id
    )
  );

-- -------------------------------------------------------------------------
-- F6: Restrict SECURITY DEFINER functions
-- handle_new_user() is a trigger function called by the auth.users trigger;
-- it only needs to be executable by postgres (trigger owner).
-- increment_ai_usage() is called server-side by the AI rate-limit layer;
-- it only needs to be executable by service_role.
-- -------------------------------------------------------------------------

-- Revoke from all roles, then grant only what's needed
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM authenticated;

REVOKE ALL ON FUNCTION public.increment_ai_usage(uuid, date, int, int) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.increment_ai_usage(uuid, date, int, int) FROM anon;
REVOKE ALL ON FUNCTION public.increment_ai_usage(uuid, date, int, int) FROM authenticated;

-- handle_new_user is invoked by a trigger on auth.users; the trigger
-- executes as the table owner (postgres/supabase_admin), so postgres
-- needs EXECUTE privilege.
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres;

-- increment_ai_usage is called from server-side API routes using the
-- service_role key, so grant to service_role.
GRANT EXECUTE ON FUNCTION public.increment_ai_usage(uuid, date, int, int) TO service_role;
GRANT EXECUTE ON FUNCTION public.increment_ai_usage(uuid, date, int, int) TO postgres;

-- -------------------------------------------------------------------------
-- F10: Restrict neighborhood creation
-- Replace the permissive policy with one that requires:
--   1. created_by = auth.uid()  (ownership)
--   2. User is not already in a neighborhood (prevent multi-neighborhood)
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS neighborhoods_insert_authenticated ON neighborhoods;

CREATE POLICY neighborhoods_insert_owner_no_existing
  ON neighborhoods FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND NOT EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.neighborhood_id IS NOT NULL
    )
  );
