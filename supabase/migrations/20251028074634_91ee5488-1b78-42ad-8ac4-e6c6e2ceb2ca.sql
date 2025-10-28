-- Add clients table for guest bookings
CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  phone text,
  email text,
  created_at timestamptz DEFAULT now()
);

-- Add client notes with photo support
CREATE TABLE public.client_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  barber_id uuid REFERENCES public.barbers(id) ON DELETE SET NULL,
  note text,
  photo_url text,
  created_at timestamptz DEFAULT now()
);

-- Add service prices per barber (default + VIP)
CREATE TABLE public.service_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  barber_id uuid REFERENCES public.barbers(id) ON DELETE CASCADE,
  default_price_cents int NOT NULL CHECK (default_price_cents >= 0),
  vip_price_cents int,
  UNIQUE(service_id, barber_id)
);

-- Add VIP settings (single row)
CREATE TABLE public.vip_settings (
  id int PRIMARY KEY DEFAULT 1,
  enabled boolean DEFAULT false,
  vip_code text,
  CONSTRAINT single_row CHECK (id = 1)
);

-- Insert default VIP settings
INSERT INTO public.vip_settings (id, enabled, vip_code) 
VALUES (1, false, '111')
ON CONFLICT (id) DO NOTHING;

-- Add working hours template per barber
CREATE TABLE public.working_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id uuid REFERENCES public.barbers(id) ON DELETE CASCADE,
  weekday int NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  UNIQUE(barber_id, weekday)
);

-- Add breaks (custom/everyday/weekly)
CREATE TABLE public.breaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id uuid REFERENCES public.barbers(id) ON DELETE CASCADE,
  type text CHECK (type IN ('custom','everyday','weekly')) NOT NULL,
  date date,
  weekday int CHECK (weekday BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  note text
);

-- Add days off
CREATE TABLE public.days_off (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id uuid REFERENCES public.barbers(id) ON DELETE CASCADE,
  date date NOT NULL,
  UNIQUE(barber_id, date)
);

-- Modify appointments to add token, client_id, vip_applied
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS token text UNIQUE;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS vip_applied boolean DEFAULT false;

-- Function to generate numeric tokens
CREATE OR REPLACE FUNCTION public.generate_appointment_token()
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN floor(random() * 9000000000 + 1000000000)::text;
END;
$$;

-- Trigger to auto-generate token for appointments
CREATE OR REPLACE FUNCTION public.set_appointment_token()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.token IS NULL THEN
    NEW.token := public.generate_appointment_token();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_appointment_token_trigger ON public.appointments;
CREATE TRIGGER set_appointment_token_trigger
  BEFORE INSERT ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.set_appointment_token();

-- Add notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid REFERENCES public.appointments(id) ON DELETE CASCADE,
  channel text CHECK (channel IN ('email','sms')),
  type text CHECK (type IN ('confirmation','reminder','rescheduled','canceled')),
  sent_at timestamptz DEFAULT now()
);

-- RLS Policies

-- Clients: admins and barbers can read/write; customers can read their own
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage clients"
ON public.clients FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Barbers can manage clients"
ON public.clients FOR ALL
USING (has_role(auth.uid(), 'barber'));

CREATE POLICY "Anyone can insert clients (for guest bookings)"
ON public.clients FOR INSERT
WITH CHECK (true);

-- Client notes
ALTER TABLE public.client_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage client notes"
ON public.client_notes FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Barbers can manage client notes"
ON public.client_notes FOR ALL
USING (has_role(auth.uid(), 'barber'));

-- Service prices
ALTER TABLE public.service_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view service prices"
ON public.service_prices FOR SELECT
USING (true);

CREATE POLICY "Admins can manage service prices"
ON public.service_prices FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- VIP settings
ALTER TABLE public.vip_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view VIP settings"
ON public.vip_settings FOR SELECT
USING (true);

CREATE POLICY "Admins can manage VIP settings"
ON public.vip_settings FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Working hours
ALTER TABLE public.working_hours ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view working hours"
ON public.working_hours FOR SELECT
USING (true);

CREATE POLICY "Admins can manage working hours"
ON public.working_hours FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Barbers can manage their own working hours"
ON public.working_hours FOR ALL
USING (barber_id IN (SELECT id FROM barbers WHERE user_id = auth.uid()));

-- Breaks
ALTER TABLE public.breaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view breaks"
ON public.breaks FOR SELECT
USING (true);

CREATE POLICY "Admins can manage breaks"
ON public.breaks FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Barbers can manage their own breaks"
ON public.breaks FOR ALL
USING (barber_id IN (SELECT id FROM barbers WHERE user_id = auth.uid()));

-- Days off
ALTER TABLE public.days_off ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view days off"
ON public.days_off FOR SELECT
USING (true);

CREATE POLICY "Admins can manage days off"
ON public.days_off FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Barbers can manage their own days off"
ON public.days_off FOR ALL
USING (barber_id IN (SELECT id FROM barbers WHERE user_id = auth.uid()));

-- Notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all notifications"
ON public.notifications FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Update appointments RLS to allow token-based access
CREATE POLICY "Anyone can view appointments by token"
ON public.appointments FOR SELECT
USING (true);

CREATE POLICY "Anyone can update appointments by token"
ON public.appointments FOR UPDATE
USING (true);