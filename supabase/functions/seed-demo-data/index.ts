import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    // Verify user is admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user is admin
    const { data: roles } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roles?.role !== 'admin') {
      throw new Error('Admin access required');
    }

    console.log('Seeding demo data...');

    // Get all active barbers
    const { data: barbers, error: barbersError } = await supabaseClient
      .from('barbers')
      .select('id, full_name')
      .eq('is_active', true)
      .limit(3);

    if (barbersError) throw barbersError;
    if (!barbers || barbers.length === 0) {
      throw new Error('No active barbers found. Please create barbers first.');
    }

    // Get available services
    const { data: services, error: servicesError } = await supabaseClient
      .from('services')
      .select('id, duration_minutes')
      .eq('is_active', true)
      .limit(3);

    if (servicesError) throw servicesError;

    // 1. Seed Working Hours for all barbers
    const workingHoursData = [];
    for (const barber of barbers) {
      // Monday to Friday: 9:00-18:00
      for (let day = 1; day <= 5; day++) {
        workingHoursData.push({
          barber_id: barber.id,
          weekday: day,
          start_time: '09:00',
          end_time: '18:00',
        });
      }
      // Saturday: 10:00-16:00
      workingHoursData.push({
        barber_id: barber.id,
        weekday: 6,
        start_time: '10:00',
        end_time: '16:00',
      });
    }

    const { error: workingHoursError } = await supabaseClient
      .from('working_hours')
      .upsert(workingHoursData, { onConflict: 'barber_id,weekday', ignoreDuplicates: false });

    if (workingHoursError) console.error('Working hours error:', workingHoursError);

    // 2. Seed Breaks
    const breaksData = [];
    for (const barber of barbers) {
      // Lunch break every day
      breaksData.push({
        barber_id: barber.id,
        type: 'everyday',
        start_time: '12:00',
        end_time: '13:00',
        note: 'Lunch break',
      });
    }

    // Add weekly break for first barber on Wednesday
    if (barbers[0]) {
      breaksData.push({
        barber_id: barbers[0].id,
        type: 'weekly',
        weekday: 3,
        start_time: '14:00',
        end_time: '15:00',
        note: 'Weekly meeting',
      });
    }

    const { error: breaksError } = await supabaseClient
      .from('breaks')
      .insert(breaksData);

    if (breaksError) console.error('Breaks error:', breaksError);

    // 3. Seed Days Off
    const daysOffData = [];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextMonday = new Date();
    nextMonday.setDate(nextMonday.getDate() + ((8 - nextMonday.getDay()) % 7));

    if (barbers[0]) {
      daysOffData.push({
        barber_id: barbers[0].id,
        date: nextMonday.toISOString().split('T')[0],
      });
    }

    if (barbers[1]) {
      daysOffData.push({
        barber_id: barbers[1].id,
        date: tomorrow.toISOString().split('T')[0],
      });
    }

    const { error: daysOffError } = await supabaseClient
      .from('days_off')
      .insert(daysOffData);

    if (daysOffError) console.error('Days off error:', daysOffError);

    // 4. Seed Availability Overrides
    const overridesData = [];
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    // Evening special for first barber
    if (barbers[0]) {
      overridesData.push({
        barber_id: barbers[0].id,
        override_type: 'open',
        start_datetime: `${dayAfterTomorrow.toISOString().split('T')[0]}T19:00:00`,
        end_datetime: `${dayAfterTomorrow.toISOString().split('T')[0]}T21:00:00`,
        note: 'Evening appointments available',
      });
    }

    // Closed override for last barber on Friday afternoon
    if (barbers[barbers.length - 1]) {
      const nextFriday = new Date();
      nextFriday.setDate(nextFriday.getDate() + ((5 - nextFriday.getDay() + 7) % 7));
      overridesData.push({
        barber_id: barbers[barbers.length - 1].id,
        override_type: 'closed',
        start_datetime: `${nextFriday.toISOString().split('T')[0]}T14:00:00`,
        end_datetime: `${nextFriday.toISOString().split('T')[0]}T17:00:00`,
        note: 'Training session',
      });
    }

    const { error: overridesError } = await supabaseClient
      .from('availability_overrides')
      .insert(overridesData);

    if (overridesError) console.error('Overrides error:', overridesError);

    // 5. Seed Sample Appointments
    if (services && services.length > 0) {
      const appointmentsData = [];
      const today = new Date();
      
      for (let i = 0; i < 5; i++) {
        const appointmentDate = new Date(today);
        appointmentDate.setDate(today.getDate() + i);
        
        const barber = barbers[i % barbers.length];
        const service = services[i % services.length];
        
        appointmentsData.push({
          barber_id: barber.id,
          service_id: service.id,
          appointment_date: appointmentDate.toISOString().split('T')[0],
          appointment_time: i % 2 === 0 ? '10:00' : '14:00',
          status: i % 3 === 0 ? 'pending' : 'confirmed',
          guest_name: `Demo Customer ${i + 1}`,
          guest_email: `demo${i + 1}@example.com`,
          guest_phone: `555-010${i}`,
        });
      }

      const { error: appointmentsError } = await supabaseClient
        .from('appointments')
        .insert(appointmentsData);

      if (appointmentsError) console.error('Appointments error:', appointmentsError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Demo data seeded successfully for ${barbers.length} barbers`,
        barbers: barbers.map(b => b.full_name),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Seed demo data error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to seed demo data';
    return new Response(
      JSON.stringify({
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
