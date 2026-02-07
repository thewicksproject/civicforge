-- ==========================================================================
-- CivicForge V2 — Initial Schema Migration
-- ==========================================================================
-- This migration creates all tables, enums, indexes, RLS policies,
-- storage buckets, helper functions, and triggers for CivicForge V2.
-- ==========================================================================

-- ==========================================================================
-- 1. ENUMS
-- ==========================================================================

DO $$ BEGIN
  CREATE TYPE post_type AS ENUM ('need', 'offer');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE post_status AS ENUM ('active', 'in_progress', 'completed', 'expired');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE urgency_level AS ENUM ('low', 'medium', 'high');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE response_status AS ENUM ('pending', 'accepted', 'declined');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE membership_status AS ENUM ('pending', 'approved', 'denied');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE deletion_status AS ENUM ('pending', 'processing', 'completed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ==========================================================================
-- 2. TABLES
-- ==========================================================================

-- -------------------------------------------------------------------------
-- 2.1 neighborhoods
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS neighborhoods (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  city        text NOT NULL,
  state       text NOT NULL,
  zip_codes   text[] NOT NULL,
  description text,
  created_by  uuid,                            -- FK added after profiles exists
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS neighborhoods_city_state_idx
  ON neighborhoods (city, state);

-- -------------------------------------------------------------------------
-- 2.2 profiles
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id               uuid PRIMARY KEY,            -- references auth.users.id
  display_name     text NOT NULL,
  neighborhood_id  uuid REFERENCES neighborhoods (id) ON DELETE SET NULL,
  bio              text,
  skills           text[] NOT NULL DEFAULT '{}',
  reputation_score integer NOT NULL DEFAULT 0,
  trust_tier       integer NOT NULL DEFAULT 1,
  phone_verified   boolean NOT NULL DEFAULT false,
  avatar_url       text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS profiles_neighborhood_idx
  ON profiles (neighborhood_id);
CREATE INDEX IF NOT EXISTS profiles_trust_tier_idx
  ON profiles (trust_tier);

-- Back-reference FK: neighborhoods.created_by -> profiles.id
ALTER TABLE neighborhoods
  ADD CONSTRAINT neighborhoods_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES profiles (id) ON DELETE SET NULL;

-- -------------------------------------------------------------------------
-- 2.3 posts
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS posts (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id        uuid NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  neighborhood_id  uuid NOT NULL REFERENCES neighborhoods (id) ON DELETE CASCADE,
  type             post_type NOT NULL,
  title            text NOT NULL,
  description      text NOT NULL,
  category         text NOT NULL,
  skills_relevant  text[] NOT NULL DEFAULT '{}',
  urgency          urgency_level,
  status           post_status NOT NULL DEFAULT 'active',
  location_hint    text,
  available_times  text,
  expires_at       timestamptz,
  flag_count       integer NOT NULL DEFAULT 0,
  hidden           boolean NOT NULL DEFAULT false,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS posts_author_idx       ON posts (author_id);
CREATE INDEX IF NOT EXISTS posts_neighborhood_idx ON posts (neighborhood_id);
CREATE INDEX IF NOT EXISTS posts_type_status_idx  ON posts (type, status);
CREATE INDEX IF NOT EXISTS posts_category_idx     ON posts (category);
CREATE INDEX IF NOT EXISTS posts_created_at_idx   ON posts (created_at);

-- -------------------------------------------------------------------------
-- 2.4 post_photos
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS post_photos (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id       uuid NOT NULL REFERENCES posts (id) ON DELETE CASCADE,
  url           text NOT NULL,
  thumbnail_url text NOT NULL,
  uploaded_by   uuid NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS post_photos_post_idx ON post_photos (post_id);

-- -------------------------------------------------------------------------
-- 2.5 responses
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS responses (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id      uuid NOT NULL REFERENCES posts (id) ON DELETE CASCADE,
  responder_id uuid NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  message      text NOT NULL,
  status       response_status NOT NULL DEFAULT 'pending',
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS responses_post_responder_uniq
  ON responses (post_id, responder_id);
CREATE INDEX IF NOT EXISTS responses_post_idx      ON responses (post_id);
CREATE INDEX IF NOT EXISTS responses_responder_idx  ON responses (responder_id);

-- -------------------------------------------------------------------------
-- 2.6 thanks
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS thanks (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user  uuid NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  to_user    uuid NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  post_id    uuid REFERENCES posts (id) ON DELETE SET NULL,
  message    text,
  photo_url  text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS thanks_from_user_idx ON thanks (from_user);
CREATE INDEX IF NOT EXISTS thanks_to_user_idx   ON thanks (to_user);

-- -------------------------------------------------------------------------
-- 2.7 invitations
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS invitations (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code             varchar(32) NOT NULL,
  neighborhood_id  uuid NOT NULL REFERENCES neighborhoods (id) ON DELETE CASCADE,
  created_by       uuid NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  used_by          uuid REFERENCES profiles (id) ON DELETE SET NULL,
  expires_at       timestamptz NOT NULL,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS invitations_code_uniq
  ON invitations (code);
CREATE INDEX IF NOT EXISTS invitations_neighborhood_idx
  ON invitations (neighborhood_id);

-- -------------------------------------------------------------------------
-- 2.8 membership_requests
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS membership_requests (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  neighborhood_id  uuid NOT NULL REFERENCES neighborhoods (id) ON DELETE CASCADE,
  status           membership_status NOT NULL DEFAULT 'pending',
  reviewed_by      uuid REFERENCES profiles (id) ON DELETE SET NULL,
  message          text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS membership_requests_user_idx
  ON membership_requests (user_id);
CREATE INDEX IF NOT EXISTS membership_requests_neighborhood_idx
  ON membership_requests (neighborhood_id);
CREATE INDEX IF NOT EXISTS membership_requests_status_idx
  ON membership_requests (status);

-- -------------------------------------------------------------------------
-- 2.9 ai_matches
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ai_matches (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id           uuid NOT NULL REFERENCES posts (id) ON DELETE CASCADE,
  suggested_user_id uuid NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  match_score       real NOT NULL,
  match_reason      text NOT NULL,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_matches_post_idx
  ON ai_matches (post_id);
CREATE INDEX IF NOT EXISTS ai_matches_suggested_user_idx
  ON ai_matches (suggested_user_id);
CREATE INDEX IF NOT EXISTS ai_matches_score_idx
  ON ai_matches (match_score);

-- -------------------------------------------------------------------------
-- 2.10 ai_usage
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ai_usage (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  date           date NOT NULL,
  tokens_used    integer NOT NULL DEFAULT 0,
  requests_count integer NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX IF NOT EXISTS ai_usage_user_date_uniq
  ON ai_usage (user_id, date);
CREATE INDEX IF NOT EXISTS ai_usage_user_idx
  ON ai_usage (user_id);

-- -------------------------------------------------------------------------
-- 2.11 user_consents
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_consents (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  consent_type   text NOT NULL,
  policy_version text NOT NULL,
  granted_at     timestamptz NOT NULL DEFAULT now(),
  revoked_at     timestamptz
);

CREATE INDEX IF NOT EXISTS user_consents_user_idx
  ON user_consents (user_id);
CREATE INDEX IF NOT EXISTS user_consents_type_idx
  ON user_consents (consent_type);

-- -------------------------------------------------------------------------
-- 2.12 audit_log
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_log (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid,
  action        text NOT NULL,
  resource_type text NOT NULL,
  resource_id   uuid,
  metadata      jsonb,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_log_user_idx
  ON audit_log (user_id);
CREATE INDEX IF NOT EXISTS audit_log_action_idx
  ON audit_log (action);
CREATE INDEX IF NOT EXISTS audit_log_resource_idx
  ON audit_log (resource_type, resource_id);
CREATE INDEX IF NOT EXISTS audit_log_created_at_idx
  ON audit_log (created_at);

-- -------------------------------------------------------------------------
-- 2.13 deletion_requests
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS deletion_requests (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  status       deletion_status NOT NULL DEFAULT 'pending',
  requested_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE INDEX IF NOT EXISTS deletion_requests_user_idx
  ON deletion_requests (user_id);
CREATE INDEX IF NOT EXISTS deletion_requests_status_idx
  ON deletion_requests (status);


-- ==========================================================================
-- 3. ENABLE ROW LEVEL SECURITY ON EVERY TABLE
-- ==========================================================================

ALTER TABLE neighborhoods       ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts               ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_photos         ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses           ENABLE ROW LEVEL SECURITY;
ALTER TABLE thanks              ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations         ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_matches          ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage            ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_consents       ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log           ENABLE ROW LEVEL SECURITY;
ALTER TABLE deletion_requests   ENABLE ROW LEVEL SECURITY;


-- ==========================================================================
-- 4. RLS POLICIES
-- ==========================================================================

-- -------------------------------------------------------------------------
-- 4.1 profiles
-- -------------------------------------------------------------------------

-- SELECT: authenticated users can view profiles in their own neighborhood
CREATE POLICY profiles_select_same_neighborhood
  ON profiles FOR SELECT
  TO authenticated
  USING (
    neighborhood_id IS NULL
    OR neighborhood_id IN (
      SELECT p.neighborhood_id FROM profiles p WHERE p.id = auth.uid()
    )
  );

-- INSERT: users can only create their own profile
CREATE POLICY profiles_insert_own
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- UPDATE: users can only update their own profile
CREATE POLICY profiles_update_own
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- DELETE: users can only delete their own profile
CREATE POLICY profiles_delete_own
  ON profiles FOR DELETE
  TO authenticated
  USING (id = auth.uid());

-- -------------------------------------------------------------------------
-- 4.2 neighborhoods
-- -------------------------------------------------------------------------

-- SELECT: any authenticated user can view neighborhoods
CREATE POLICY neighborhoods_select_authenticated
  ON neighborhoods FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: any authenticated user can create a neighborhood
CREATE POLICY neighborhoods_insert_authenticated
  ON neighborhoods FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- UPDATE: only the creator can update
CREATE POLICY neighborhoods_update_creator
  ON neighborhoods FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- -------------------------------------------------------------------------
-- 4.3 posts
-- -------------------------------------------------------------------------

-- SELECT: authenticated users can see non-hidden posts in their neighborhood
CREATE POLICY posts_select_neighborhood
  ON posts FOR SELECT
  TO authenticated
  USING (
    hidden = false
    AND neighborhood_id IN (
      SELECT p.neighborhood_id FROM profiles p WHERE p.id = auth.uid()
    )
  );

-- INSERT: Tier 2+ users in the same neighborhood
CREATE POLICY posts_insert_tier2
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.trust_tier >= 2
        AND p.neighborhood_id = neighborhood_id
    )
  );

-- UPDATE: only the author
CREATE POLICY posts_update_author
  ON posts FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

-- DELETE: only the author
CREATE POLICY posts_delete_author
  ON posts FOR DELETE
  TO authenticated
  USING (author_id = auth.uid());

-- -------------------------------------------------------------------------
-- 4.4 post_photos
-- -------------------------------------------------------------------------

-- SELECT: anyone who can see the parent post
CREATE POLICY post_photos_select_via_post
  ON post_photos FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_photos.post_id
        AND posts.hidden = false
        AND posts.neighborhood_id IN (
          SELECT p.neighborhood_id FROM profiles p WHERE p.id = auth.uid()
        )
    )
  );

-- INSERT: Tier 2+ users, uploaded_by must match auth.uid()
CREATE POLICY post_photos_insert_tier2
  ON post_photos FOR INSERT
  TO authenticated
  WITH CHECK (
    uploaded_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.trust_tier >= 2
    )
  );

-- DELETE: only the uploader
CREATE POLICY post_photos_delete_uploader
  ON post_photos FOR DELETE
  TO authenticated
  USING (uploaded_by = auth.uid());

-- -------------------------------------------------------------------------
-- 4.5 responses
-- -------------------------------------------------------------------------

-- SELECT: post author and the responder can view
CREATE POLICY responses_select_involved
  ON responses FOR SELECT
  TO authenticated
  USING (
    responder_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = responses.post_id
        AND posts.author_id = auth.uid()
    )
  );

-- INSERT: Tier 2+ users, responder_id must be auth.uid()
CREATE POLICY responses_insert_tier2
  ON responses FOR INSERT
  TO authenticated
  WITH CHECK (
    responder_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.trust_tier >= 2
    )
  );

-- UPDATE: only the post author can update the response status
CREATE POLICY responses_update_post_author
  ON responses FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = responses.post_id
        AND posts.author_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = responses.post_id
        AND posts.author_id = auth.uid()
    )
  );

-- -------------------------------------------------------------------------
-- 4.6 thanks
-- -------------------------------------------------------------------------

-- SELECT: from_user or to_user
CREATE POLICY thanks_select_involved
  ON thanks FOR SELECT
  TO authenticated
  USING (
    from_user = auth.uid() OR to_user = auth.uid()
  );

-- INSERT: any authenticated user, from_user must match auth.uid()
CREATE POLICY thanks_insert_own
  ON thanks FOR INSERT
  TO authenticated
  WITH CHECK (from_user = auth.uid());

-- -------------------------------------------------------------------------
-- 4.7 invitations
-- -------------------------------------------------------------------------

-- SELECT: creator or users in the same neighborhood
CREATE POLICY invitations_select_neighborhood
  ON invitations FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid()
    OR neighborhood_id IN (
      SELECT p.neighborhood_id FROM profiles p WHERE p.id = auth.uid()
    )
  );

-- INSERT: Tier 2+ users in the same neighborhood
CREATE POLICY invitations_insert_tier2
  ON invitations FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.trust_tier >= 2
        AND p.neighborhood_id = neighborhood_id
    )
  );

