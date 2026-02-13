-- Migration 0012: Deletion pipeline hardening
--
-- Goals:
-- 1) Preserve deletion request records after profile deletion
-- 2) Add immutable subject_user_id for durable tracking
-- 3) Enforce one open request per subject user
-- 4) Persist failure reasons and attempt metadata

DO $$
BEGIN
  ALTER TYPE deletion_status ADD VALUE IF NOT EXISTS 'failed';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE deletion_requests
  ADD COLUMN IF NOT EXISTS subject_user_id uuid,
  ADD COLUMN IF NOT EXISTS failure_reason text,
  ADD COLUMN IF NOT EXISTS attempts integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

UPDATE deletion_requests
SET
  subject_user_id = user_id,
  updated_at = COALESCE(completed_at, requested_at, now())
WHERE subject_user_id IS NULL;

ALTER TABLE deletion_requests
  ALTER COLUMN subject_user_id SET NOT NULL;

ALTER TABLE deletion_requests
  ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE deletion_requests
  DROP CONSTRAINT IF EXISTS deletion_requests_user_id_fkey;

ALTER TABLE deletion_requests
  ADD CONSTRAINT deletion_requests_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles (id) ON DELETE SET NULL;

-- If duplicate open requests exist for a user, keep the newest open request
-- and mark older ones as failed before applying the unique partial index.
WITH ranked AS (
  SELECT
    id,
    row_number() OVER (
      PARTITION BY subject_user_id
      ORDER BY requested_at DESC, id DESC
    ) AS rn
  FROM deletion_requests
  WHERE status IN ('pending', 'processing')
)
UPDATE deletion_requests d
SET
  status = 'failed',
  failure_reason = COALESCE(d.failure_reason, 'superseded_by_open_request_dedup'),
  updated_at = now()
FROM ranked r
WHERE d.id = r.id
  AND r.rn > 1;

CREATE INDEX IF NOT EXISTS deletion_requests_subject_user_idx
  ON deletion_requests (subject_user_id);

CREATE UNIQUE INDEX IF NOT EXISTS deletion_requests_open_subject_user_uniq
  ON deletion_requests (subject_user_id)
  WHERE status IN ('pending', 'processing');

DROP POLICY IF EXISTS deletion_requests_select_own ON deletion_requests;
CREATE POLICY deletion_requests_select_own
  ON deletion_requests FOR SELECT
  TO authenticated
  USING (subject_user_id = auth.uid());

DROP POLICY IF EXISTS deletion_requests_insert_own ON deletion_requests;
CREATE POLICY deletion_requests_insert_own
  ON deletion_requests FOR INSERT
  TO authenticated
  WITH CHECK (subject_user_id = auth.uid());

NOTIFY pgrst, 'reload schema';
