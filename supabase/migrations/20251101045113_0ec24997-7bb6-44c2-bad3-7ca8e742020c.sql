-- Update handle_new_user function to auto-link existing client profiles
-- When a user signs up, check if their email or phone matches an existing client
-- and automatically link the profile

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  matching_client_id UUID;
BEGIN
  -- First create the profile as before
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );
  
  -- Default role is customer
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer');
  
  -- Check if there's an existing client record with matching email or phone
  SELECT id INTO matching_client_id
  FROM public.clients
  WHERE (email_norm = public.norm_email(NEW.email) AND email_norm IS NOT NULL)
     OR (phone_norm = public.norm_phone(COALESCE(NEW.raw_user_meta_data->>'phone', '')) AND phone_norm IS NOT NULL)
  LIMIT 1;
  
  -- If found, link the client to this profile (claim the account)
  IF matching_client_id IS NOT NULL THEN
    UPDATE public.clients
    SET linked_profile_id = NEW.id,
        account_linked_at = NOW(),
        guest = false
    WHERE id = matching_client_id;
  END IF;
  
  RETURN NEW;
END;
$$;