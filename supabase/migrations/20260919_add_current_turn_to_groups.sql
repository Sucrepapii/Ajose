-- Migration: Add current_turn column to public.groups table
-- Date: 2026-09-19

ALTER TABLE IF EXISTS public.groups 
  ADD COLUMN IF NOT EXISTS current_turn INTEGER DEFAULT 1;

-- Index for fast lookup by current_turn
CREATE INDEX IF NOT EXISTS idx_groups_current_turn ON public.groups(current_turn);
