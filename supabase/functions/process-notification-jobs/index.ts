import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Exponential backoff: 5m, 15m, 60m
function getNextRetryDelay(attempts: number): number {
  const delays = [5, 15, 60]; // minutes
  return delays[Math.min(attempts, delays.length - 1)] * 60 * 1000;
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

    console.log('Processing notification jobs...');

    // Get all due jobs
    const { data: jobs, error: fetchError } = await supabase
      .from('notification_jobs')
      .select('*')
      .eq('status', 'queued')
      .lte('scheduled_for', new Date().toISOString())
      .order('scheduled_for', { ascending: true })
      .limit(50);

    if (fetchError) {
      throw fetchError;
    }

    if (!jobs || jobs.length === 0) {
      console.log('No jobs to process');
      return new Response(
        JSON.stringify({ processed: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${jobs.length} jobs to process`);

    let processed = 0;
    let failed = 0;

    for (const job of jobs) {
      try {
        // Call send-notification function
        const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-notification`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          },
          body: JSON.stringify({
            appointment_id: job.appointment_id,
            channel: job.channel,
            template: job.template,
          }),
        });

        if (response.ok) {
          // Mark as sent
          await supabase
            .from('notification_jobs')
            .update({ status: 'sent' })
            .eq('id', job.id);
          
          processed++;
          console.log(`Job ${job.id} sent successfully`);
        } else {
          throw new Error(`Send failed: ${response.statusText}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const newAttempts = job.attempts + 1;
        
        if (newAttempts >= 5) {
          // Max retries reached, mark as failed
          await supabase
            .from('notification_jobs')
            .update({ 
              status: 'failed',
              last_error: errorMessage,
              attempts: newAttempts,
            })
            .eq('id', job.id);
          
          failed++;
          console.error(`Job ${job.id} failed permanently:`, errorMessage);
        } else {
          // Schedule retry with exponential backoff
          const retryDelay = getNextRetryDelay(newAttempts);
          const nextRetry = new Date(Date.now() + retryDelay);
          
          await supabase
            .from('notification_jobs')
            .update({ 
              attempts: newAttempts,
              last_error: errorMessage,
              scheduled_for: nextRetry.toISOString(),
            })
            .eq('id', job.id);
          
          console.log(`Job ${job.id} will retry in ${retryDelay / 1000 / 60} minutes`);
        }
      }
    }

    console.log(`Processed: ${processed}, Failed: ${failed}`);

    return new Response(
      JSON.stringify({ 
        processed,
        failed,
        total: jobs.length,
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
