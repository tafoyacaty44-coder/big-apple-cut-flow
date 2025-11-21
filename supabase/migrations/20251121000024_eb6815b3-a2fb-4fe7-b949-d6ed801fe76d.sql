-- Phase 1b: Create database tables, functions, and RLS policies

-- ==========================================
-- 1. CREATE CORE SECURITY FUNCTIONS
-- ==========================================

-- Function to check if user is master admin
CREATE OR REPLACE FUNCTION public.is_master_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'master_admin'::user_role
  )
$$;

-- Function to check role access (master admins have all privileges)
CREATE OR REPLACE FUNCTION public.check_role_access(_user_id uuid, _required_role user_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    CASE 
      WHEN public.is_master_admin(_user_id) THEN true
      WHEN public.has_role(_user_id, _required_role) THEN true
      ELSE false
    END
$$;

-- ==========================================
-- 2. CREATE BUSINESS CONFIGURATION TABLES
-- ==========================================

-- Business configuration table (single row per project)
CREATE TABLE IF NOT EXISTS public.business_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name text NOT NULL,
  business_type text NOT NULL DEFAULT 'barbershop',
  staff_title text DEFAULT 'Barber',
  service_title text DEFAULT 'Service',
  primary_color text DEFAULT '#D4AF37',
  accent_color text DEFAULT '#1A1A1A',
  logo_url text,
  hero_image_url text,
  currency text DEFAULT 'USD',
  timezone text DEFAULT 'America/Chicago',
  phone text,
  email text,
  address text,
  is_setup_complete boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Business template definitions
CREATE TABLE IF NOT EXISTS public.business_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  business_type text NOT NULL,
  description text,
  config_json jsonb NOT NULL,
  preview_image_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Template service definitions (for seeding)
CREATE TABLE IF NOT EXISTS public.template_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES public.business_templates(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text,
  duration_minutes int,
  regular_price numeric,
  vip_price numeric,
  description text,
  sort_order int DEFAULT 0
);

-- Applied template tracking
CREATE TABLE IF NOT EXISTS public.applied_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES public.business_templates(id),
  applied_by uuid REFERENCES auth.users(id),
  applied_at timestamptz DEFAULT now(),
  config_snapshot jsonb
);

-- Terminology overrides table
CREATE TABLE IF NOT EXISTS public.terminology (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  term_key text NOT NULL UNIQUE,
  display_value text NOT NULL,
  plural_value text,
  updated_at timestamptz DEFAULT now()
);

-- Admin actions audit log
CREATE TABLE IF NOT EXISTS public.admin_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid REFERENCES auth.users(id),
  action_type text NOT NULL,
  target_table text,
  target_id uuid,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

-- ==========================================
-- 3. ENABLE ROW LEVEL SECURITY
-- ==========================================

ALTER TABLE public.business_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applied_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.terminology ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 4. CREATE RLS POLICIES FOR NEW TABLES
-- ==========================================

-- business_config policies
CREATE POLICY "Anyone can view business config"
ON public.business_config
FOR SELECT
USING (true);

CREATE POLICY "Master admins can manage business config"
ON public.business_config
FOR ALL
USING (public.is_master_admin(auth.uid()))
WITH CHECK (public.is_master_admin(auth.uid()));

CREATE POLICY "Admins can manage business config"
ON public.business_config
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::user_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::user_role));

-- business_templates policies
CREATE POLICY "Anyone can view active templates"
ON public.business_templates
FOR SELECT
USING (is_active = true OR public.is_master_admin(auth.uid()));

CREATE POLICY "Master admins can manage templates"
ON public.business_templates
FOR ALL
USING (public.is_master_admin(auth.uid()))
WITH CHECK (public.is_master_admin(auth.uid()));

-- template_services policies
CREATE POLICY "Anyone can view template services"
ON public.template_services
FOR SELECT
USING (true);

CREATE POLICY "Master admins can manage template services"
ON public.template_services
FOR ALL
USING (public.is_master_admin(auth.uid()))
WITH CHECK (public.is_master_admin(auth.uid()));

-- applied_templates policies
CREATE POLICY "Admins can view applied templates"
ON public.applied_templates
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::user_role) OR public.is_master_admin(auth.uid()));

