-- Fix infinite recursion in service_requests policies and enhance user profile system

-- Drop problematic service_requests policies
DROP POLICY IF EXISTS "Users can view their own service requests" ON service_requests;
DROP POLICY IF EXISTS "Users can create their own service requests" ON service_requests;
DROP POLICY IF EXISTS "Technicians can view relevant service requests" ON service_requests;
DROP POLICY IF EXISTS "Technicians can update assigned requests" ON service_requests;

-- Create simplified service_requests policies
CREATE POLICY "Clients can manage their service requests"
ON service_requests FOR ALL
USING (client_id = auth.uid());

CREATE POLICY "Technicians can view and update assigned requests"
ON service_requests FOR SELECT
USING (
  technician_id = auth.uid() 
  OR 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'technician'
  )
);

CREATE POLICY "Technicians can update assigned requests"
ON service_requests FOR UPDATE
USING (technician_id = auth.uid());

-- Update profiles table to support dual roles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS active_role TEXT DEFAULT 'customer';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS available_roles TEXT[] DEFAULT ARRAY['customer'];

-- Add constraint to ensure active_role is one of the available_roles
CREATE OR REPLACE FUNCTION validate_active_role()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT (NEW.active_role = ANY(NEW.available_roles)) THEN
    RAISE EXCEPTION 'Active role must be one of the available roles';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_active_role_trigger ON profiles;
CREATE TRIGGER validate_active_role_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION validate_active_role();

-- Update the handle_new_user function to set email and support dual roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
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
CREATE OR REPLACE FUNCTION switch_user_role(new_role TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles 
  SET active_role = new_role
  WHERE id = auth.uid() 
  AND new_role = ANY(available_roles);
  
  RETURN FOUND;
END;
$$;

-- Function to add a new role to user
CREATE OR REPLACE FUNCTION add_user_role(new_role TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles 
  SET available_roles = array_append(available_roles, new_role)
  WHERE id = auth.uid() 
  AND NOT (new_role = ANY(available_roles));
  
  RETURN FOUND;
END;
$$;