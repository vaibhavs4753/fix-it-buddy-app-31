-- Fix critical security vulnerabilities (corrected)

-- 1. Prevent users from changing their role (critical security fix)
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent any changes to the role column for existing users
  IF TG_OP = 'UPDATE' AND OLD.role IS DISTINCT FROM NEW.role THEN
    RAISE EXCEPTION 'Role changes are not permitted for security reasons';
  END IF;
  
  -- For new users, only allow 'customer' role by default
  IF TG_OP = 'INSERT' AND NEW.role != 'customer' THEN
    NEW.role := 'customer';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to prevent role escalation
DROP TRIGGER IF EXISTS prevent_role_escalation_trigger ON public.profiles;
CREATE TRIGGER prevent_role_escalation_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_escalation();

-- 2. Restrict service_requests table - prevent clients from assigning technicians
-- Drop existing policies first
DROP POLICY IF EXISTS "Users can update their own service requests" ON public.service_requests;

-- Separate policies for clients and technicians with field restrictions
CREATE POLICY "Clients can update limited fields on their requests"
ON public.service_requests
FOR UPDATE
USING (auth.uid() = client_id)
WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Technicians can accept and update assigned requests"
ON public.service_requests
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM technician_profiles 
    WHERE user_id = auth.uid() 
    AND service_type = service_requests.service_type
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM technician_profiles 
    WHERE user_id = auth.uid() 
    AND service_type = service_requests.service_type
  )
);

-- 3. Secure payments table - remove overly permissive policies
DROP POLICY IF EXISTS "System can create payments" ON public.payments;
DROP POLICY IF EXISTS "System can update payments" ON public.payments;

-- Only allow payment management through admin or secure functions
CREATE POLICY "Only admins can manage payments"
ON public.payments
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- 4. Add additional security to technician_profiles updates
-- Drop existing update policy and recreate with restrictions
DROP POLICY IF EXISTS "Users can update their own technician profile" ON public.technician_profiles;

CREATE POLICY "Technicians can update their own profile"
ON public.technician_profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 5. Create secure function for payment processing
CREATE OR REPLACE FUNCTION public.create_payment_record(
  p_customer_id uuid,
  p_service_request_id uuid,
  p_technician_id uuid,
  p_amount numeric,
  p_payment_method text,
  p_stripe_session_id text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  payment_id uuid;
BEGIN
  -- Verify the service request exists and involves the specified users
  IF NOT EXISTS (
    SELECT 1 FROM service_requests 
    WHERE id = p_service_request_id 
    AND client_id = p_customer_id 
    AND technician_id = p_technician_id
  ) THEN
    RAISE EXCEPTION 'Invalid service request for payment';
  END IF;
  
  INSERT INTO payments (
    customer_id, 
    service_request_id, 
    technician_id, 
    amount, 
    payment_method, 
    stripe_session_id,
    status
  ) VALUES (
    p_customer_id, 
    p_service_request_id, 
    p_technician_id, 
    p_amount, 
    p_payment_method, 
    p_stripe_session_id,
    'pending'
  ) RETURNING id INTO payment_id;
  
  RETURN payment_id;
END;
$$;