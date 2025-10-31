-- Create blacklisted_customers table
CREATE TABLE public.blacklisted_customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_norm text,
  email_norm text,
  reason text,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  CONSTRAINT at_least_one_identifier CHECK (
    phone_norm IS NOT NULL OR email_norm IS NOT NULL
  )
);

-- Create indexes for fast lookups
CREATE INDEX idx_blacklist_phone ON public.blacklisted_customers(phone_norm);
CREATE INDEX idx_blacklist_email ON public.blacklisted_customers(email_norm);

-- Enable RLS
ALTER TABLE public.blacklisted_customers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage blacklist"
ON public.blacklisted_customers FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::user_role))
WITH CHECK (has_role(auth.uid(), 'admin'::user_role));