-- UPDATE: any authenticated user can mark an invitation as used
CREATE POLICY invitations_update_authenticated
  ON invitations FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- -------------------------------------------------------------------------
-- 4.8 membership_requests
-- -------------------------------------------------------------------------

-- SELECT: the requester or Tier 2+ users in the neighborhood
CREATE POLICY membership_requests_select
  ON membership_requests FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.trust_tier >= 2
        AND p.neighborhood_id = membership_requests.neighborhood_id
    )
  );

-- INSERT: any authenticated user can request membership
CREATE POLICY membership_requests_insert
  ON membership_requests FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- UPDATE: Tier 2+ users in the neighborhood can review
CREATE POLICY membership_requests_update_reviewer
  ON membership_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.trust_tier >= 2
        AND p.neighborhood_id = membership_requests.neighborhood_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.trust_tier >= 2
        AND p.neighborhood_id = membership_requests.neighborhood_id
    )
  );

-- -------------------------------------------------------------------------
-- 4.9 ai_matches
-- -------------------------------------------------------------------------

-- SELECT: post author only
CREATE POLICY ai_matches_select_post_author
  ON ai_matches FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = ai_matches.post_id
        AND posts.author_id = auth.uid()
    )
  );

-- INSERT: service role only (no policy for authenticated; handled by function)
CREATE POLICY ai_matches_insert_service_role
  ON ai_matches FOR INSERT
  TO service_role
  WITH CHECK (true);

