-- Add full_name column to barbers table
ALTER TABLE public.barbers
ADD COLUMN IF NOT EXISTS full_name text NOT NULL DEFAULT '';

-- Make user_id nullable so we can have display-only barbers without auth accounts
ALTER TABLE public.barbers
ALTER COLUMN user_id DROP NOT NULL;

-- Seed the three barbers (Igor, Dior, Lucas) with NULL user_id
INSERT INTO public.barbers (id, user_id, full_name, bio, specialties, years_experience, profile_image_url, is_active)
VALUES
  (gen_random_uuid(), NULL, 'Igor', 'Experienced barber specializing in precision cuts', ARRAY['Fades','Beard Sculpting'], 8, NULL, true),
  (gen_random_uuid(), NULL, 'Dior', 'Classic cuts specialist with attention to detail', ARRAY['Classic Cuts','Hot Towel Shaves'], 5, NULL, true),
  (gen_random_uuid(), NULL, 'Lucas', 'Modern styles expert with creative flair', ARRAY['Modern Styles','Hair Design'], 12, NULL, true)
ON CONFLICT DO NOTHING;

-- Seed availability for Igor: all days 9:00-18:00, status: "Due to a surgery, i will work part time for period time"
INSERT INTO public.barber_availability (id, barber_id, day_of_week, start_time, end_time, is_available, status_message)
SELECT gen_random_uuid(), b.id, d, '09:00:00'::time, '18:00:00'::time, true, 'Due to a surgery, i will work part time for period time'
FROM public.barbers b, generate_series(0,6) d
WHERE b.full_name = 'Igor'
ON CONFLICT DO NOTHING;

-- Seed availability for Dior: all days not available, status: "Not Available"
INSERT INTO public.barber_availability (id, barber_id, day_of_week, start_time, end_time, is_available, status_message)
SELECT gen_random_uuid(), b.id, d, '00:00:00'::time, '00:00:00'::time, false, 'Not Available'
FROM public.barbers b, generate_series(0,6) d
WHERE b.full_name = 'Dior'
ON CONFLICT DO NOTHING;

-- Seed availability for Lucas: all days 9:00-18:00 EXCEPT Wednesday (day 3), status: "Available"
INSERT INTO public.barber_availability (id, barber_id, day_of_week, start_time, end_time, is_available, status_message)
SELECT gen_random_uuid(), b.id, d,
       CASE WHEN d = 3 THEN '00:00:00'::time ELSE '09:00:00'::time END,
       CASE WHEN d = 3 THEN '00:00:00'::time ELSE '18:00:00'::time END,
       CASE WHEN d = 3 THEN false ELSE true END,
       'Available'
FROM public.barbers b, generate_series(0,6) d
WHERE b.full_name = 'Lucas'
ON CONFLICT DO NOTHING;