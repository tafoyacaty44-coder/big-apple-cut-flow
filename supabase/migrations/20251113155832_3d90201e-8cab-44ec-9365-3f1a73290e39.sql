-- Add status_message column to barbers table
ALTER TABLE barbers ADD COLUMN IF NOT EXISTS status_message TEXT;

-- Delete duplicate Crew Cut service (keeping id: 2829f868-4307-459b-9496-8a719c9d34e2)
DELETE FROM services WHERE id = '64ef4123-df97-401e-a2c3-a59c736a8880';

-- Delete duplicate Long Hair service (keeping id: dd0fbc35-af22-4ae9-a384-432b9046f651)
DELETE FROM services WHERE id = 'cb8c5091-c873-4fe9-bcaa-988552ebf065';

-- Update ALL VIP prices to be exactly $10 less than regular prices
UPDATE services SET vip_price = regular_price - 10;