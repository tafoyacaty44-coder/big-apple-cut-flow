import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BookingRequest {
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  barberId: string;
  serviceId: string;
  startTime: string;
  vipCode?: string;
  customerId?: string; // Optional: if user is logged in
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

    const booking: BookingRequest = await req.json();
    
    console.log('Booking request:', booking);

    // Validate VIP code if provided
    let vipApplied = false;
    let priceToUse = 0;
    let requirePrepayment = true;
    
    if (booking.vipCode) {
      const { data: vipSettings } = await supabase
        .from('vip_settings')
        .select('*')
        .eq('id', 1)
        .single();
      
      if (vipSettings?.enabled && vipSettings.vip_code === booking.vipCode) {
        vipApplied = true;
        requirePrepayment = false; // VIP customers bypass prepayment
      }
    }

    // Get service price for the barber
    const { data: servicePrice, error: priceError } = await supabase
      .from('service_prices')
      .select('default_price_cents, vip_price_cents')
      .eq('service_id', booking.serviceId)
      .eq('barber_id', booking.barberId)
      .single();

    if (priceError || !servicePrice) {
      throw new Error('Service price not found');
    }

    priceToUse = vipApplied && servicePrice.vip_price_cents
      ? servicePrice.vip_price_cents
      : servicePrice.default_price_cents;

    // Get service duration
    const { data: service } = await supabase
      .from('services')
      .select('duration_minutes')
      .eq('id', booking.serviceId)
      .single();

    const endTime = new Date(new Date(booking.startTime).getTime() + (service?.duration_minutes || 30) * 60000).toISOString();

    // Check if slot is available
    const { data: existingAppointments } = await supabase
      .from('appointments')
      .select('*')
      .eq('barber_id', booking.barberId)
      .eq('status', 'scheduled')
      .or(`and(start_time.lte.${booking.startTime},end_time.gt.${booking.startTime}),and(start_time.lt.${endTime},end_time.gte.${endTime})`);

    if (existingAppointments && existingAppointments.length > 0) {
      return new Response(
        JSON.stringify({ error: 'Time slot not available' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Normalize identity for matching
    const normalizedEmail = booking.clientEmail?.toLowerCase().trim();
    const normalizedPhone = booking.clientPhone?.replace(/\D/g, '');

    // Find or create client using normalized identity
    let clientId: string;
    const { data: existingClient } = await supabase
      .from('clients')
      .select('id, guest, linked_profile_id')
      .or(`email_norm.eq.${normalizedEmail},phone_norm.eq.${normalizedPhone}`)
      .maybeSingle();

    if (existingClient) {
      clientId = existingClient.id;
      console.log('Found existing client:', clientId);
      
      // If user is logged in and client isn't linked, link them now
      if (booking.customerId && existingClient.guest && !existingClient.linked_profile_id) {
        await supabase
          .from('clients')
          .update({
            linked_profile_id: booking.customerId,
            guest: false,
            account_linked_at: new Date().toISOString(),
          })
          .eq('id', clientId);
        console.log('Linked guest client to user account:', clientId);
      }
    } else {
      const { data: newClient, error: clientError } = await supabase
        .from('clients')
        .insert({
          full_name: booking.clientName,
          phone: booking.clientPhone,
          email: booking.clientEmail,
          guest: !booking.customerId,
          linked_profile_id: booking.customerId || null,
          account_linked_at: booking.customerId ? new Date().toISOString() : null,
        })
        .select('id')
        .single();

      if (clientError || !newClient) {
        console.error('Client creation error:', clientError);
        throw new Error('Failed to create client');
      }
      clientId = newClient.id;
      console.log('Created new client:', clientId);
    }

    // Create appointment
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert({
        client_id: clientId,
        customer_id: booking.customerId || null,
        barber_id: booking.barberId,
        service_id: booking.serviceId,
        start_time: booking.startTime,
        end_time: endTime,
        appointment_date: new Date(booking.startTime).toISOString().split('T')[0],
        appointment_time: new Date(booking.startTime).toTimeString().split(' ')[0],
        payment_amount: priceToUse,
        payment_status: vipApplied ? 'none' : 'pending',
        status: 'scheduled',
        vip_applied: vipApplied,
        require_prepayment: requirePrepayment,
        payment_required_reason: requirePrepayment ? 'Non-VIP booking requires payment verification' : null,
      })
      .select('*, clients(*), barbers(*), services(*)')
      .single();

    if (appointmentError || !appointment) {
      console.error('Appointment error:', appointmentError);
      throw new Error('Failed to create appointment');
    }

    console.log('Appointment created:', appointment.id, 'Token:', appointment.token);

    // If prepayment required, create pending payment record
    if (requirePrepayment) {
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          appointment_id: appointment.id,
          method: 'zelle', // Default, will be updated by customer
          amount_cents: priceToUse,
          status: 'pending',
        });

      if (paymentError) {
        console.error('Payment record error:', paymentError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        appointment,
        token: appointment.token,
        requires_payment: requirePrepayment,
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
