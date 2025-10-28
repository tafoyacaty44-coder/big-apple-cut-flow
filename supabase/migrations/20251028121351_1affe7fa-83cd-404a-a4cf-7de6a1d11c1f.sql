-- Add promo code tracking to appointments
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS promo_code_used TEXT,
ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES promotional_campaigns(id);

-- Add opened_count to promotional_campaigns for future email tracking
ALTER TABLE promotional_campaigns 
ADD COLUMN IF NOT EXISTS opened_count INTEGER DEFAULT 0;

-- Create index for faster promo code lookups
CREATE INDEX IF NOT EXISTS idx_campaigns_promo_code ON promotional_campaigns(promo_code) WHERE promo_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_appointments_campaign ON appointments(campaign_id) WHERE campaign_id IS NOT NULL;