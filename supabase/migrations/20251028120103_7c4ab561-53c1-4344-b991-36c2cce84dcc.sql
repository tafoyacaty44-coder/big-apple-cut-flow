-- Create enum types for promotional campaigns
CREATE TYPE campaign_type AS ENUM ('promotional', 'announcement', 'seasonal', 'loyalty');
CREATE TYPE campaign_status AS ENUM ('draft', 'scheduled', 'sending', 'sent', 'paused', 'canceled');
CREATE TYPE target_audience AS ENUM ('all_customers', 'vip_only', 'recent_customers', 'inactive_customers', 'custom');
CREATE TYPE recipient_status AS ENUM ('queued', 'sent', 'failed', 'bounced', 'clicked');

-- Create promotional_campaigns table
CREATE TABLE public.promotional_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type campaign_type NOT NULL DEFAULT 'promotional',
  channel TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'both')),
  subject TEXT,
  message_body TEXT NOT NULL,
  email_html TEXT,
  target_audience target_audience NOT NULL DEFAULT 'all_customers',
  custom_filters JSONB,
  status campaign_status NOT NULL DEFAULT 'draft',
  scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  click_through_count INTEGER DEFAULT 0,
  promo_code TEXT,
  promo_discount INTEGER,
  promo_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create campaign_recipients table
CREATE TABLE public.campaign_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.promotional_campaigns(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'sms')),
  status recipient_status NOT NULL DEFAULT 'queued',
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  clicked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_campaign_recipients_campaign_status ON public.campaign_recipients(campaign_id, status);
CREATE INDEX idx_campaign_recipients_client ON public.campaign_recipients(client_id);
CREATE INDEX idx_promotional_campaigns_status_scheduled ON public.promotional_campaigns(status, scheduled_for);
CREATE INDEX idx_promotional_campaigns_created_by ON public.promotional_campaigns(created_by);

-- Enable RLS
ALTER TABLE public.promotional_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_recipients ENABLE ROW LEVEL SECURITY;

-- RLS Policies for promotional_campaigns
CREATE POLICY "Admins can manage all campaigns"
ON public.promotional_campaigns
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- RLS Policies for campaign_recipients
CREATE POLICY "Admins can manage all recipients"
ON public.campaign_recipients
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_promotional_campaigns_updated_at
BEFORE UPDATE ON public.promotional_campaigns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();