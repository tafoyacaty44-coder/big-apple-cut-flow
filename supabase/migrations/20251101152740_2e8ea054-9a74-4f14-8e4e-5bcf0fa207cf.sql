-- Add add-on services to the services table
INSERT INTO services (name, description, regular_price, vip_price, duration_minutes, category, is_active, display_order)
VALUES 
('Shave Add-On', 'Classic straight razor shave to complement your haircut', 15, 12, 15, 'addon', true, 100),
('Blade Line Up', 'Precision edge-up for sharp, clean lines', 10, 8, 10, 'addon', true, 101),
('Hot Towel Treatment', 'Relaxing hot towel service with premium oils', 8, 6, 10, 'addon', true, 102);

-- Create appointment_addons junction table
CREATE TABLE appointment_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  addon_service_id UUID NOT NULL REFERENCES services(id),
  price_paid NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE appointment_addons ENABLE ROW LEVEL SECURITY;

-- Customers can view their own appointment add-ons
CREATE POLICY "Customers can view their appointment addons"
ON appointment_addons FOR SELECT
USING (
  appointment_id IN (
    SELECT id FROM appointments WHERE customer_id = auth.uid()
  )
);

-- Staff can view all appointment add-ons
CREATE POLICY "Staff can view all appointment addons"
ON appointment_addons FOR SELECT
USING (has_role(auth.uid(), 'admin'::user_role) OR has_role(auth.uid(), 'barber'::user_role));

-- System can insert appointment add-ons during booking
CREATE POLICY "System can insert appointment addons"
ON appointment_addons FOR INSERT
WITH CHECK (true);

-- Admins can manage all appointment add-ons
CREATE POLICY "Admins can manage appointment addons"
ON appointment_addons FOR ALL
USING (has_role(auth.uid(), 'admin'::user_role));