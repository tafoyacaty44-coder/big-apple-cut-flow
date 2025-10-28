import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyPaymentRequest {
  paymentId: string;
  status: 'verified' | 'rejected';
  adminNotes?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify admin role
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin
    const { data: roleData } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!roleData || roleData.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const request: VerifyPaymentRequest = await req.json();
    console.log('Verify payment request:', request);

    // Use service role for updates
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Update payment status
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .update({
        status: request.status,
        verified_by: user.id,
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', request.paymentId)
      .select('appointment_id')
      .single();

    if (paymentError || !payment) {
      console.error('Payment update error:', paymentError);
      throw new Error('Failed to update payment');
    }

    // If verified, lock the appointment
    if (request.status === 'verified') {
      const { error: appointmentError } = await supabase
        .from('appointments')
        .update({
          payment_locked: true,
          payment_status: 'paid',
          updated_at: new Date().toISOString(),
        })
        .eq('id', payment.appointment_id);

      if (appointmentError) {
        console.error('Appointment lock error:', appointmentError);
      }
    }

    // If rejected, update appointment to show payment rejected
    if (request.status === 'rejected') {
      const { error: appointmentError } = await supabase
        .from('appointments')
        .update({
          payment_status: 'failed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', payment.appointment_id);

      if (appointmentError) {
        console.error('Appointment update error:', appointmentError);
      }
    }

    console.log(`Payment ${request.paymentId} ${request.status} by admin ${user.id}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Payment ${request.status} successfully`,
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
