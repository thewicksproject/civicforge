-- ============================================================================
-- 0015: Game Design Editing — submitted_proposal_id link
-- ============================================================================
-- Links draft game designs to their governance proposal so the draft is
-- locked from edits once submitted and can be activated after the vote passes.

ALTER TABLE game_designs
  ADD COLUMN IF NOT EXISTS submitted_proposal_id uuid
    REFERENCES governance_proposals(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS game_designs_submitted_proposal_idx
  ON game_designs(submitted_proposal_id)
  WHERE submitted_proposal_id IS NOT NULL;
