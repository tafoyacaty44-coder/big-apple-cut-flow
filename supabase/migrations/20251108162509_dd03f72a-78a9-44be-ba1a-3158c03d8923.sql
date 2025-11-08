-- Fix the security definer view issue by setting security_invoker=on
-- This ensures the view respects RLS policies of the underlying tables
CREATE OR REPLACE VIEW barber_clients 
WITH (security_invoker=on)
AS
SELECT DISTINCT
  c.id,
  c.full_name,
  c.created_at,
  c.first_seen,
  a.barber_id,
  -- Excluded: email, phone, email_norm, phone_norm, linked_profile_id
  -- Count of appointments
  (SELECT COUNT(*) 
   FROM appointments 
   WHERE client_id = c.id AND barber_id = a.barber_id
  ) as appointment_count,
  -- Last appointment date
  (SELECT MAX(appointment_date) 
   FROM appointments 
   WHERE client_id = c.id AND barber_id = a.barber_id
  ) as last_appointment_date
FROM clients c
INNER JOIN appointments a ON a.client_id = c.id
WHERE a.barber_id IS NOT NULL;