-- Create technician profiles table
CREATE TABLE public.technician_profiles (
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
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create service requests table
CREATE TABLE public.service_requests (
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
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.technician_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for technician_profiles
CREATE POLICY "Technician profiles are viewable by everyone" 
ON public.technician_profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own technician profile" 
ON public.technician_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own technician profile" 
ON public.technician_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for service_requests
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

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_technician_profiles_updated_at
  BEFORE UPDATE ON public.technician_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_requests_updated_at
  BEFORE UPDATE ON public.service_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();