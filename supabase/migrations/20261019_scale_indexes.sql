-- Performance and Scalability Indexes for High-Concurrency Upscaling
-- Safe to run multiple times (IF NOT EXISTS)

-- 1. Transactions Table Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_group_turn 
  ON "transactions"(group_id, cycle_turn, type, status);

CREATE INDEX IF NOT EXISTS idx_transactions_membership 
  ON "transactions"(membership_id, type, status);

CREATE INDEX IF NOT EXISTS idx_transactions_created 
  ON "transactions"(created_at DESC);

-- 2. Memberships Table Indexes
CREATE INDEX IF NOT EXISTS idx_memberships_group_user 
  ON "memberships"(group_id, user_id);

CREATE INDEX IF NOT EXISTS idx_memberships_user_status 
  ON "memberships"(user_id, status);

CREATE INDEX IF NOT EXISTS idx_memberships_turn 
  ON "memberships"(group_id, payout_turn);

-- 3. Groups Table Indexes
CREATE INDEX IF NOT EXISTS idx_groups_status 
  ON "groups"(status);

CREATE INDEX IF NOT EXISTS idx_groups_admin_status 
  ON "groups"(admin_id, status);

-- 4. Notifications Table Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_read 
  ON "notifications"(user_id, is_read, created_at DESC);
