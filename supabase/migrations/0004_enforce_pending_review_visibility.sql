-- ============================================================================
-- 0004: Enforce pending-review visibility for neighborhood post reads
-- Prevents non-authors from seeing posts awaiting moderation.
-- ============================================================================

DROP POLICY IF EXISTS posts_select_neighborhood ON posts;

CREATE POLICY posts_select_neighborhood
  ON posts FOR SELECT
  TO authenticated
  USING (
    hidden = false
    AND neighborhood_id IN (
      SELECT p.neighborhood_id FROM profiles p WHERE p.id = auth.uid()
    )
    AND (
      review_status <> 'pending_review'
      OR author_id = auth.uid()
    )
  );
