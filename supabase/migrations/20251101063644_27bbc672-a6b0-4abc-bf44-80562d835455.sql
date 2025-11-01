-- Add custom recipient fields to promotional_campaigns table
ALTER TABLE public.promotional_campaigns
ADD COLUMN IF NOT EXISTS custom_recipient_ids jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS custom_phone_numbers text[] DEFAULT ARRAY[]::text[];

COMMENT ON COLUMN public.promotional_campaigns.custom_recipient_ids IS 'Array of client IDs for custom audience selection';
COMMENT ON COLUMN public.promotional_campaigns.custom_phone_numbers IS 'Array of manually entered phone numbers for custom campaigns';