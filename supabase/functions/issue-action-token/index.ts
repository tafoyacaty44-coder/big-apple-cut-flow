import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TokenRequest {
  appointment_id: string;
  action: 'reschedule' | 'cancel';
  ttl_hours?: number;
}

// Generate random URL-safe token
function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(36)).join('').substring(0, 32);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { appointment_id, action, ttl_hours = 48 }: TokenRequest = await req.json();
    
    console.log('Generating action token:', { appointment_id, action, ttl_hours });

    // Verify appointment exists
    const { data: appointment, error: fetchError } = await supabase
      .from('appointments')
      .select('id')
      .eq('id', appointment_id)
      .single();

    if (fetchError || !appointment) {
      return new Response(
        JSON.stringify({ error: 'Appointment not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate token and expiry
    const token = generateToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + ttl_hours);

    // Insert token
    const { data: tokenData, error: insertError } = await supabase
      .from('appointment_action_tokens')
      .insert({
        token,
        appointment_id,
        action,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    const baseUrl = Deno.env.get('APP_BASE_URL') || 'http://localhost:8080';
    const actionUrl = `${baseUrl}/a/${token}/${action}`;

    console.log('Token generated:', { token, actionUrl, expires_at: expiresAt });

    return new Response(
      JSON.stringify({ 
        success: true, 
        token,
        action_url: actionUrl,
        expires_at: expiresAt.toISOString()
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
