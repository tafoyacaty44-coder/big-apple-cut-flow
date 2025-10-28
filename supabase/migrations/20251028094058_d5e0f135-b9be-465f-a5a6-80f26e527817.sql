-- Create enums for schedule management
DO $$ BEGIN
  CREATE TYPE public.request_kind AS ENUM ('working_hours','breaks','day_off');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.request_status AS ENUM ('pending','approved','rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.override_kind AS ENUM ('open','closed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Schedule change requests table (barber-initiated changes)
CREATE TABLE IF NOT EXISTS public.schedule_change_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id uuid NOT NULL REFERENCES public.barbers(id) ON DELETE CASCADE,
  kind public.request_kind NOT NULL,
  
  -- Working hours fields
  weekday int,
  start_time time,
  end_time time,
  
  -- Breaks fields
  break_kind text CHECK (break_kind IS NULL OR break_kind IN ('custom', 'everyday', 'weekly')),
  date date,
  break_weekday int,
  break_start time,
  break_end time,
  
  -- Day off field
  day_off_date date,
  
  note text,
  status public.request_status DEFAULT 'pending',
  reviewed_by uuid REFERENCES public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_weekday CHECK (weekday IS NULL OR (weekday >= 0 AND weekday <= 6)),
  CONSTRAINT valid_break_weekday CHECK (break_weekday IS NULL OR (break_weekday >= 0 AND break_weekday <= 6))
);

-- Admin override table (quick availability adjustments)
CREATE TABLE IF NOT EXISTS public.availability_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id uuid NOT NULL REFERENCES public.barbers(id) ON DELETE CASCADE,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  kind public.override_kind NOT NULL,
  note text,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_schedule_requests_barber ON public.schedule_change_requests(barber_id, status);
CREATE INDEX IF NOT EXISTS idx_overrides_barber_time ON public.availability_overrides(barber_id, start_time, end_time);

-- Enable RLS
ALTER TABLE public.schedule_change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_overrides ENABLE ROW LEVEL SECURITY;

-- RLS Policies for schedule_change_requests

CREATE POLICY "Barbers can create requests" ON public.schedule_change_requests
FOR INSERT TO authenticated
WITH CHECK (
  barber_id IN (SELECT id FROM public.barbers WHERE user_id = auth.uid())
);

CREATE POLICY "Barbers can view own requests" ON public.schedule_change_requests
FOR SELECT TO authenticated
USING (
  barber_id IN (SELECT id FROM public.barbers WHERE user_id = auth.uid())
);

CREATE POLICY "Admins can view all requests" ON public.schedule_change_requests
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Admins can update requests" ON public.schedule_change_requests
FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::user_role))
WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

-- RLS Policies for availability_overrides

CREATE POLICY "Users can view overrides" ON public.availability_overrides
FOR SELECT TO authenticated
USING (
  barber_id IN (SELECT id FROM public.barbers WHERE user_id = auth.uid())
  OR has_role(auth.uid(), 'admin'::user_role)
);

CREATE POLICY "Admins can manage overrides" ON public.availability_overrides
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::user_role))
WITH CHECK (has_role(auth.uid(), 'admin'::user_role));