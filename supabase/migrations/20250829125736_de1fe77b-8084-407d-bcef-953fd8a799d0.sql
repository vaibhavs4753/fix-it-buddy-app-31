-- Create user profiles table extending auth.users
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('customer', 'technician', 'admin')) DEFAULT 'customer',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create services/categories table
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('electrical', 'plumbing', 'mechanical', 'other')),
  base_price NUMERIC(10,2),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_request_id UUID REFERENCES public.service_requests(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL,
  technician_id UUID,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'usd',
  payment_method TEXT CHECK (payment_method IN ('cash', 'online', 'card', 'upi')),
  status TEXT CHECK (status IN ('pending', 'paid', 'failed', 'refunded')) DEFAULT 'pending',
  stripe_session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_request_id UUID REFERENCES public.service_requests(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL,
  technician_id UUID NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(service_request_id) -- One review per service request
);

-- Add missing columns to existing service_requests table
ALTER TABLE public.service_requests 
ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES public.services(id),
ADD COLUMN IF NOT EXISTS scheduled_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS urgency TEXT CHECK (urgency IN ('low', 'medium', 'high', 'emergency')) DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS estimated_price NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS actual_price NUMERIC(10,2);

-- Add missing columns to technician_profiles for enhanced features
ALTER TABLE public.technician_profiles 
ADD COLUMN IF NOT EXISTS experience_years INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS availability_status TEXT CHECK (availability_status IN ('available', 'busy', 'offline')) DEFAULT 'available',
ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS commission_rate NUMERIC(5,2) DEFAULT 10.00; -- Percentage for admin

-- Enable RLS on all new tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for services (public read, admin write)
CREATE POLICY "Services are viewable by everyone" ON public.services
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage services" ON public.services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create RLS policies for payments
CREATE POLICY "Users can view their own payments" ON public.payments
  FOR SELECT USING (
    auth.uid() = customer_id OR 
    auth.uid() = technician_id OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "System can create payments" ON public.payments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update payments" ON public.payments
  FOR UPDATE USING (true);

-- Create RLS policies for reviews
CREATE POLICY "Reviews are viewable by related users" ON public.reviews
  FOR SELECT USING (
    auth.uid() = customer_id OR 
    auth.uid() = technician_id OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Customers can create reviews for their completed services" ON public.reviews
  FOR INSERT WITH CHECK (
    auth.uid() = customer_id AND
    EXISTS (
      SELECT 1 FROM public.service_requests 
      WHERE id = service_request_id AND status = 'completed' AND client_id = auth.uid()
    )
  );

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    NEW.raw_user_meta_data ->> 'phone',
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Insert default service categories
INSERT INTO public.services (name, category, base_price, description) VALUES
('Electrical Wiring', 'electrical', 50.00, 'Basic electrical wiring and repairs'),
('Ceiling Fan Installation', 'electrical', 30.00, 'Install or repair ceiling fans'),
('Light Fixture Setup', 'electrical', 25.00, 'Install light fixtures and switches'),
('Plumbing Repair', 'plumbing', 40.00, 'Fix leaks, unclog drains, repair pipes'),
('Toilet Installation', 'plumbing', 75.00, 'Install or replace toilet fixtures'),
('Faucet Repair', 'plumbing', 20.00, 'Fix or replace faucets and taps'),
('AC Service', 'mechanical', 60.00, 'Air conditioner cleaning and maintenance'),
('Appliance Repair', 'mechanical', 45.00, 'Repair household appliances'),
('General Maintenance', 'other', 35.00, 'General home maintenance tasks');

-- Create indexes for better performance
CREATE INDEX idx_service_requests_client_id ON public.service_requests(client_id);
CREATE INDEX idx_service_requests_technician_id ON public.service_requests(technician_id);
CREATE INDEX idx_service_requests_status ON public.service_requests(status);
CREATE INDEX idx_technician_profiles_service_type ON public.technician_profiles(service_type);
CREATE INDEX idx_technician_profiles_availability ON public.technician_profiles(availability_status);
CREATE INDEX idx_payments_service_request ON public.payments(service_request_id);
CREATE INDEX idx_reviews_technician ON public.reviews(technician_id);