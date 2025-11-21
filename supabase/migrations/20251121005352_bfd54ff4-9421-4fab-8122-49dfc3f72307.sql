-- Initialize business_config if it doesn't exist
INSERT INTO business_config (
  business_name, 
  business_type,
  primary_color,
  accent_color,
  staff_title,
  service_title,
  timezone,
  currency,
  background_opacity,
  is_setup_complete
)
SELECT 
  'Big Apple Barbers - East Village',
  'barbershop',
  '#D4AF37',
  '#1A1A1A',
  'Barber',
  'Service',
  'America/New_York',
  'USD',
  0.35,
  false
WHERE NOT EXISTS (SELECT 1 FROM business_config LIMIT 1);