import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LinkClientRequest {
  customerId: string;
  email: string;
  phone?: string;
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

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const request: LinkClientRequest = await req.json();
    console.log('Link client request:', request);

    // Use service role for updates
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Normalize identity
    const normalizedEmail = request.email?.toLowerCase().trim();
    const normalizedPhone = request.phone?.replace(/\D/g, '');

    // Find matching guest clients
    let query = supabase
      .from('clients')
      .select('id, full_name, email, phone, guest')
      .eq('guest', true)
      .is('linked_profile_id', null);

    if (normalizedEmail && normalizedPhone) {
      query = query.or(`email_norm.eq.${normalizedEmail},phone_norm.eq.${normalizedPhone}`);
    } else if (normalizedEmail) {
      query = query.eq('email_norm', normalizedEmail);
    } else if (normalizedPhone) {
      query = query.eq('phone_norm', normalizedPhone);
    } else {
      throw new Error('Email or phone required');
    }

    const { data: clients, error: clientError } = await query;

    if (clientError) {
      console.error('Client query error:', clientError);
      throw new Error('Failed to find clients');
    }

    if (!clients || clients.length === 0) {
      console.log('No matching guest clients found');
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'No guest clients found to link',
          linked_count: 0,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${clients.length} guest clients to link`);

    // Link all matching clients
    const clientIds = clients.map(c => c.id);
    const { error: updateError } = await supabase
      .from('clients')
      .update({
        linked_profile_id: request.customerId,
        guest: false,
        account_linked_at: new Date().toISOString(),
      })
      .in('id', clientIds);

    if (updateError) {
      console.error('Client update error:', updateError);
      throw new Error('Failed to link clients');
    }

    // Also update appointments to link customer_id if not already set
    const { error: appointmentError } = await supabase
      .from('appointments')
      .update({
        customer_id: request.customerId,
        updated_at: new Date().toISOString(),
      })
      .in('client_id', clientIds)
      .is('customer_id', null);

    if (appointmentError) {
      console.error('Appointment update error:', appointmentError);
    }

    console.log(`Linked ${clients.length} clients to profile ${request.customerId}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Successfully linked ${clients.length} booking(s) to your account`,
        linked_count: clients.length,
        clients: clients.map(c => ({ name: c.full_name, email: c.email, phone: c.phone })),
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
