-- Migration: Add Referral Tracking & Anti-Gaming Columns
-- Created for Àjọṣe Referral Tier & Fee Discount Engine

ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "referral_code" VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS "referred_by" UUID REFERENCES "users"("id"),
ADD COLUMN IF NOT EXISTS "custom_platform_fee_pct" NUMERIC;

CREATE TABLE IF NOT EXISTS "referrals" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "referrer_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "referred_user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "referral_code" VARCHAR(50) NOT NULL,
  "status" VARCHAR(50) DEFAULT 'pending', -- 'pending' | 'active'
  "has_bvn_verified" BOOLEAN DEFAULT FALSE,
  "has_joined_circle" BOOLEAN DEFAULT FALSE,
  "has_auto_debited" BOOLEAN DEFAULT FALSE,
  "activated_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE ("referred_user_id")
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON "referrals"("referrer_id");
CREATE INDEX IF NOT EXISTS idx_referrals_status ON "referrals"("status");
