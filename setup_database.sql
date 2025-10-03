-- EFIX Database Setup Script
-- Run this in your Supabase SQL Editor to set up all required tables and functions
-- Go to: https://supabase.com/dashboard/project/evhorhcqnomgbvvufxnt/sql/new

-- ========================================
-- 1. CREATE CORE TABLES
-- ========================================

-- Create user profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('customer', 'technician', 'admin')) DEFAULT 'customer',
  avatar_url TEXT,
  email TEXT,
  active_role TEXT DEFAULT 'customer',
  available_roles TEXT[] DEFAULT ARRAY['customer'],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create technician profiles table
CREATE TABLE IF NOT EXISTS public.technician_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  service_type TEXT NOT NULL CHECK (service_type IN ('electrician', 'mechanic', 'plumber')),
  description TEXT,
  rating DECIMAL(2,1) DEFAULT 4.5 CHECK (rating >= 0 AND rating <= 5),
  is_available BOOLEAN DEFAULT true,
  current_location_lat DECIMAL(10, 8),
  current_location_lng DECIMAL(11, 8),
  profile_image_url TEXT,
  experience_years INTEGER DEFAULT 0,
  availability_status TEXT CHECK (availability_status IN ('available', 'busy', 'offline')) DEFAULT 'available',
  hourly_rate NUMERIC(10,2),
  commission_rate NUMERIC(5,2) DEFAULT 10.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create service requests table
CREATE TABLE IF NOT EXISTS public.service_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  technician_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  service_type TEXT NOT NULL CHECK (service_type IN ('electrician', 'mechanic', 'plumber')),
  description TEXT NOT NULL,
  media_urls TEXT[] DEFAULT '{}',
  media_type TEXT DEFAULT 'none' CHECK (media_type IN ('image', 'video', 'audio', 'none')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'cancelled')),
  location_lat DECIMAL(10, 8) NOT NULL,
  location_lng DECIMAL(11, 8) NOT NULL,
  location_address TEXT NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('cash', 'online')),
  is_visit_required BOOLEAN DEFAULT false,
  scheduled_time TIMESTAMPTZ,
  urgency TEXT CHECK (urgency IN ('low', 'medium', 'high', 'emergency')) DEFAULT 'medium',
  estimated_price NUMERIC(10,2),
  actual_price NUMERIC(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ========================================
-- 2. CREATE FUNCTIONS AND TRIGGERS
-- ========================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, phone, role, email, active_role, available_roles)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    NEW.raw_user_meta_data ->> 'phone',
    COALESCE(NEW.raw_user_meta_data ->> 'userType', 'customer'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'userType', 'customer'),
    ARRAY[COALESCE(NEW.raw_user_meta_data ->> 'userType', 'customer')]
  );
  RETURN NEW;
END;
$$;

-- Function to switch user role
CREATE OR REPLACE FUNCTION public.switch_user_role(new_role TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles 
  SET active_role = new_role
  WHERE id = auth.uid() AND new_role = ANY(available_roles);
END;
$$;

-- Function to add new role to user
CREATE OR REPLACE FUNCTION public.add_user_role(new_role TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles 
  SET available_roles = array_append(available_roles, new_role)
  WHERE id = auth.uid() AND NOT (new_role = ANY(available_roles));
END;
$$;

-- ========================================
-- 3. CREATE TRIGGERS
-- ========================================

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_technician_profiles_updated_at ON public.technician_profiles;
DROP TRIGGER IF EXISTS update_service_requests_updated_at ON public.service_requests;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create triggers for timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_technician_profiles_updated_at
  BEFORE UPDATE ON public.technician_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_requests_updated_at
  BEFORE UPDATE ON public.service_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ========================================
-- 4. ENABLE ROW LEVEL SECURITY
-- ========================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technician_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 5. CREATE RLS POLICIES
-- ========================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public read access to technician profiles" ON public.technician_profiles;
DROP POLICY IF EXISTS "Users can insert their own technician profile" ON public.technician_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.technician_profiles;
DROP POLICY IF EXISTS "Users can view their own service requests as client" ON public.service_requests;
DROP POLICY IF EXISTS "Technicians can view requests for their service type" ON public.service_requests;
DROP POLICY IF EXISTS "Users can create their own service requests" ON public.service_requests;
DROP POLICY IF EXISTS "Users can update their own service requests" ON public.service_requests;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Technician profiles policies
CREATE POLICY "Public read access to technician profiles" 
ON public.technician_profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own technician profile" 
ON public.technician_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" 
ON public.technician_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Service requests policies
CREATE POLICY "Users can view their own service requests as client" 
ON public.service_requests 
FOR SELECT 
USING (auth.uid() = client_id OR auth.uid() = technician_id);

CREATE POLICY "Technicians can view requests for their service type" 
ON public.service_requests 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.technician_profiles 
    WHERE user_id = auth.uid() 
    AND service_type = service_requests.service_type
  )
);

CREATE POLICY "Users can create their own service requests" 
ON public.service_requests 
FOR INSERT 
WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Users can update their own service requests" 
ON public.service_requests 
FOR UPDATE 
USING (auth.uid() = client_id OR auth.uid() = technician_id);

-- ========================================
-- SETUP COMPLETE!
-- ========================================
-- After running this script, your authentication should work properly.
-- The app will now automatically create user profiles when someone signs up.
