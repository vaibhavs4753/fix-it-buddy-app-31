-- Create enhanced location tracking tables and payment improvements

-- Add real-time location tracking table for better performance
CREATE TABLE public.technician_location_real_time (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  technician_id UUID NOT NULL,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  accuracy INTEGER,
  heading DECIMAL(5, 2),
  speed DECIMAL(6, 2),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'offline')),
  battery_level INTEGER,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for real-time location
ALTER TABLE public.technician_location_real_time ENABLE ROW LEVEL SECURITY;

-- Policies for real-time location
CREATE POLICY "Technicians can manage their own real-time location" 
ON public.technician_location_real_time 
FOR ALL 
USING (auth.uid() = technician_id)
WITH CHECK (auth.uid() = technician_id);

CREATE POLICY "Clients can view assigned technician location" 
ON public.technician_location_real_time 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM service_requests sr 
    WHERE sr.technician_id = technician_location_real_time.technician_id 
    AND sr.client_id = auth.uid()
    AND sr.status IN ('accepted', 'in_progress')
  )
);

-- Enable realtime for technician location updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.technician_location_real_time;

-- Add booking status tracking
ALTER TABLE public.service_requests 
ADD COLUMN IF NOT EXISTS tracking_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS estimated_arrival TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS distance_km DECIMAL(6, 2),
ADD COLUMN IF NOT EXISTS travel_time_minutes INTEGER;

-- Enhanced payments table with Razorpay integration
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT,
ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT,
ADD COLUMN IF NOT EXISTS razorpay_signature TEXT,
ADD COLUMN IF NOT EXISTS payment_gateway TEXT DEFAULT 'razorpay',
ADD COLUMN IF NOT EXISTS failure_reason TEXT,
ADD COLUMN IF NOT EXISTS refund_id TEXT,
ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS payment_captured BOOLEAN DEFAULT false;

-- Add minimum booking charge configuration
INSERT INTO public.services (name, category, description, base_price, is_active) 
VALUES 
  ('Minimum Booking Charge', 'service_fee', 'Basic minimum charge to book any technician service', 299.00, true)
ON CONFLICT DO NOTHING;

-- Create trigger for automatic location cleanup (keep only last 24 hours)
CREATE OR REPLACE FUNCTION public.cleanup_old_location_data()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.technician_location_real_time 
  WHERE technician_id = NEW.technician_id 
  AND created_at < (now() - interval '24 hours');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cleanup_location_trigger
  AFTER INSERT ON public.technician_location_real_time
  FOR EACH ROW
  EXECUTE FUNCTION public.cleanup_old_location_data();

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_technician_location_real_time_technician_id ON public.technician_location_real_time(technician_id);
CREATE INDEX IF NOT EXISTS idx_technician_location_real_time_updated_at ON public.technician_location_real_time(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_service_requests_tracking ON public.service_requests(tracking_enabled, status);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay ON public.payments(razorpay_order_id, razorpay_payment_id);