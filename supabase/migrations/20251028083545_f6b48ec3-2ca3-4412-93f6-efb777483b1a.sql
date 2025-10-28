-- Phase 1: Guest Identity System & Payment Verification

-- 1. Create normalization functions
CREATE OR REPLACE FUNCTION public.norm_email(e text) 
RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE WHEN e IS NULL THEN NULL ELSE lower(trim(e)) END;
$$;

CREATE OR REPLACE FUNCTION public.norm_phone(p text) 
RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE WHEN p IS NULL THEN NULL ELSE regexp_replace(p, '\D', '', 'g') END;
$$;

-- 2. Extend clients table for guest tracking
ALTER TABLE public.clients 
  ADD COLUMN IF NOT EXISTS email_norm text,
  ADD COLUMN IF NOT EXISTS phone_norm text,
  ADD COLUMN IF NOT EXISTS guest boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS linked_profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS first_seen timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS account_linked_at timestamptz;

-- Update existing clients to populate normalized fields
UPDATE public.clients SET 
  email_norm = public.norm_email(email),
  phone_norm = public.norm_phone(phone);

-- Trigger to maintain normalized fields
CREATE OR REPLACE FUNCTION public.clients_set_norm() 
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.email_norm := public.norm_email(NEW.email);
  NEW.phone_norm := public.norm_phone(NEW.phone);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_clients_norm ON public.clients;
CREATE TRIGGER trg_clients_norm 
BEFORE INSERT OR UPDATE ON public.clients
FOR EACH ROW EXECUTE FUNCTION public.clients_set_norm();

-- 3. Create payment system enums and table
CREATE TYPE public.payment_method AS ENUM ('zelle', 'apple_pay', 'cash_app');
CREATE TYPE public.payment_status_enum AS ENUM ('pending', 'verified', 'rejected');

CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid UNIQUE REFERENCES public.appointments(id) ON DELETE CASCADE,
  method public.payment_method NOT NULL,
  amount_cents int NOT NULL,
  reference text,
  proof_url text,
  status public.payment_status_enum DEFAULT 'pending',
  verified_by uuid REFERENCES public.profiles(id),
  verified_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payments
CREATE POLICY "Admins can manage all payments" ON public.payments
  FOR ALL USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Customers can view their own payment" ON public.payments
  FOR SELECT USING (
    appointment_id IN (
      SELECT id FROM appointments WHERE customer_id = auth.uid()
    )
  );

CREATE POLICY "Customers can insert their own payment" ON public.payments
  FOR INSERT WITH CHECK (
    appointment_id IN (
      SELECT id FROM appointments WHERE customer_id = auth.uid()
    )
  );

CREATE POLICY "Customers can update their own pending payment" ON public.payments
  FOR UPDATE USING (
    status = 'pending' AND
    appointment_id IN (
      SELECT id FROM appointments WHERE customer_id = auth.uid()
    )
  );

-- 4. Extend appointments table for payment flags
ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS require_prepayment boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS payment_required_reason text,
  ADD COLUMN IF NOT EXISTS payment_locked boolean DEFAULT false;

-- 5. Update clients RLS for guest/linked access
DROP POLICY IF EXISTS "Customers can view their own client record" ON public.clients;
CREATE POLICY "Customers can view their own client record" ON public.clients
  FOR SELECT USING (
    linked_profile_id = auth.uid()
  );

-- 6. Create storage bucket for payment proofs
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', false)
ON CONFLICT (id) DO NOTHING;

-- RLS for payment-proofs storage
CREATE POLICY "Users can upload their payment proofs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'payment-proofs' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own proofs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'payment-proofs' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all payment proofs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'payment-proofs' AND
  has_role(auth.uid(), 'admin'::user_role)
);