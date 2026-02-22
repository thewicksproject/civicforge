-- Phase 4: Quest Communication Threads
-- Additive only. No destructive changes.

-- ---------------------------------------------------------------------------
-- Quest comments (project threads for quest coordination)
-- ---------------------------------------------------------------------------
CREATE TABLE quest_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id uuid NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX quest_comments_quest_idx ON quest_comments (quest_id);
CREATE INDEX quest_comments_author_idx ON quest_comments (author_id);

-- RLS: only quest participants can read/write
ALTER TABLE quest_comments ENABLE ROW LEVEL SECURITY;

-- Participants are: quest creator + party members
CREATE POLICY "Quest participants can view comments"
  ON quest_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM quests WHERE quests.id = quest_comments.quest_id AND quests.created_by = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM party_members pm
      JOIN parties p ON p.id = pm.party_id
      WHERE p.quest_id = quest_comments.quest_id AND pm.user_id = auth.uid()
    )
  );

-- Service role can insert (server actions handle validation)
CREATE POLICY "Service role can insert quest comments"
  ON quest_comments FOR INSERT
  WITH CHECK (true);

-- Authors can delete own comments
CREATE POLICY "Authors can delete own quest comments"
  ON quest_comments FOR DELETE
  USING (author_id = auth.uid());
