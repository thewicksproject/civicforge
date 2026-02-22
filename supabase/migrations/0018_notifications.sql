-- Phase 1: Notifications + Flagging Redesign
-- Additive only. No destructive changes.

-- ---------------------------------------------------------------------------
-- Notifications table
-- ---------------------------------------------------------------------------
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  resource_type text,
  resource_id uuid,
  actor_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX notifications_recipient_idx ON notifications (recipient_id);
CREATE INDEX notifications_unread_idx ON notifications (recipient_id) WHERE read = false;
CREATE INDEX notifications_created_at_idx ON notifications (created_at);

-- RLS: users see/update/delete only their own notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (recipient_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (recipient_id = auth.uid());

-- Service role can insert notifications (server actions use service client)
CREATE POLICY "Service role can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- Flagging redesign: add flag_type and suggested_category to post_flags
-- ---------------------------------------------------------------------------
ALTER TABLE post_flags ADD COLUMN flag_type text NOT NULL DEFAULT 'report';
ALTER TABLE post_flags ADD COLUMN suggested_category text;

CREATE INDEX post_flags_type_idx ON post_flags (flag_type);
