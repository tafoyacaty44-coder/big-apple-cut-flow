import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import { corsHeaders } from '../_shared/cors.ts';

interface TimeSlot {
  time: string;
  available: boolean;
}

interface AvailabilityResult {
  date: string;
  time_slots: string[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let barberId: string | null = null;
    let fromDate: string | null = null;
    let toDate: string | null = null;
    let serviceDuration = 30;

    // Support both GET (query params) and POST (JSON body)
    if (req.method === 'POST') {
      const body = await req.json();
      barberId = body.barber_id;
      fromDate = body.from_date;
      toDate = body.to_date;
      serviceDuration = body.service_duration || 30;
    } else {
      // GET request - use query params
      const url = new URL(req.url);
      barberId = url.searchParams.get('barber_id');
      fromDate = url.searchParams.get('from_date');
      toDate = url.searchParams.get('to_date');
      serviceDuration = parseInt(url.searchParams.get('service_duration') || '30');
    }

    if (!barberId || !fromDate || !toDate) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: barber_id, from_date, to_date' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Fetch working hours
    const { data: workingHours, error: whError } = await supabase
      .from('working_hours')
      .select('*')
      .eq('barber_id', barberId);

    if (whError) throw whError;

    // Fetch breaks
    const { data: breaks, error: breaksError } = await supabase
      .from('breaks')
      .select('*')
      .eq('barber_id', barberId);

    if (breaksError) throw breaksError;

    // Fetch days off
    const { data: daysOff, error: daysError } = await supabase
      .from('days_off')
      .select('*')
      .eq('barber_id', barberId)
      .gte('date', fromDate)
      .lte('date', toDate);

    if (daysError) throw daysError;

    // Fetch overrides
    const { data: overrides, error: overridesError } = await supabase
      .from('availability_overrides')
      .select('*')
      .eq('barber_id', barberId)
      .gte('start_time', `${fromDate}T00:00:00Z`)
      .lte('end_time', `${toDate}T23:59:59Z`);

    if (overridesError) throw overridesError;

    // Fetch appointments
    const { data: appointments, error: apptError } = await supabase
      .from('appointments')
      .select('appointment_date, appointment_time, service_id')
      .eq('barber_id', barberId)
      .gte('appointment_date', fromDate)
      .lte('appointment_date', toDate)
      .in('status', ['pending', 'confirmed']);

    if (apptError) throw apptError;

    // Get service durations for appointments
    const serviceIds = [...new Set(appointments?.map(a => a.service_id) || [])];
    const { data: services } = await supabase
      .from('services')
      .select('id, duration_minutes')
      .in('id', serviceIds);

    const serviceDurations = new Map(services?.map(s => [s.id, s.duration_minutes]) || []);

    // Compute availability for each date
    const results: AvailabilityResult[] = [];
    const from = new Date(fromDate);
    const to = new Date(toDate);

    for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const weekday = d.getDay();

      // Check if day off
      if (daysOff?.some(off => off.date === dateStr)) {
        continue;
      }

      // Get working hours for this weekday
      const dayHours = workingHours?.filter(wh => wh.weekday === weekday);
      if (!dayHours || dayHours.length === 0) {
        continue;
      }

      const availableSlots: string[] = [];

      for (const hours of dayHours) {
        const startTime = new Date(`${dateStr}T${hours.start_time}`);
        const endTime = new Date(`${dateStr}T${hours.end_time}`);

        // Generate 30-minute slots
        for (let time = new Date(startTime); time < endTime; time.setMinutes(time.getMinutes() + 30)) {
          const timeStr = time.toTimeString().slice(0, 5);
          const slotStart = new Date(time);
          const slotEnd = new Date(time.getTime() + serviceDuration * 60000);

          // Check if slot conflicts with breaks
          const hasBreak = breaks?.some(br => {
            if (br.type === 'custom' && br.date === dateStr) {
              const breakStart = new Date(`${dateStr}T${br.start_time}`);
              const breakEnd = new Date(`${dateStr}T${br.end_time}`);
              return slotStart < breakEnd && slotEnd > breakStart;
            }
            if (br.type === 'weekly' && br.weekday === weekday) {
              const breakStart = new Date(`${dateStr}T${br.start_time}`);
              const breakEnd = new Date(`${dateStr}T${br.end_time}`);
              return slotStart < breakEnd && slotEnd > breakStart;
            }
            if (br.type === 'everyday') {
              const breakStart = new Date(`${dateStr}T${br.start_time}`);
              const breakEnd = new Date(`${dateStr}T${br.end_time}`);
              return slotStart < breakEnd && slotEnd > breakStart;
            }
            return false;
          });

          if (hasBreak) continue;

          // Check appointments
          const hasAppointment = appointments?.some(apt => {
            if (apt.appointment_date !== dateStr) return false;
            const aptStart = new Date(`${dateStr}T${apt.appointment_time}`);
            const aptDuration = serviceDurations.get(apt.service_id) || 30;
            const aptEnd = new Date(aptStart.getTime() + aptDuration * 60000);
            return slotStart < aptEnd && slotEnd > aptStart;
          });

          if (hasAppointment) continue;

          // Check closed overrides
          const hasClosed = overrides?.some(ov => {
            if (ov.kind !== 'closed') return false;
            const ovStart = new Date(ov.start_time);
            const ovEnd = new Date(ov.end_time);
            return slotStart < ovEnd && slotEnd > ovStart;
          });

          if (hasClosed) continue;

          // Check if we can fit the full service duration
          if (slotEnd <= endTime) {
            availableSlots.push(timeStr);
          }
        }
      }

      // Add open overrides
      overrides?.forEach(ov => {
        if (ov.kind === 'open') {
          const ovStart = new Date(ov.start_time);
          const ovEnd = new Date(ov.end_time);
          const ovDate = ovStart.toISOString().split('T')[0];
          
          if (ovDate === dateStr) {
            for (let time = new Date(ovStart); time < ovEnd; time.setMinutes(time.getMinutes() + 30)) {
              const timeStr = time.toTimeString().slice(0, 5);
              if (!availableSlots.includes(timeStr)) {
                availableSlots.push(timeStr);
              }
            }
          }
        }
      });

      if (availableSlots.length > 0) {
        results.push({
          date: dateStr,
          time_slots: availableSlots.sort()
        });
      }
    }

    return new Response(
      JSON.stringify(results),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error computing availability:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});