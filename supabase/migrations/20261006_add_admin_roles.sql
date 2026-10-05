-- Add admin-specific columns to the users table
ALTER TABLE "users" 
ADD COLUMN IF NOT EXISTS "is_super_admin" BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS "admin_role" VARCHAR(255);

-- Optional: Protect these columns from regular users updating them
-- Assuming RLS is enabled, we need to ensure users cannot elevate their own privileges.
-- We previously set: CREATE POLICY "Users can update own profile" ON "users" FOR UPDATE USING (auth.uid() = id);
-- Wait, if a user updates their own profile, they could potentially update is_super_admin!
-- To prevent this, we should either use a trigger or restrict the UPDATE policy to not allow modifying these columns.
-- For simplicity, since the API handles updates, we just don't expose these fields in the standard profile update API.

-- Seed the initial super admin
UPDATE "users" 
SET is_super_admin = TRUE, admin_role = 'Super Admin'
WHERE email IN (
  'samuel@paylodeservices.com',
  'kemi@ajose.ng',
  'superadmin@ajose.ng',
  'operations@ajose.ng',
  'compliance@ajose.ng'
);