-- -------------------------------------------------------------------------
-- 4.10 ai_usage
-- -------------------------------------------------------------------------

-- SELECT: own records only
CREATE POLICY ai_usage_select_own
  ON ai_usage FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- INSERT: own records only
CREATE POLICY ai_usage_insert_own
  ON ai_usage FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- UPDATE: own records only
CREATE POLICY ai_usage_update_own
  ON ai_usage FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- -------------------------------------------------------------------------
-- 4.11 user_consents
-- -------------------------------------------------------------------------

-- SELECT: own records
CREATE POLICY user_consents_select_own
  ON user_consents FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- INSERT: own records
CREATE POLICY user_consents_insert_own
  ON user_consents FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- UPDATE: own records
CREATE POLICY user_consents_update_own
  ON user_consents FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- -------------------------------------------------------------------------
-- 4.12 audit_log
-- -------------------------------------------------------------------------

-- SELECT: own records only
CREATE POLICY audit_log_select_own
  ON audit_log FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- INSERT: service role only (populated via helper function)
CREATE POLICY audit_log_insert_service_role
  ON audit_log FOR INSERT
  TO service_role
  WITH CHECK (true);

-- -------------------------------------------------------------------------
-- 4.13 deletion_requests
-- -------------------------------------------------------------------------

-- SELECT: own records
CREATE POLICY deletion_requests_select_own
  ON deletion_requests FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- INSERT: own records
