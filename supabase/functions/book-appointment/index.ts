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
    
    if (booking.vipCode) {
      const { data: vipSettings } = await supabase
        .from('vip_settings')
        .select('*')
        .eq('id', 1)
        .single();
      
      if (vipSettings?.enabled && vipSettings.vip_code === booking.vipCode) {
        vipApplied = true;
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

    // Check if slot is available (no overlapping appointments for this barber)
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

    // Find or create client
    let clientId: string;
    const { data: existingClient } = await supabase
      .from('clients')
      .select('id')
      .or(`phone.eq.${booking.clientPhone},email.eq.${booking.clientEmail}`)
      .maybeSingle();

    if (existingClient) {
      clientId = existingClient.id;
    } else {
      const { data: newClient, error: clientError } = await supabase
        .from('clients')
        .insert({
          full_name: booking.clientName,
          phone: booking.clientPhone,
          email: booking.clientEmail,
        })
        .select('id')
        .single();

      if (clientError || !newClient) {
        throw new Error('Failed to create client');
      }
      clientId = newClient.id;
    }

    // Create appointment
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert({
        client_id: clientId,
        barber_id: booking.barberId,
        service_id: booking.serviceId,
        start_time: booking.startTime,
        end_time: endTime,
        appointment_date: new Date(booking.startTime).toISOString().split('T')[0],
        appointment_time: new Date(booking.startTime).toTimeString().split(' ')[0],
        payment_amount: priceToUse,
        payment_status: 'pending',
        status: 'scheduled',
        vip_applied: vipApplied,
      })
      .select('*, clients(*), barbers(*), services(*)')
      .single();

    if (appointmentError || !appointment) {
      console.error('Appointment error:', appointmentError);
      throw new Error('Failed to create appointment');
    }

    console.log('Appointment created:', appointment.id, 'Token:', appointment.token);

    return new Response(
      JSON.stringify({ 
        success: true, 
        appointment,
        token: appointment.token 
      }),
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
