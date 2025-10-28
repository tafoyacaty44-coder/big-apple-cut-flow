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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify admin
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: role } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!role) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { request_id, approve, note } = await req.json();

    if (!request_id || approve === undefined) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: request_id, approve' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch the request
    const { data: request, error: fetchError } = await supabase
      .from('schedule_change_requests')
      .select('*')
      .eq('id', request_id)
      .single();

    if (fetchError || !request) {
      return new Response(
        JSON.stringify({ error: 'Request not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (request.status !== 'pending') {
      return new Response(
        JSON.stringify({ error: 'Request already reviewed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let appliedChanges = null;

    if (approve) {
      // Apply changes based on kind
      if (request.kind === 'working_hours') {
        // Upsert working hours
        const { error: whError } = await supabase
          .from('working_hours')
          .upsert({
            barber_id: request.barber_id,
            weekday: request.weekday,
            start_time: request.start_time,
            end_time: request.end_time
          });

        if (whError) throw whError;
        appliedChanges = { table: 'working_hours', weekday: request.weekday };

      } else if (request.kind === 'breaks') {
        // Insert break
        const { error: breakError } = await supabase
          .from('breaks')
          .insert({
            barber_id: request.barber_id,
            type: request.break_kind,
            date: request.date,
            weekday: request.break_weekday,
            start_time: request.break_start,
            end_time: request.break_end,
            note: request.note
          });

        if (breakError) throw breakError;
        appliedChanges = { table: 'breaks', type: request.break_kind };

      } else if (request.kind === 'day_off') {
        // Insert day off
        const { error: dayOffError } = await supabase
          .from('days_off')
          .insert({
            barber_id: request.barber_id,
            date: request.day_off_date
          });

        if (dayOffError) throw dayOffError;
        appliedChanges = { table: 'days_off', date: request.day_off_date };
      }
    }

    // Update request status
    const { error: updateError } = await supabase
      .from('schedule_change_requests')
      .update({
        status: approve ? 'approved' : 'rejected',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        note: approve ? request.note : note || request.note
      })
      .eq('id', request_id);

    if (updateError) throw updateError;

    console.log(`Schedule request ${request_id} ${approve ? 'approved' : 'rejected'} by ${user.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        applied_changes: appliedChanges,
        status: approve ? 'approved' : 'rejected'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error reviewing schedule request:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});