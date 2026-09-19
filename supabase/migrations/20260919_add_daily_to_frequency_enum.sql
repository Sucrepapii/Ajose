-- Migration: Add 'daily' to frequency_type enum in Supabase PostgreSQL
-- Date: 2026-09-19

ALTER TYPE frequency_type ADD VALUE IF NOT EXISTS 'daily';
