-- Quick fix for infinite recursion in RLS policies
-- Run this script to fix the recursion issue

-- Drop and recreate tracker_shares policies (fix recursion)
DROP POLICY IF EXISTS "Users can view shares of their trackers" ON tracker_shares;
CREATE POLICY "Users can view shares of their trackers"
  ON tracker_shares FOR SELECT
  USING (
    shared_by_user_id = auth.uid()
    OR
    shared_with_user_id = auth.uid()
  );

DROP POLICY IF EXISTS "Users can create shares for their trackers" ON tracker_shares;
CREATE POLICY "Users can create shares for their trackers"
  ON tracker_shares FOR INSERT
  WITH CHECK (
    shared_by_user_id = auth.uid()
  );

DROP POLICY IF EXISTS "Users can update shares of their trackers" ON tracker_shares;
CREATE POLICY "Users can update shares of their trackers"
  ON tracker_shares FOR UPDATE
  USING (
    shared_by_user_id = auth.uid()
  );

DROP POLICY IF EXISTS "Users can delete shares of their trackers" ON tracker_shares;
CREATE POLICY "Users can delete shares of their trackers"
  ON tracker_shares FOR DELETE
  USING (
    shared_by_user_id = auth.uid()
    OR
    shared_with_user_id = auth.uid()
  );

-- Update trackers policy (should already exist, but ensure it's correct)
DROP POLICY IF EXISTS "Users can view own trackers" ON trackers;
CREATE POLICY "Users can view own trackers"
  ON trackers FOR SELECT
  USING (
    auth.uid() = user_id
    OR
    EXISTS (
      SELECT 1 FROM tracker_shares
      WHERE tracker_shares.tracker_id = trackers.id
      AND tracker_shares.shared_with_user_id = auth.uid()
    )
  );

