-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE public.user_role AS ENUM ('customer', 'barber', 'admin');
CREATE TYPE public.appointment_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'no_show');
CREATE TYPE public.payment_status AS ENUM ('none', 'deposit_paid', 'fully_paid');
CREATE TYPE public.service_category AS ENUM ('haircut', 'shave', 'combo', 'treatment');
CREATE TYPE public.reward_action AS ENUM ('review', 'checkin', 'referral', 'social_share', 'redeemed');

-- Create profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  rewards_points INTEGER DEFAULT 0 NOT NULL,
  first_time_customer BOOLEAN DEFAULT true NOT NULL,
  preferred_barber_id UUID,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create user_roles table (separate for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, role)
);

-- Create barbers table
CREATE TABLE public.barbers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  bio TEXT,
  specialties TEXT[] DEFAULT '{}',
  years_experience INTEGER DEFAULT 0,
  profile_image_url TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create services table
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  regular_price DECIMAL(10,2) NOT NULL,
  vip_price DECIMAL(10,2) NOT NULL,
  duration_minutes INTEGER NOT NULL,
  image_url TEXT,
  category service_category NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create barber_availability table
CREATE TABLE public.barber_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  barber_id UUID REFERENCES public.barbers(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(barber_id, day_of_week)
);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  confirmation_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_name TEXT,
  guest_email TEXT,
  guest_phone TEXT,
  barber_id UUID REFERENCES public.barbers(id) ON DELETE SET NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status appointment_status DEFAULT 'pending' NOT NULL,
  payment_status payment_status DEFAULT 'none' NOT NULL,
  payment_amount DECIMAL(10,2),
  stripe_payment_intent_id TEXT,
  cancellation_deadline TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT guest_or_customer_required CHECK (
    (customer_id IS NOT NULL) OR 
    (guest_name IS NOT NULL AND guest_email IS NOT NULL)
  )
);

-- Create index for faster appointment lookups
CREATE INDEX idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX idx_appointments_barber ON public.appointments(barber_id);
CREATE INDEX idx_appointments_customer ON public.appointments(customer_id);
CREATE INDEX idx_appointments_confirmation ON public.appointments(confirmation_number);

-- Create rewards_activity table
CREATE TABLE public.rewards_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action_type reward_action NOT NULL,
  points_earned INTEGER DEFAULT 0,
  points_redeemed INTEGER DEFAULT 0,
  related_appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barber_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards_activity ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for user_roles (admin only)
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for barbers (public read)
CREATE POLICY "Anyone can view active barbers"
  ON public.barbers FOR SELECT
  USING (is_active = true);

CREATE POLICY "Barbers can update their own profile"
  ON public.barbers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage barbers"
  ON public.barbers FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for services (public read)
CREATE POLICY "Anyone can view active services"
  ON public.services FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage services"
  ON public.services FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for barber_availability (public read)
CREATE POLICY "Anyone can view barber availability"
  ON public.barber_availability FOR SELECT
  USING (true);

CREATE POLICY "Barbers can manage their own availability"
  ON public.barber_availability FOR ALL
  USING (barber_id IN (SELECT id FROM public.barbers WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all availability"
  ON public.barber_availability FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for appointments
CREATE POLICY "Customers can view their own appointments"
  ON public.appointments FOR SELECT
  USING (auth.uid() = customer_id);

CREATE POLICY "Customers can create appointments"
  ON public.appointments FOR INSERT
  WITH CHECK (auth.uid() = customer_id OR customer_id IS NULL);

CREATE POLICY "Customers can update their own appointments"
  ON public.appointments FOR UPDATE
  USING (auth.uid() = customer_id);

CREATE POLICY "Barbers can view their appointments"
  ON public.appointments FOR SELECT
  USING (barber_id IN (SELECT id FROM public.barbers WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all appointments"
  ON public.appointments FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for rewards_activity
CREATE POLICY "Customers can view their own rewards"
  ON public.rewards_activity FOR SELECT
  USING (auth.uid() = customer_id);

CREATE POLICY "System can insert rewards"
  ON public.rewards_activity FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Admins can manage all rewards"
  ON public.rewards_activity FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );
  
  -- Default role is customer
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to generate confirmation numbers
CREATE OR REPLACE FUNCTION public.generate_confirmation_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- Create trigger to auto-generate confirmation numbers
CREATE OR REPLACE FUNCTION public.set_confirmation_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.confirmation_number IS NULL THEN
    NEW.confirmation_number := public.generate_confirmation_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_appointment_confirmation_number
  BEFORE INSERT ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.set_confirmation_number();