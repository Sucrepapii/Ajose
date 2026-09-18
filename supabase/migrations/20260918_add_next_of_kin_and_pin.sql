-- Migration: Add Next of Kin, Social Guarantor, and Transaction PIN fields to public.users table
-- Date: 2026-09-18

ALTER TABLE IF EXISTS public.users 
  ADD COLUMN IF NOT EXISTS next_of_kin_name TEXT,
  ADD COLUMN IF NOT EXISTS next_of_kin_relationship TEXT,
  ADD COLUMN IF NOT EXISTS next_of_kin_phone TEXT,
  ADD COLUMN IF NOT EXISTS next_of_kin_email TEXT,
  ADD COLUMN IF NOT EXISTS next_of_kin_address TEXT,
  ADD COLUMN IF NOT EXISTS guarantor_name TEXT,
  ADD COLUMN IF NOT EXISTS guarantor_phone TEXT,
  ADD COLUMN IF NOT EXISTS guarantor_relationship TEXT,
  ADD COLUMN IF NOT EXISTS has_pin BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS pin_hash TEXT;

-- Create index for quick lookups if needed
CREATE INDEX IF NOT EXISTS idx_users_has_pin ON public.users(has_pin);
