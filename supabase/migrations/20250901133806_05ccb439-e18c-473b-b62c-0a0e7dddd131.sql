-- Fix infinite recursion in technician_profiles RLS policies

-- Drop the problematic policies that are causing infinite recursion
DROP POLICY IF EXISTS "Technicians can view basic professional info of other technicia" ON technician_profiles;
DROP POLICY IF EXISTS "Clients can view basic technician info for active requests" ON technician_profiles;
DROP POLICY IF EXISTS "Clients can view assigned technician contact info" ON technician_profiles;

-- Create simplified, non-recursive policies
CREATE POLICY "Technicians can view other technicians basic info"
ON technician_profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'technician'
  )
);

CREATE POLICY "Clients can view technicians for their service requests"
ON technician_profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM service_requests sr
    WHERE sr.client_id = auth.uid() 
    AND (
      sr.service_type = technician_profiles.service_type 
      OR sr.technician_id = technician_profiles.user_id
    )
    AND sr.status IN ('pending', 'accepted', 'in_progress', 'completed')
  )
);

-- Allow the get_available_technicians_for_service function to work
CREATE POLICY "Allow function access to technician profiles"
ON technician_profiles FOR SELECT
USING (
  -- Allow access when called from our secure function
  current_setting('role') = 'supabase_admin'
  OR 
  -- Allow access for service matching
  is_available = true
);