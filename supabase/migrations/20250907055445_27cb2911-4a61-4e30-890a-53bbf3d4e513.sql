-- Fix the infinite recursion issue in technician_profiles RLS policies
-- First, drop the conflicting policies that are causing recursion
DROP POLICY IF EXISTS "Technicians can view their own complete profile" ON technician_profiles;
DROP POLICY IF EXISTS "Technicians can update their own profile" ON technician_profiles;
DROP POLICY IF EXISTS "Technicians can update their own profiles" ON technician_profiles;
DROP POLICY IF EXISTS "Technician profiles basic info viewable by all" ON technician_profiles;
DROP POLICY IF EXISTS "Technician location viewable by assigned clients only" ON technician_profiles;

-- Create simpler, non-recursive policies
CREATE POLICY "Technicians manage own profile" 
ON technician_profiles 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public can view basic technician info" 
ON technician_profiles 
FOR SELECT 
USING (true);

-- Also fix the service_requests policies that might be causing issues
DROP POLICY IF EXISTS "Technicians can view requests for their service type" ON service_requests;
DROP POLICY IF EXISTS "Technicians can accept and update assigned requests" ON service_requests;

CREATE POLICY "Technicians can view and update matching service requests" 
ON service_requests 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM technician_profiles tp 
    WHERE tp.user_id = auth.uid() 
    AND tp.service_type = service_requests.service_type
  )
);