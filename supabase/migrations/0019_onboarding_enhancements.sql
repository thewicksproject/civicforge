-- Phase 2: Post-Onboarding Guidance
-- Additive only. No destructive changes.

-- ---------------------------------------------------------------------------
-- Invitation usage tracking (handles multi-use invite codes)
-- ---------------------------------------------------------------------------
CREATE TABLE invitation_usages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id uuid NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX invitation_usages_inv_user_uniq ON invitation_usages (invitation_id, user_id);
CREATE INDEX invitation_usages_user_idx ON invitation_usages (user_id);

-- RLS
ALTER TABLE invitation_usages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own invitation usages"
  ON invitation_usages FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Service role can insert invitation usages"
  ON invitation_usages FOR INSERT
  WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- User preferences (banner dismissal, etc.)
-- ---------------------------------------------------------------------------
ALTER TABLE profiles ADD COLUMN preferences jsonb NOT NULL DEFAULT '{}';
