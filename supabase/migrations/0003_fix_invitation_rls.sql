-- ============================================================================
-- 0003: Fix invitation update RLS policy
-- The original policy (USING (true) WITH CHECK (true)) allowed any
-- authenticated user to modify any invitation. This replaces it with
-- two scoped policies:
--   1. Creator can update their own invitations
--   2. Any authenticated user can redeem (set used_by to self) unused invitations
-- ============================================================================

-- Drop the overly permissive policy
DROP POLICY IF EXISTS invitations_update_authenticated ON invitations;

-- Policy 1: Invitation creator can update their own invitations
-- (e.g., change expiry, revoke by setting used_by, etc.)
CREATE POLICY invitations_update_creator
  ON invitations FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Policy 2: Any authenticated user can redeem an invitation
-- by setting used_by to their own uid, but ONLY if the invitation
-- has not already been used (used_by IS NULL)
CREATE POLICY invitations_update_redeem
  ON invitations FOR UPDATE
  TO authenticated
  USING (used_by IS NULL)
  WITH CHECK (used_by = auth.uid());