CREATE POLICY "Master admins can manage applied templates"
ON public.applied_templates
FOR ALL
USING (public.is_master_admin(auth.uid()))
WITH CHECK (public.is_master_admin(auth.uid()));

-- terminology policies
CREATE POLICY "Anyone can view terminology"
ON public.terminology
FOR SELECT
USING (true);

CREATE POLICY "Master admins can manage terminology"
ON public.terminology
FOR ALL
USING (public.is_master_admin(auth.uid()))
WITH CHECK (public.is_master_admin(auth.uid()));

CREATE POLICY "Admins can manage terminology"
ON public.terminology
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::user_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::user_role));

-- admin_actions policies
CREATE POLICY "Master admins can view all admin actions"
ON public.admin_actions
FOR SELECT
USING (public.is_master_admin(auth.uid()));

CREATE POLICY "System can insert admin actions"
ON public.admin_actions
FOR INSERT
WITH CHECK (true);

-- ==========================================
-- 5. UPDATE EXISTING TABLE POLICIES
-- ==========================================

-- Add master admin policies to appointments
CREATE POLICY "Master admins have full access to appointments"
ON public.appointments
FOR ALL
USING (public.is_master_admin(auth.uid()))
WITH CHECK (public.is_master_admin(auth.uid()));

-- Add master admin policies to barbers
CREATE POLICY "Master admins can manage all barbers"
ON public.barbers
FOR ALL
USING (public.is_master_admin(auth.uid()))
WITH CHECK (public.is_master_admin(auth.uid()));

-- Add master admin policies to services
CREATE POLICY "Master admins can manage all services"
ON public.services
FOR ALL
USING (public.is_master_admin(auth.uid()))
WITH CHECK (public.is_master_admin(auth.uid()));

-- Add master admin policies to clients
CREATE POLICY "Master admins can manage all clients"
ON public.clients
FOR ALL
USING (public.is_master_admin(auth.uid()))
WITH CHECK (public.is_master_admin(auth.uid()));

-- Add master admin policies to profiles
CREATE POLICY "Master admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.is_master_admin(auth.uid()));

CREATE POLICY "Master admins can update all profiles"
ON public.profiles
FOR UPDATE
USING (public.is_master_admin(auth.uid()))
WITH CHECK (public.is_master_admin(auth.uid()));

-- Add master admin policies to payments
CREATE POLICY "Master admins have full access to payments"
ON public.payments
FOR ALL
USING (public.is_master_admin(auth.uid()))
WITH CHECK (public.is_master_admin(auth.uid()));

-- Add master admin policies to gallery_images
CREATE POLICY "Master admins have full access to gallery"
ON public.gallery_images
FOR ALL
USING (public.is_master_admin(auth.uid()))
WITH CHECK (public.is_master_admin(auth.uid()));

-- Add master admin policies to blog_posts
CREATE POLICY "Master admins have full access to blog posts"
ON public.blog_posts
FOR ALL
USING (public.is_master_admin(auth.uid()))
WITH CHECK (public.is_master_admin(auth.uid()));

-- Add master admin policies to rewards_activity
CREATE POLICY "Master admins have full access to rewards"
ON public.rewards_activity
FOR ALL
USING (public.is_master_admin(auth.uid()))
WITH CHECK (public.is_master_admin(auth.uid()));

-- Add master admin policies to promotional_campaigns
CREATE POLICY "Master admins have full access to campaigns"
ON public.promotional_campaigns
FOR ALL
USING (public.is_master_admin(auth.uid()))
WITH CHECK (public.is_master_admin(auth.uid()));

-- ==========================================
-- 6. SEED DEFAULT TERMINOLOGY
-- ==========================================

INSERT INTO public.terminology (term_key, display_value, plural_value) VALUES
  ('staff', 'Barber', 'Barbers'),
  ('service', 'Service', 'Services'),
  ('appointment', 'Appointment', 'Appointments'),
  ('customer', 'Customer', 'Customers')
ON CONFLICT (term_key) DO NOTHING;

-- ==========================================
-- 7. CREATE TRIGGERS FOR UPDATED_AT
-- ==========================================

CREATE TRIGGER update_business_config_updated_at
BEFORE UPDATE ON public.business_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_terminology_updated_at
BEFORE UPDATE ON public.terminology
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();