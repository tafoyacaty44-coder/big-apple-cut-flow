-- Add 'addon' to service_category enum (must be in separate transaction)
ALTER TYPE service_category ADD VALUE IF NOT EXISTS 'addon';