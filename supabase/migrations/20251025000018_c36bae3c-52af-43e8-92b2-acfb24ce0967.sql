-- Update existing service prices to match actual pricing
UPDATE public.services
SET regular_price = 40.00, vip_price = 50.00
WHERE name = 'Haircut';

UPDATE public.services
SET regular_price = 35.00, vip_price = 45.00
WHERE name = 'Senior Haircut';

UPDATE public.services
SET regular_price = 40.00, vip_price = 50.00
WHERE name = 'Royal Shave';

UPDATE public.services
SET regular_price = 30.00, vip_price = 40.00
WHERE name = 'Black Mask Facial';

UPDATE public.services
SET regular_price = 25.00, vip_price = 35.00
WHERE name = 'Beard Trim';

UPDATE public.services
SET regular_price = 55.00, vip_price = 65.00
WHERE name = 'Wiseman Special';

UPDATE public.services
SET regular_price = 65.00, vip_price = 75.00
WHERE name = 'Haircut and Beard Trim';

-- Add missing services
INSERT INTO public.services (name, description, regular_price, vip_price, duration_minutes, category, is_active, display_order)
VALUES 
  ('Crew Cut', 'Classic short military-style haircut with clean lines and precision fading', 35.00, 45.00, 30, 'haircut', true, 9),
  ('Long Hair', 'Expert cut and styling for longer hair lengths with attention to texture and shape', 45.00, 55.00, 60, 'haircut', true, 10);