CREATE POLICY deletion_requests_insert_own
  ON deletion_requests FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());


-- ==========================================================================
-- 5. HELPER FUNCTIONS
-- ==========================================================================

-- -------------------------------------------------------------------------
-- 5.1 handle_new_user()
--     Trigger function: creates a profile row when a new auth.users row
--     is inserted. Uses the raw_user_meta_data->>'display_name' if present,
--     otherwise falls back to the email prefix.
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data ->> 'display_name',
      SPLIT_PART(NEW.email, '@', 1),
      'New User'
    )
  );
  RETURN NEW;
END;
$$;

-- -------------------------------------------------------------------------
-- 5.2 increment_ai_usage()
--     Upserts a row into ai_usage, adding to tokens_used and
--     requests_count for the given user and date. Uses ON CONFLICT
--     to handle the unique (user_id, date) constraint.
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.increment_ai_usage(
  p_user_id   uuid,
  p_date      date,
  p_tokens    int,
  p_requests  int
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.ai_usage (user_id, date, tokens_used, requests_count)
  VALUES (p_user_id, p_date, p_tokens, p_requests)
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    tokens_used    = ai_usage.tokens_used    + EXCLUDED.tokens_used,
    requests_count = ai_usage.requests_count + EXCLUDED.requests_count;
END;
$$;


-- ==========================================================================
-- 6. TRIGGERS
-- ==========================================================================

-- Create the trigger on auth.users to auto-create a profile on sign-up.
-- DROP first to make the migration re-runnable.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- ==========================================================================
-- 7. STORAGE — post-photos bucket
-- ==========================================================================

-- Create the bucket (Supabase storage.buckets table).
-- file_size_limit is in bytes: 5 MB = 5 * 1024 * 1024 = 5242880
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'post-photos',
  'post-photos',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: authenticated users can upload to their own folder ({user_id}/*)
CREATE POLICY storage_post_photos_insert_own
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'post-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage policy: authenticated users can read any photo in the bucket
CREATE POLICY storage_post_photos_select_authenticated
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'post-photos');

-- Storage policy: users can update (overwrite) their own uploads
CREATE POLICY storage_post_photos_update_own
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'post-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage policy: users can delete their own uploads
CREATE POLICY storage_post_photos_delete_own
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'post-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );


-- ==========================================================================
-- 8. UPDATED_AT AUTO-UPDATE TRIGGER (optional convenience)
-- ==========================================================================

-- Generic function that sets updated_at = now() on any UPDATE.
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply to every table that has an updated_at column.
CREATE TRIGGER set_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON responses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON membership_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
