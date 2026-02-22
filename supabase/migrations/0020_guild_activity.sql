-- Phase 3: Guild Activity Surface
-- Additive only. No destructive changes.

-- ---------------------------------------------------------------------------
-- Add guild_id to quests for guild-scoped quests
-- ---------------------------------------------------------------------------
ALTER TABLE quests ADD COLUMN guild_id uuid REFERENCES guilds(id) ON DELETE SET NULL;
CREATE INDEX quests_guild_idx ON quests (guild_id);
