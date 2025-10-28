import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RescheduleRequest {
  token: string;
  newStartTime: string;
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

    const { token, newStartTime }: RescheduleRequest = await req.json();
    
    console.log('Reschedule request for token:', token);

    // Get appointment by token
    const { data: appointment, error: fetchError } = await supabase
      .from('appointments')
      .select('*, services(*)')
      .eq('token', token)
      .eq('status', 'scheduled')
      .single();

    if (fetchError || !appointment) {
      return new Response(
        JSON.stringify({ error: 'Appointment not found or already canceled' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const duration = appointment.services?.duration_minutes || 30;
    const newEndTime = new Date(new Date(newStartTime).getTime() + duration * 60000).toISOString();

    // Check if new slot is available
    const { data: conflicts } = await supabase
      .from('appointments')
      .select('id')
      .eq('barber_id', appointment.barber_id)
      .eq('status', 'scheduled')
      .neq('id', appointment.id)
      .or(`and(start_time.lte.${newStartTime},end_time.gt.${newStartTime}),and(start_time.lt.${newEndTime},end_time.gte.${newEndTime})`);

    if (conflicts && conflicts.length > 0) {
      return new Response(
        JSON.stringify({ error: 'New time slot not available' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update appointment
    const { data: updated, error: updateError } = await supabase
      .from('appointments')
      .update({
        start_time: newStartTime,
        end_time: newEndTime,
        appointment_date: new Date(newStartTime).toISOString().split('T')[0],
        appointment_time: new Date(newStartTime).toTimeString().split(' ')[0],
      })
      .eq('token', token)
      .select('*')
      .single();

    if (updateError || !updated) {
      throw new Error('Failed to reschedule appointment');
    }

    // Log notification
    await supabase.from('notifications').insert({
      appointment_id: updated.id,
      channel: 'email',
      type: 'rescheduled',
    });

    console.log('Appointment rescheduled:', updated.id);

    return new Response(
      JSON.stringify({ success: true, appointment: updated }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
