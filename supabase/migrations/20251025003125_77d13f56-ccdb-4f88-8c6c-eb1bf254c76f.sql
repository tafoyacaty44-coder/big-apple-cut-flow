-- Add status_message column to barber_availability
ALTER TABLE public.barber_availability 
ADD COLUMN IF NOT EXISTS status_message text;