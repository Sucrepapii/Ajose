-- Enable Row Level Security on critical tables to prevent client-side write spoofing
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "groups" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "transactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "memberships" ENABLE ROW LEVEL SECURITY;

-- 1. Users Table
-- Users can only read and update their own profile data from the client
DROP POLICY IF EXISTS "Users can read own profile" ON "users";
CREATE POLICY "Users can read own profile" ON "users" FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON "users";
CREATE POLICY "Users can update own profile" ON "users" FOR UPDATE USING (auth.uid() = id);

-- Block client-side inserts/deletes entirely
-- (Server-side APIs using service_role bypass RLS)

-- 2. Groups Table
-- Anyone authenticated can read group details (needed for invites)
DROP POLICY IF EXISTS "Authenticated users can read groups" ON "groups";
CREATE POLICY "Authenticated users can read groups" ON "groups" FOR SELECT TO authenticated USING (true);

-- Only the assigned admin can update the group from the client
DROP POLICY IF EXISTS "Admins can update their groups" ON "groups";
CREATE POLICY "Admins can update their groups" ON "groups" FOR UPDATE USING (auth.uid() = admin_id);

-- 3. Transactions Table
-- Users can read their own transactions
DROP POLICY IF EXISTS "Users can read own transactions" ON "transactions";
CREATE POLICY "Users can read own transactions" ON "transactions" FOR SELECT USING (auth.uid() = user_id);

-- Block ALL client-side inserts, updates, and deletes for transactions!
-- (Transactions must only be created via secure server-side API routes)

-- 4. Memberships Table
-- Users can read their own memberships
DROP POLICY IF EXISTS "Users can read own memberships" ON "memberships";
CREATE POLICY "Users can read own memberships" ON "memberships" FOR SELECT USING (auth.uid() = user_id);
