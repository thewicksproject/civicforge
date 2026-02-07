-- ============================================================================
-- 0002: Flagging, Review Queue, AI Badges
-- Adds post_flags table, ai_assisted column, review_status enum/column
-- ============================================================================

-- 1. Post flags tracking table
CREATE TABLE IF NOT EXISTS post_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Each user can only flag a post once
CREATE UNIQUE INDEX post_flags_post_user_uniq ON post_flags (post_id, user_id);
CREATE INDEX post_flags_post_idx ON post_flags (post_id);
CREATE INDEX post_flags_user_idx ON post_flags (user_id);

-- RLS for post_flags
ALTER TABLE post_flags ENABLE ROW LEVEL SECURITY;

-- Users can view their own flags
CREATE POLICY "Users can view own flags"
  ON post_flags FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert flags (for posts in their neighborhood)
CREATE POLICY "Users can flag posts"
  ON post_flags FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Tier 3 users can view all flags (for moderation)
CREATE POLICY "Admins can view all flags"
  ON post_flags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.trust_tier >= 3
    )
  );

-- Tier 3 users can delete flags (unflag)
CREATE POLICY "Admins can delete flags"
  ON post_flags FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.trust_tier >= 3
    )
  );

-- 2. AI-assisted badge column on posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS ai_assisted boolean NOT NULL DEFAULT false;

-- 3. Review status enum and column on posts
DO $$ BEGIN
  CREATE TYPE review_status AS ENUM ('none', 'pending_review', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE posts ADD COLUMN IF NOT EXISTS review_status review_status NOT NULL DEFAULT 'none';

CREATE INDEX IF NOT EXISTS posts_review_status_idx ON posts (review_status)
  WHERE review_status = 'pending_review';

-- 4. Admin RLS policies for Tier 3 users to manage posts
-- Allow Tier 3 users to read ALL posts (including hidden) for review
CREATE POLICY "Admins can view all posts"
  ON posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.trust_tier >= 3
    )
  );

-- Allow Tier 3 users to update posts (approve/reject, unhide)
CREATE POLICY "Admins can update posts for moderation"
  ON posts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.trust_tier >= 3
    )
  );
