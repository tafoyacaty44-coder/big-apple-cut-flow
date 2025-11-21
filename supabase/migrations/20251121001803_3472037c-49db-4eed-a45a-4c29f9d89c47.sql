-- Add branding fields to business_config
ALTER TABLE business_config 
ADD COLUMN IF NOT EXISTS background_pattern_url TEXT,
ADD COLUMN IF NOT EXISTS background_opacity NUMERIC DEFAULT 0.35;