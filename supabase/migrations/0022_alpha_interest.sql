-- Alpha interest / waitlist for early access
CREATE TABLE IF NOT EXISTS alpha_interest (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email      text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX alpha_interest_email_uniq ON alpha_interest(email);

ALTER TABLE alpha_interest ENABLE ROW LEVEL SECURITY;
-- No RLS policies — only accessed via service client
