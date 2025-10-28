-- Create reward_actions table (catalog of point-earning actions)
CREATE TABLE IF NOT EXISTS public.reward_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  points INTEGER NOT NULL CHECK (points > 0),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create reward_tiers table (discount tiers based on points)
CREATE TABLE IF NOT EXISTS public.reward_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  min_points INTEGER NOT NULL,
  discount_percent INTEGER NOT NULL CHECK (discount_percent BETWEEN 0 AND 100),
  benefits TEXT[],
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create referral_codes table
CREATE TABLE IF NOT EXISTS public.referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  times_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create referral_conversions table
CREATE TABLE IF NOT EXISTS public.referral_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code_id UUID REFERENCES public.referral_codes(id) ON DELETE CASCADE,
  new_customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  points_awarded INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Modify rewards_activity to add action reference
ALTER TABLE public.rewards_activity 
  ADD COLUMN IF NOT EXISTS action_id UUID REFERENCES public.reward_actions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS description TEXT;

-- Enable RLS
ALTER TABLE public.reward_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_conversions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reward_actions
CREATE POLICY "Anyone can view active reward actions"
  ON public.reward_actions FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage reward actions"
  ON public.reward_actions FOR ALL
  USING (has_role(auth.uid(), 'admin'::user_role));

-- RLS Policies for reward_tiers
CREATE POLICY "Anyone can view reward tiers"
  ON public.reward_tiers FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage reward tiers"
  ON public.reward_tiers FOR ALL
  USING (has_role(auth.uid(), 'admin'::user_role));

-- RLS Policies for referral_codes
CREATE POLICY "Users can view their own referral codes"
  ON public.referral_codes FOR SELECT
  USING (auth.uid() = customer_id);

CREATE POLICY "Users can create their own referral codes"
  ON public.referral_codes FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Admins can view all referral codes"
  ON public.referral_codes FOR SELECT
  USING (has_role(auth.uid(), 'admin'::user_role));

-- RLS Policies for referral_conversions
CREATE POLICY "Users can view conversions from their referrals"
  ON public.referral_conversions FOR SELECT
  USING (
    referral_code_id IN (
      SELECT id FROM public.referral_codes WHERE customer_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all referral conversions"
  ON public.referral_conversions FOR SELECT
  USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "System can insert referral conversions"
  ON public.referral_conversions FOR INSERT
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_reward_actions_code ON public.reward_actions(code);
CREATE INDEX IF NOT EXISTS idx_reward_tiers_min_points ON public.reward_tiers(min_points);
CREATE INDEX IF NOT EXISTS idx_referral_codes_customer ON public.referral_codes(customer_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON public.referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_referral_conversions_referral ON public.referral_conversions(referral_code_id);
CREATE INDEX IF NOT EXISTS idx_rewards_activity_action ON public.rewards_activity(action_id);

-- Seed default reward actions
INSERT INTO public.reward_actions (code, description, points, is_active) VALUES
  ('HAIRCUT_COMPLETED', 'Earn points for every completed haircut', 10, true),
  ('REFERRAL_SIGNUP', 'Refer a friend or family member who books', 50, true),
  ('SOCIAL_SHARE', 'Share your experience on social media', 25, true),
  ('FIRST_VISIT_BONUS', 'Bonus for your first completed visit', 20, true),
  ('BIRTHDAY_BONUS', 'Special birthday bonus', 30, true)
ON CONFLICT (code) DO NOTHING;

-- Seed default reward tiers
INSERT INTO public.reward_tiers (name, min_points, discount_percent, benefits, display_order) VALUES
  ('Bronze Tier', 100, 10, ARRAY['10% off all services', 'Priority booking notifications'], 1),
  ('Silver Tier', 250, 20, ARRAY['20% off all services', 'Priority booking', 'Birthday bonus'], 2),
  ('Gold Tier', 500, 100, ARRAY['One free haircut', 'VIP treatment', 'Exclusive events'], 3)
ON CONFLICT DO NOTHING;

-- Create trigger function to update profiles.rewards_points
CREATE OR REPLACE FUNCTION public.update_rewards_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update the customer's total rewards points
  UPDATE public.profiles
  SET rewards_points = rewards_points + NEW.points_earned - NEW.points_redeemed,
      updated_at = NOW()
  WHERE id = NEW.customer_id;
  
  RETURN NEW;
END;
$$;

-- Create trigger on rewards_activity
DROP TRIGGER IF EXISTS trigger_update_rewards_points ON public.rewards_activity;
CREATE TRIGGER trigger_update_rewards_points
  AFTER INSERT ON public.rewards_activity
  FOR EACH ROW
  EXECUTE FUNCTION public.update_rewards_points();