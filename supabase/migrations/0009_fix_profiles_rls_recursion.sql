-- Migration 0009: Fix infinite recursion in profiles SELECT policy
--
-- The profiles_select_same_neighborhood policy had a self-referential
-- subquery (SELECT FROM profiles WHERE id = auth.uid()) that triggered
-- its own RLS check, causing ERROR 42P17: infinite recursion.
--
-- Fix: Use a SECURITY DEFINER function to bypass RLS when looking up
-- the current user's neighborhood_id.

-- Helper function bypasses RLS to get current user's neighborhood
CREATE OR REPLACE FUNCTION get_user_neighborhood_id()
RETURNS uuid AS $$
  SELECT neighborhood_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- Recreate policy using the function instead of self-referential subquery
DROP POLICY IF EXISTS profiles_select_same_neighborhood ON profiles;
CREATE POLICY profiles_select_same_neighborhood ON profiles FOR SELECT USING (
  neighborhood_id IS NULL
  OR neighborhood_id = get_user_neighborhood_id()
  OR id = auth.uid()
);

-- Also rename trust_tier column to renown_tier (matches code rename)
-- Note: This was already applied manually via SQL editor, so use IF EXISTS pattern
DO $$ BEGIN
  ALTER TABLE profiles RENAME COLUMN trust_tier TO renown_tier;
EXCEPTION WHEN undefined_column THEN NULL;
END $$;
