import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScheduleRequest {
  appointment_id: string;
  event_type: 'created' | 'verified' | 'rescheduled' | 'canceled';
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

    const { appointment_id, event_type }: ScheduleRequest = await req.json();
    
    console.log('Scheduling messages:', { appointment_id, event_type });

    // Get appointment with client details
    const { data: appointment, error: fetchError } = await supabase
      .from('appointments')
      .select(`
        *,
        clients (
          opt_in_email,
          opt_in_sms
        )
      `)
      .eq('id', appointment_id)
      .single();

    if (fetchError || !appointment) {
      return new Response(
        JSON.stringify({ error: 'Appointment not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const client = appointment.clients as any;
    const appointmentDateTime = new Date(`${appointment.appointment_date}T${appointment.appointment_time}Z`);
    const now = new Date();

    // Cancel existing jobs for this appointment if rescheduled/canceled
    if (event_type === 'rescheduled' || event_type === 'canceled') {
      await supabase
        .from('notification_jobs')
        .update({ status: 'canceled' })
        .eq('appointment_id', appointment_id)
        .in('status', ['queued']);
    }

    const jobsToCreate = [];

    if (event_type === 'created' || event_type === 'verified') {
      // Schedule confirmation immediately
      if (client?.opt_in_email) {
        jobsToCreate.push({
          appointment_id,
          channel: 'email',
          template: 'confirmation',
          scheduled_for: now.toISOString(),
        });
      }
      if (client?.opt_in_sms) {
        jobsToCreate.push({
          appointment_id,
          channel: 'sms',
          template: 'confirmation',
          scheduled_for: now.toISOString(),
        });
      }

      // Schedule reminder 24h before
      const reminder24h = new Date(appointmentDateTime);
      reminder24h.setHours(reminder24h.getHours() - 24);
      if (reminder24h > now) {
        if (client?.opt_in_email) {
          jobsToCreate.push({
            appointment_id,
            channel: 'email',
            template: 'reminder_24h',
            scheduled_for: reminder24h.toISOString(),
          });
        }
        if (client?.opt_in_sms) {
          jobsToCreate.push({
            appointment_id,
            channel: 'sms',
            template: 'reminder_24h',
            scheduled_for: reminder24h.toISOString(),
          });
        }
      }

      // Schedule reminder 2h before
      const reminder2h = new Date(appointmentDateTime);
      reminder2h.setHours(reminder2h.getHours() - 2);
      if (reminder2h > now) {
        if (client?.opt_in_email) {
          jobsToCreate.push({
            appointment_id,
            channel: 'email',
            template: 'reminder_2h',
            scheduled_for: reminder2h.toISOString(),
          });
        }
        if (client?.opt_in_sms) {
          jobsToCreate.push({
            appointment_id,
            channel: 'sms',
            template: 'reminder_2h',
            scheduled_for: reminder2h.toISOString(),
          });
        }
      }
    } else if (event_type === 'rescheduled') {
      // Send rescheduled notification immediately
      if (client?.opt_in_email) {
        jobsToCreate.push({
          appointment_id,
          channel: 'email',
          template: 'rescheduled',
          scheduled_for: now.toISOString(),
        });
      }
      if (client?.opt_in_sms) {
        jobsToCreate.push({
          appointment_id,
          channel: 'sms',
          template: 'rescheduled',
          scheduled_for: now.toISOString(),
        });
      }
    } else if (event_type === 'canceled') {
      // Send canceled notification immediately
      if (client?.opt_in_email) {
        jobsToCreate.push({
          appointment_id,
          channel: 'email',
          template: 'canceled',
          scheduled_for: now.toISOString(),
        });
      }
      if (client?.opt_in_sms) {
        jobsToCreate.push({
          appointment_id,
          channel: 'sms',
          template: 'canceled',
          scheduled_for: now.toISOString(),
        });
      }
    }

    // Insert all jobs
    if (jobsToCreate.length > 0) {
      const { error: insertError } = await supabase
        .from('notification_jobs')
        .insert(jobsToCreate);

      if (insertError) {
        throw insertError;
      }
    }

    console.log(`Scheduled ${jobsToCreate.length} notification jobs`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        jobs_scheduled: jobsToCreate.length 
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
