import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CancelRequest {
  token: string;
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

    const { token }: CancelRequest = await req.json();
    
    console.log('Cancel request for token:', token);

    // Get appointment by token
    const { data: appointment, error: fetchError } = await supabase
      .from('appointments')
      .select('id, status')
      .eq('token', token)
      .single();

    if (fetchError || !appointment) {
      return new Response(
        JSON.stringify({ error: 'Appointment not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (appointment.status === 'canceled') {
      return new Response(
        JSON.stringify({ error: 'Appointment already canceled' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Cancel appointment
    const { data: updated, error: updateError } = await supabase
      .from('appointments')
      .update({ status: 'canceled' })
      .eq('token', token)
      .select('*')
      .single();

    if (updateError || !updated) {
      throw new Error('Failed to cancel appointment');
    }

    // Log notification
    await supabase.from('notifications').insert({
      appointment_id: updated.id,
      channel: 'email',
      type: 'canceled',
    });

    console.log('Appointment canceled:', updated.id);

    return new Response(
      JSON.stringify({ success: true, appointment: updated }),
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
