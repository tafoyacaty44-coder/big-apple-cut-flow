-- Add communication preferences to clients
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS opt_in_email boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS opt_in_sms boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS locale text DEFAULT 'en';

-- Create job_status enum
DO $$ BEGIN
  CREATE TYPE public.job_status AS ENUM ('queued','sent','failed','canceled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create payment_method_enum if not exists
DO $$ BEGIN
  CREATE TYPE public.payment_method_enum AS ENUM ('zelle','apple_pay','cash_app');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create payment_status_enum if not exists
DO $$ BEGIN
  CREATE TYPE public.payment_status_enum AS ENUM ('pending','verified','rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Notifications audit log (append-only)
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid REFERENCES public.appointments(id) ON DELETE CASCADE,
  channel text CHECK (channel IN ('email','sms')) NOT NULL,
  template text CHECK (template IN ('confirmation','reminder_24h','reminder_2h','rescheduled','canceled')) NOT NULL,
  provider_message_id text,
  sent_at timestamptz DEFAULT now(),
  error text,
  created_at timestamptz DEFAULT now()
);

-- Short-lived action tokens for links
CREATE TABLE IF NOT EXISTS public.appointment_action_tokens (
  token text PRIMARY KEY,
  appointment_id uuid NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  action text CHECK (action IN ('reschedule','cancel')) NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Job queue for scheduled notifications
CREATE TABLE IF NOT EXISTS public.notification_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid REFERENCES public.appointments(id) ON DELETE CASCADE,
  channel text CHECK (channel IN ('email','sms')) NOT NULL,
  template text NOT NULL,
  scheduled_for timestamptz NOT NULL,
  attempts int DEFAULT 0,
  status public.job_status DEFAULT 'queued',
  last_error text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_action_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_jobs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins can view all notifications" ON public.notifications;
  DROP POLICY IF EXISTS "Customers can view their appointment notifications" ON public.notifications;
  DROP POLICY IF EXISTS "Anyone can view valid tokens" ON public.appointment_action_tokens;
  DROP POLICY IF EXISTS "System can insert tokens" ON public.appointment_action_tokens;
  DROP POLICY IF EXISTS "Admins can manage notification jobs" ON public.notification_jobs;
END $$;

-- RLS for notifications (admins can read all, customers can read their own)
CREATE POLICY "Admins can view all notifications"
ON public.notifications FOR SELECT
USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Customers can view their appointment notifications"
ON public.notifications FOR SELECT
USING (
  appointment_id IN (
    SELECT id FROM public.appointments
    WHERE customer_id = auth.uid()
  )
);

-- RLS for action tokens (public read by token, admin/edge write)
CREATE POLICY "Anyone can view valid tokens"
ON public.appointment_action_tokens FOR SELECT
USING (expires_at > now());

CREATE POLICY "System can insert tokens"
ON public.appointment_action_tokens FOR INSERT
WITH CHECK (true);

-- RLS for notification_jobs (admin only)
CREATE POLICY "Admins can manage notification jobs"
ON public.notification_jobs FOR ALL
USING (has_role(auth.uid(), 'admin'::user_role));

-- Index for job processing
CREATE INDEX IF NOT EXISTS idx_notification_jobs_due
ON public.notification_jobs (scheduled_for, status)
WHERE status = 'queued';