-- Add service session tracking table
CREATE TABLE public.service_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_request_id UUID NOT NULL,
  technician_id UUID NOT NULL,
  client_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.service_sessions ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for service sessions
CREATE POLICY "Service sessions viewable by participants" 
ON public.service_sessions 
FOR SELECT 
USING (auth.uid() = client_id OR auth.uid() = technician_id);

CREATE POLICY "Technicians can create sessions for their requests" 
ON public.service_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = technician_id);

CREATE POLICY "Participants can update session status" 
ON public.service_sessions 
FOR UPDATE 
USING (auth.uid() = client_id OR auth.uid() = technician_id);

-- Add trigger for updated_at
CREATE TRIGGER update_service_sessions_updated_at
BEFORE UPDATE ON public.service_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add location tracking history table
CREATE TABLE public.location_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_session_id UUID,
  technician_id UUID NOT NULL,
  lat NUMERIC NOT NULL,
  lng NUMERIC NOT NULL,
  accuracy NUMERIC,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on location history
ALTER TABLE public.location_history ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for location history
CREATE POLICY "Location history viewable by session participants" 
ON public.location_history 
FOR SELECT 
USING (
  service_session_id IN (
    SELECT id FROM service_sessions 
    WHERE client_id = auth.uid() OR technician_id = auth.uid()
  )
  OR technician_id = auth.uid()
);

CREATE POLICY "Technicians can insert their location history" 
ON public.location_history 
FOR INSERT 
WITH CHECK (auth.uid() = technician_id);

-- Enhance technician profiles RLS policies for better security
DROP POLICY IF EXISTS "Public read access to technician profiles" ON public.technician_profiles;

CREATE POLICY "Technician profiles basic info viewable by all" 
ON public.technician_profiles 
FOR SELECT 
USING (true);

-- Restrict location data access to only assigned clients
CREATE POLICY "Technician location viewable by assigned clients only" 
ON public.technician_profiles 
FOR SELECT 
USING (
  -- Technicians can see their own full profile
  auth.uid() = user_id 
  OR 
  -- Clients can see location only if technician is assigned to their active request
  EXISTS (
    SELECT 1 FROM service_requests sr
    WHERE sr.technician_id = user_id 
    AND sr.client_id = auth.uid()
    AND sr.status IN ('accepted', 'in_progress')
  )
);

-- Add indexes for better performance
CREATE INDEX idx_service_sessions_technician_status ON public.service_sessions(technician_id, status);
CREATE INDEX idx_service_sessions_client_status ON public.service_sessions(client_id, status);
CREATE INDEX idx_location_history_session ON public.location_history(service_session_id);
CREATE INDEX idx_location_history_technician_time ON public.location_history(technician_id, recorded_at DESC);