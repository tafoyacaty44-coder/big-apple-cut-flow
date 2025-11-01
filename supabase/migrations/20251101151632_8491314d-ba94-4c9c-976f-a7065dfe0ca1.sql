-- Add venmo to payment_method enum type
ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'venmo';