-- Migration: Group quests and multi-use invites
-- Adds scheduled_for to quests, max_uses/use_count to invitations

-- 1. Add scheduled_for to quests
ALTER TABLE quests ADD COLUMN IF NOT EXISTS scheduled_for timestamptz;

-- 2. Add multi-use invite columns
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS max_uses integer NOT NULL DEFAULT 1;
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS use_count integer NOT NULL DEFAULT 0;

-- Backfill: existing used invitations get use_count = 1
UPDATE invitations SET use_count = 1 WHERE used_by IS NOT NULL;
