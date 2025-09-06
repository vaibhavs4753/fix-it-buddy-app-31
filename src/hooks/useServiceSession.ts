import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ServiceSession {
  id: string;
  service_request_id: string;
  technician_id: string;
  client_id: string;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  started_at: string;
  ended_at?: string;
}

export const useServiceSession = (serviceRequestId?: string) => {
  const [currentSession, setCurrentSession] = useState<ServiceSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load active session for a service request
  const loadSession = useCallback(async () => {
    if (!serviceRequestId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('service_sessions')
        .select('*')
        .eq('service_request_id', serviceRequestId)
        .eq('status', 'active')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setCurrentSession(data as ServiceSession);
    } catch (error) {
      console.error('Error loading service session:', error);
      toast({
        title: "Error",
        description: "Failed to load service session",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [serviceRequestId, toast]);

  // Start a new service session
  const startSession = useCallback(async (
    serviceRequestId: string,
    technicianId: string,
    clientId: string
  ): Promise<string | null> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('service_sessions')
        .insert({
          service_request_id: serviceRequestId,
          technician_id: technicianId,
          client_id: clientId,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentSession(data as ServiceSession);
      
      toast({
        title: "Service Session Started",
        description: "Live tracking is now active"
      });

      return data.id;
    } catch (error) {
      console.error('Error starting service session:', error);
      toast({
        title: "Error",
        description: "Failed to start service session",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // End service session
  const endSession = useCallback(async (sessionId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('service_sessions')
        .update({
          status: 'completed',
          ended_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) throw error;

      setCurrentSession(null);
      
      toast({
        title: "Service Completed",
        description: "Live tracking has been stopped"
      });
    } catch (error) {
      console.error('Error ending service session:', error);
      toast({
        title: "Error",
        description: "Failed to end service session",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Pause/resume session
  const toggleSessionStatus = useCallback(async (sessionId: string, newStatus: 'active' | 'paused') => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('service_sessions')
        .update({ status: newStatus })
        .eq('id', sessionId);

      if (error) throw error;

      setCurrentSession(prev => prev ? { ...prev, status: newStatus } : null);
      
      toast({
        title: newStatus === 'paused' ? "Service Paused" : "Service Resumed",
        description: newStatus === 'paused' ? 
          "Live tracking has been paused" : 
          "Live tracking has been resumed"
      });
    } catch (error) {
      console.error('Error updating service session:', error);
      toast({
        title: "Error",
        description: "Failed to update service session",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  // Subscribe to session updates
  useEffect(() => {
    if (!serviceRequestId) return;

    const channel = supabase
      .channel(`service-session-${serviceRequestId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'service_sessions',
          filter: `service_request_id=eq.${serviceRequestId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setCurrentSession(payload.new as ServiceSession);
          } else if (payload.eventType === 'DELETE') {
            setCurrentSession(null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [serviceRequestId]);

  return {
    currentSession,
    isLoading,
    startSession,
    endSession,
    toggleSessionStatus,
    refreshSession: loadSession
  };
};