-- Phase 1a: Add master_admin enum value
-- This must be in a separate migration due to PostgreSQL enum limitations

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'master_admin';