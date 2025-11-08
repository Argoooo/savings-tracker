-- Tracker Sharing Schema Extension
-- Run this AFTER schema-multi-tracker.sql
-- Adds support for sharing trackers with other users and real-time sync

-- Tracker Shares table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS tracker_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tracker_id UUID NOT NULL REFERENCES trackers(id) ON DELETE CASCADE,
  shared_with_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission TEXT NOT NULL DEFAULT 'read', -- 'read' or 'write'
  shared_by_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tracker_id, shared_with_user_id) -- Prevent duplicate shares
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tracker_shares_tracker_id ON tracker_shares(tracker_id);
CREATE INDEX IF NOT EXISTS idx_tracker_shares_shared_with_user_id ON tracker_shares(shared_with_user_id);
CREATE INDEX IF NOT EXISTS idx_tracker_shares_shared_by_user_id ON tracker_shares(shared_by_user_id);

-- Enable RLS on tracker_shares
ALTER TABLE tracker_shares ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tracker_shares
CREATE POLICY "Users can view shares of their trackers"
  ON tracker_shares FOR SELECT
  USING (
    -- Owner can see all shares of their trackers
    EXISTS (
      SELECT 1 FROM trackers
      WHERE trackers.id = tracker_shares.tracker_id
      AND trackers.user_id = auth.uid()
    )
    OR
    -- Shared user can see shares they're part of
    tracker_shares.shared_with_user_id = auth.uid()
  );

CREATE POLICY "Users can create shares for their trackers"
  ON tracker_shares FOR INSERT
  WITH CHECK (
    -- Only tracker owner can share
    EXISTS (
      SELECT 1 FROM trackers
      WHERE trackers.id = tracker_shares.tracker_id
      AND trackers.user_id = auth.uid()
    )
    AND tracker_shares.shared_by_user_id = auth.uid()
  );

CREATE POLICY "Users can update shares of their trackers"
  ON tracker_shares FOR UPDATE
  USING (
    -- Only tracker owner can update shares
    EXISTS (
      SELECT 1 FROM trackers
      WHERE trackers.id = tracker_shares.tracker_id
      AND trackers.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete shares of their trackers"
  ON tracker_shares FOR DELETE
  USING (
    -- Tracker owner can delete any share
    EXISTS (
      SELECT 1 FROM trackers
      WHERE trackers.id = tracker_shares.tracker_id
      AND trackers.user_id = auth.uid()
    )
    OR
    -- Shared user can remove themselves
    tracker_shares.shared_with_user_id = auth.uid()
  );

-- Update RLS policies for trackers to allow shared users
DROP POLICY IF EXISTS "Users can view own trackers" ON trackers;
CREATE POLICY "Users can view own trackers"
  ON trackers FOR SELECT
  USING (
    -- Owner can see their trackers
    auth.uid() = user_id
    OR
    -- Shared users can see shared trackers
    EXISTS (
      SELECT 1 FROM tracker_shares
      WHERE tracker_shares.tracker_id = trackers.id
      AND tracker_shares.shared_with_user_id = auth.uid()
    )
  );

-- Update Settings policies to allow shared users
DROP POLICY IF EXISTS "Users can view own settings" ON settings;
CREATE POLICY "Users can view own settings"
  ON settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM trackers
      WHERE trackers.id = settings.tracker_id
      AND (
        -- Owner can view
        trackers.user_id = auth.uid()
        OR
        -- Shared user can view
        EXISTS (
          SELECT 1 FROM tracker_shares
          WHERE tracker_shares.tracker_id = trackers.id
          AND tracker_shares.shared_with_user_id = auth.uid()
        )
      )
    )
  );

DROP POLICY IF EXISTS "Users can insert own settings" ON settings;
CREATE POLICY "Users can insert own settings"
  ON settings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trackers
      WHERE trackers.id = settings.tracker_id
      AND (
        -- Owner can insert
        trackers.user_id = auth.uid()
        OR
        -- Shared user with write permission can insert
        EXISTS (
          SELECT 1 FROM tracker_shares
          WHERE tracker_shares.tracker_id = trackers.id
          AND tracker_shares.shared_with_user_id = auth.uid()
          AND tracker_shares.permission = 'write'
        )
      )
    )
  );

DROP POLICY IF EXISTS "Users can update own settings" ON settings;
CREATE POLICY "Users can update own settings"
  ON settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM trackers
      WHERE trackers.id = settings.tracker_id
      AND (
        -- Owner can update
        trackers.user_id = auth.uid()
        OR
        -- Shared user with write permission can update
        EXISTS (
          SELECT 1 FROM tracker_shares
          WHERE tracker_shares.tracker_id = trackers.id
          AND tracker_shares.shared_with_user_id = auth.uid()
          AND tracker_shares.permission = 'write'
        )
      )
    )
  );

-- Update People policies to allow shared users
DROP POLICY IF EXISTS "Users can view own people" ON people;
CREATE POLICY "Users can view own people"
  ON people FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM trackers
      WHERE trackers.id = people.tracker_id
      AND (
        trackers.user_id = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM tracker_shares
          WHERE tracker_shares.tracker_id = trackers.id
          AND tracker_shares.shared_with_user_id = auth.uid()
        )
      )
    )
  );

DROP POLICY IF EXISTS "Users can insert own people" ON people;
CREATE POLICY "Users can insert own people"
  ON people FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trackers
      WHERE trackers.id = people.tracker_id
      AND (
        trackers.user_id = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM tracker_shares
          WHERE tracker_shares.tracker_id = trackers.id
          AND tracker_shares.shared_with_user_id = auth.uid()
          AND tracker_shares.permission = 'write'
        )
      )
    )
  );

