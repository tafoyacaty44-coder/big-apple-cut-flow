-- Fix security warnings: Set search_path for normalization functions

CREATE OR REPLACE FUNCTION public.norm_email(e text) 
RETURNS text 
LANGUAGE sql 
IMMUTABLE 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE WHEN e IS NULL THEN NULL ELSE lower(trim(e)) END;
$$;

CREATE OR REPLACE FUNCTION public.norm_phone(p text) 
RETURNS text 
LANGUAGE sql 
IMMUTABLE 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE WHEN p IS NULL THEN NULL ELSE regexp_replace(p, '\D', '', 'g') END;
$$;

CREATE OR REPLACE FUNCTION public.clients_set_norm() 
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.email_norm := public.norm_email(NEW.email);
  NEW.phone_norm := public.norm_phone(NEW.phone);
  RETURN NEW;
END;
$$;