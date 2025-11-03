-- Insert all missing service prices for all barber-service combinations
INSERT INTO service_prices (service_id, barber_id, default_price_cents, vip_price_cents)
SELECT 
  s.id as service_id,
  b.id as barber_id,
  CASE s.name
    WHEN 'Senior Haircut' THEN 3500
    WHEN 'Beard Trim' THEN 2500
    WHEN 'Black Mask' THEN 2000
    WHEN 'Haircut & Beard Combo' THEN 5500
    WHEN 'Haircut & Wash' THEN 4000
    WHEN 'Wiseman Special' THEN 6500
    WHEN 'Shave Add-On' THEN 1500
    WHEN 'Haircut' THEN 4000
    WHEN 'Royal Shave' THEN 4000
    ELSE 3500
  END as default_price_cents,
  CASE s.name
    WHEN 'Senior Haircut' THEN 3000
    WHEN 'Beard Trim' THEN 2000
    WHEN 'Black Mask' THEN 1500
    WHEN 'Haircut & Beard Combo' THEN 4500
    WHEN 'Haircut & Wash' THEN 3500
    WHEN 'Wiseman Special' THEN 5500
    WHEN 'Shave Add-On' THEN 1200
    WHEN 'Haircut' THEN 3500
    WHEN 'Royal Shave' THEN 3500
    ELSE 3000
  END as vip_price_cents
FROM services s
CROSS JOIN barbers b
WHERE s.is_active = true AND b.is_active = true
ON CONFLICT (service_id, barber_id) DO NOTHING;