DROP POLICY IF EXISTS "Users can update own people" ON people;
CREATE POLICY "Users can update own people"
  ON people FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM trackers
      WHERE trackers.id = people.tracker_id
      AND (
        trackers.user_id = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM tracker_shares
          WHERE tracker_shares.tracker_id = trackers.id
          AND tracker_shares.shared_with_user_id = auth.uid()
          AND tracker_shares.permission = 'write'
        )
      )
    )
  );

DROP POLICY IF EXISTS "Users can delete own people" ON people;
CREATE POLICY "Users can delete own people"
  ON people FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM trackers
      WHERE trackers.id = people.tracker_id
      AND (
        trackers.user_id = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM tracker_shares
          WHERE tracker_shares.tracker_id = trackers.id
          AND tracker_shares.shared_with_user_id = auth.uid()
          AND tracker_shares.permission = 'write'
        )
      )
    )
  );

-- Update Goals policies to allow shared users
DROP POLICY IF EXISTS "Users can view own goals" ON goals;
CREATE POLICY "Users can view own goals"
  ON goals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM trackers
      WHERE trackers.id = goals.tracker_id
      AND (
        trackers.user_id = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM tracker_shares
          WHERE tracker_shares.tracker_id = trackers.id
          AND tracker_shares.shared_with_user_id = auth.uid()
        )
      )
    )
  );

DROP POLICY IF EXISTS "Users can insert own goals" ON goals;
CREATE POLICY "Users can insert own goals"
  ON goals FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trackers
      WHERE trackers.id = goals.tracker_id
      AND (
        trackers.user_id = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM tracker_shares
          WHERE tracker_shares.tracker_id = trackers.id
          AND tracker_shares.shared_with_user_id = auth.uid()
          AND tracker_shares.permission = 'write'
        )
      )
    )
  );

DROP POLICY IF EXISTS "Users can update own goals" ON goals;
CREATE POLICY "Users can update own goals"
  ON goals FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM trackers
      WHERE trackers.id = goals.tracker_id
      AND (
        trackers.user_id = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM tracker_shares
          WHERE tracker_shares.tracker_id = trackers.id
          AND tracker_shares.shared_with_user_id = auth.uid()
          AND tracker_shares.permission = 'write'
        )
      )
    )
  );

DROP POLICY IF EXISTS "Users can delete own goals" ON goals;
CREATE POLICY "Users can delete own goals"
  ON goals FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM trackers
      WHERE trackers.id = goals.tracker_id
      AND (
        trackers.user_id = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM tracker_shares
          WHERE tracker_shares.tracker_id = trackers.id
          AND tracker_shares.shared_with_user_id = auth.uid()
          AND tracker_shares.permission = 'write'
        )
      )
    )
  );

-- Update Transactions policies to allow shared users
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM trackers
      WHERE trackers.id = transactions.tracker_id
      AND (
        trackers.user_id = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM tracker_shares
          WHERE tracker_shares.tracker_id = trackers.id
          AND tracker_shares.shared_with_user_id = auth.uid()
        )
      )
    )
  );

DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trackers
      WHERE trackers.id = transactions.tracker_id
      AND (
        trackers.user_id = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM tracker_shares
          WHERE tracker_shares.tracker_id = trackers.id
          AND tracker_shares.shared_with_user_id = auth.uid()
          AND tracker_shares.permission = 'write'
        )
      )
    )
  );

DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM trackers
      WHERE trackers.id = transactions.tracker_id
      AND (
        trackers.user_id = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM tracker_shares
          WHERE tracker_shares.tracker_id = trackers.id
          AND tracker_shares.shared_with_user_id = auth.uid()
          AND tracker_shares.permission = 'write'
        )
      )
    )
  );

DROP POLICY IF EXISTS "Users can delete own transactions" ON transactions;
CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM trackers
      WHERE trackers.id = transactions.tracker_id
      AND (
        trackers.user_id = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM tracker_shares
          WHERE tracker_shares.tracker_id = trackers.id
          AND tracker_shares.shared_with_user_id = auth.uid()
          AND tracker_shares.permission = 'write'
        )
      )
    )
  );

-- Update Scenario rates policies to allow shared users
DROP POLICY IF EXISTS "Users can view own scenario rates" ON scenario_rates;
CREATE POLICY "Users can view own scenario rates"
  ON scenario_rates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM trackers
      WHERE trackers.id = scenario_rates.tracker_id
      AND (
        trackers.user_id = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM tracker_shares
          WHERE tracker_shares.tracker_id = trackers.id
          AND tracker_shares.shared_with_user_id = auth.uid()
        )
      )
    )
  );

DROP POLICY IF EXISTS "Users can insert own scenario rates" ON scenario_rates;
CREATE POLICY "Users can insert own scenario rates"
  ON scenario_rates FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trackers
      WHERE trackers.id = scenario_rates.tracker_id
      AND (
        trackers.user_id = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM tracker_shares
          WHERE tracker_shares.tracker_id = trackers.id
          AND tracker_shares.shared_with_user_id = auth.uid()
          AND tracker_shares.permission = 'write'
        )
      )
    )
  );

DROP POLICY IF EXISTS "Users can update own scenario rates" ON scenario_rates;
CREATE POLICY "Users can update own scenario rates"
  ON scenario_rates FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM trackers
      WHERE trackers.id = scenario_rates.tracker_id
      AND (
        trackers.user_id = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM tracker_shares
          WHERE tracker_shares.tracker_id = trackers.id
          AND tracker_shares.shared_with_user_id = auth.uid()
          AND tracker_shares.permission = 'write'
        )
      )
    )
  );

-- Function to get user's email for sharing (helper function)
CREATE OR REPLACE FUNCTION get_user_email(user_uuid UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT email FROM auth.users WHERE id = user_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

