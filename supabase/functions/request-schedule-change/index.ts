import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get barber ID for this user
    const { data: barber, error: barberError } = await supabase
      .from('barbers')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (barberError || !barber) {
      return new Response(
        JSON.stringify({ error: 'Not a barber account' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload = await req.json();
    const { kind, ...requestData } = payload;

    // Validate based on kind
    if (kind === 'working_hours') {
      if (!requestData.weekday || !requestData.start_time || !requestData.end_time) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields for working_hours: weekday, start_time, end_time' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else if (kind === 'breaks') {
      if (!requestData.break_kind || !requestData.break_start || !requestData.break_end) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields for breaks: break_kind, break_start, break_end' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (requestData.break_kind === 'custom' && !requestData.date) {
        return new Response(
          JSON.stringify({ error: 'Custom breaks require a date' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if ((requestData.break_kind === 'weekly' || requestData.break_kind === 'everyday') && requestData.break_weekday === undefined) {
        return new Response(
          JSON.stringify({ error: 'Weekly/everyday breaks require break_weekday' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else if (kind === 'day_off') {
      if (!requestData.day_off_date) {
        return new Response(
          JSON.stringify({ error: 'Missing required field for day_off: day_off_date' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid kind. Must be working_hours, breaks, or day_off' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert request
    const { data: request, error: insertError } = await supabase
      .from('schedule_change_requests')
      .insert({
        barber_id: barber.id,
        kind,
        ...requestData,
        status: 'pending'
      })
      .select()
      .single();

    if (insertError) throw insertError;

    console.log(`Schedule change request created: ${request.id} by barber ${barber.id}`);

    return new Response(
      JSON.stringify(request),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error creating schedule request:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});