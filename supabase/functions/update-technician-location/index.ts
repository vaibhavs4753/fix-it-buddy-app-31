import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get authenticated user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      );
    }

    const { lat, lng, availability_status, service_session_id, accuracy } = await req.json();

    // Validate inputs
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return new Response(
        JSON.stringify({ error: 'Invalid latitude or longitude' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Update technician location and availability
    const { error: profileUpdateError } = await supabaseClient
      .from('technician_profiles')
      .update({
        current_location_lat: lat,
        current_location_lng: lng,
        availability_status: availability_status || 'available',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    // Store location history if service session is active
    if (service_session_id) {
      const { error: historyError } = await supabaseClient
        .from('location_history')
        .insert({
          service_session_id,
          technician_id: user.id,
          lat,
          lng,
          accuracy: accuracy || null
        });

      if (historyError) {
        console.error('Error storing location history:', historyError);
      }
    }

    if (profileUpdateError) {
      console.error('Error updating location:', profileUpdateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update location' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Location updated successfully',
        location: { lat, lng },
        availability: availability_status || 'available'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});