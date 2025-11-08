-- Create a view that shows only non-sensitive client data for barbers
CREATE OR REPLACE VIEW barber_clients AS
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

-- Grant SELECT permissions to authenticated users
GRANT SELECT ON barber_clients TO authenticated;

-- Drop the overly permissive policy on clients table
DROP POLICY IF EXISTS "Barbers can manage clients" ON clients;

-- Create more restrictive policy for barbers on clients table
CREATE POLICY "Barbers can view client names for their appointments"
ON clients
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'barber') 
  AND id IN (
    SELECT DISTINCT client_id 
    FROM appointments 
    WHERE barber_id IN (
      SELECT id FROM barbers WHERE user_id = auth.uid()
    )
    AND client_id IS NOT NULL
  )
);