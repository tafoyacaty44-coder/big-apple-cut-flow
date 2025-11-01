import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BookingRequest {
  service_id: string;
  barber_id: string;
  appointment_date: string;
  appointment_time: string;
  customer_id?: string;
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  vip_code?: string;
  promo_code?: string;
  campaign_id?: string;
  payment_method?: 'zelle' | 'apple_pay' | 'venmo' | 'cash_app';
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
    let promoDiscount = 0;
    
    if (booking.vip_code) {
      const { data: vipSettings } = await supabase
        .from('vip_settings')
        .select('*')
        .eq('id', 1)
        .single();
      
      if (vipSettings?.enabled && vipSettings.vip_code === booking.vip_code) {
        vipApplied = true;
        requirePrepayment = false; // VIP customers bypass prepayment
      }
    }

    // Validate promo code if provided
    if (booking.promo_code && booking.campaign_id) {
      const { data: campaign } = await supabase
        .from('promotional_campaigns')
        .select('promo_discount, promo_expires_at, status')
        .eq('id', booking.campaign_id)
        .eq('promo_code', booking.promo_code)
        .maybeSingle();

      if (campaign && campaign.status === 'sent') {
        // Check if not expired
        if (!campaign.promo_expires_at || new Date(campaign.promo_expires_at) > new Date()) {
          promoDiscount = campaign.promo_discount || 0;
          console.log(`Applied promo code: ${booking.promo_code}, discount: ${promoDiscount}%`);
        }
      }
    }

    // Get service price for the barber
    const { data: servicePrice, error: priceError } = await supabase
      .from('service_prices')
      .select('default_price_cents, vip_price_cents')
      .eq('service_id', booking.service_id)
      .eq('barber_id', booking.barber_id)
      .single();

    if (priceError || !servicePrice) {
      throw new Error('Service price not found');
    }

    priceToUse = vipApplied && servicePrice.vip_price_cents
      ? servicePrice.vip_price_cents
      : servicePrice.default_price_cents;

    // Apply promo discount if applicable
    if (promoDiscount > 0) {
      priceToUse = Math.round(priceToUse * (1 - promoDiscount / 100));
    }

    // Get service duration
    const { data: service } = await supabase
      .from('services')
      .select('duration_minutes')
      .eq('id', booking.service_id)
      .single();

    const startTime = new Date(`${booking.appointment_date}T${booking.appointment_time}`).toISOString();
    const endTime = new Date(new Date(startTime).getTime() + (service?.duration_minutes || 30) * 60000).toISOString();

    // Check if slot is available
    const { data: existingAppointments } = await supabase
      .from('appointments')
      .select('*')
      .eq('barber_id', booking.barber_id)
      .in('status', ['scheduled', 'confirmed'])
      .gte('appointment_date', booking.appointment_date)
      .lte('appointment_date', booking.appointment_date);

    if (existingAppointments && existingAppointments.length > 0) {
      const conflict = existingAppointments.some(apt => {
        const aptStart = new Date(`${apt.appointment_date}T${apt.appointment_time}`);
        const aptEnd = new Date(aptStart.getTime() + (service?.duration_minutes || 30) * 60000);
        const bookingStart = new Date(startTime);
        const bookingEnd = new Date(endTime);
        return (bookingStart < aptEnd && bookingEnd > aptStart);
      });

      if (conflict) {
        return new Response(
          JSON.stringify({ error: 'This time slot is no longer available' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Normalize identity for matching
    const clientName = booking.guest_name || '';
    const clientEmail = booking.guest_email || '';
    const clientPhone = booking.guest_phone || '';
    const normalizedEmail = clientEmail?.toLowerCase().trim();
    const normalizedPhone = clientPhone?.replace(/\D/g, '');

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
      if (booking.customer_id && existingClient.guest && !existingClient.linked_profile_id) {
        await supabase
          .from('clients')
          .update({
            linked_profile_id: booking.customer_id,
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
          full_name: clientName,
          phone: clientPhone,
          email: clientEmail,
          guest: !booking.customer_id,
          linked_profile_id: booking.customer_id || null,
          account_linked_at: booking.customer_id ? new Date().toISOString() : null,
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
        customer_id: booking.customer_id || null,
        barber_id: booking.barber_id,
        service_id: booking.service_id,
        appointment_date: booking.appointment_date,
        appointment_time: booking.appointment_time,
        payment_amount: priceToUse,
        payment_status: vipApplied ? 'none' : 'pending',
        status: 'pending',
        vip_applied: vipApplied,
        require_prepayment: requirePrepayment,
        payment_required_reason: requirePrepayment ? 'Non-VIP booking requires payment verification' : null,
        promo_code_used: booking.promo_code || null,
        campaign_id: booking.campaign_id || null,
      })
      .select('id, token, confirmation_number')
      .single();

    if (appointmentError || !appointment) {
      console.error('Appointment error:', appointmentError);
      throw new Error('Failed to create appointment');
    }

    console.log('Appointment created:', appointment.id, 'Token:', appointment.token);

    // Track promo code usage
    if (booking.campaign_id && booking.promo_code) {
      const { data: campaign } = await supabase
        .from('promotional_campaigns')
        .select('click_through_count')
        .eq('id', booking.campaign_id)
        .single();

      if (campaign) {
        await supabase
          .from('promotional_campaigns')
          .update({ click_through_count: (campaign.click_through_count || 0) + 1 })
          .eq('id', booking.campaign_id);
      }
    }

    // If prepayment required, create pending payment record
    if (requirePrepayment) {
      const paymentMethod = booking.payment_method || 'zelle'; // Use customer's selected method or default to zelle
      
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          appointment_id: appointment.id,
          method: paymentMethod,
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
        confirmation_number: appointment.confirmation_number,
        appointment_id: appointment.id,
        token: appointment.token,
        vip_applied: vipApplied,
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
