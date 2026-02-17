-- 0017: Simplification — momentum signals + completion stories
-- Adds view_count to posts, post_interests table, completion_stories table,
-- and an RPC for atomic view count increment.

-- 1. Add view_count column to posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS view_count integer NOT NULL DEFAULT 0;

-- 2. Create post_interests table
CREATE TABLE IF NOT EXISTS post_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS post_interests_post_user_uniq ON post_interests (post_id, user_id);
CREATE INDEX IF NOT EXISTS post_interests_post_idx ON post_interests (post_id);
CREATE INDEX IF NOT EXISTS post_interests_user_idx ON post_interests (user_id);

-- RLS for post_interests
ALTER TABLE post_interests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view interests in their community posts"
  ON post_interests FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert their own interest"
  ON post_interests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own interest"
  ON post_interests FOR DELETE
  USING (auth.uid() = user_id);

-- 3. Create completion_stories table
CREATE TABLE IF NOT EXISTS completion_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  story text NOT NULL,
  photo_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS completion_stories_post_uniq ON completion_stories (post_id);
CREATE INDEX IF NOT EXISTS completion_stories_author_idx ON completion_stories (author_id);

-- RLS for completion_stories
ALTER TABLE completion_stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone in community can view completion stories"
  ON completion_stories FOR SELECT
  USING (true);

CREATE POLICY "Post authors can create completion stories"
  ON completion_stories FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- 4. Atomic view count increment RPC
CREATE OR REPLACE FUNCTION increment_view_count(post_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE posts SET view_count = view_count + 1 WHERE id = post_id;
$$;
