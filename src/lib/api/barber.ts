import { supabase } from "@/integrations/supabase/client";

// Get barber's own appointments
export const getBarberAppointments = async (barberId: string, startDate?: string, endDate?: string) => {
  let query = supabase
    .from('appointments')
    .select(`
      *,
      services(name, duration_minutes)
    `)
    .eq('barber_id', barberId)
    .order('appointment_date', { ascending: true })
    .order('appointment_time', { ascending: true });

  if (startDate) {
    query = query.gte('appointment_date', startDate);
  }
  if (endDate) {
    query = query.lte('appointment_date', endDate);
  }

  const { data, error } = await query;

  if (error) throw error;

  // Fetch customer names for registered users
  const appointmentsWithCustomers = await Promise.all(
    (data || []).map(async (apt: any) => {
      let customerName = apt.guest_name || 'Guest';
      
      if (apt.customer_id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', apt.customer_id)
          .maybeSingle();
        
        customerName = profile?.full_name || 'Guest';
      }

      return {
        ...apt,
        customer_name: customerName,
        // Mask email and phone for privacy
        guest_email: apt.guest_email ? `${apt.guest_email[0]}***@***` : null,
        guest_phone: apt.guest_phone ? `***-***-${apt.guest_phone.slice(-4)}` : null,
      };
    })
  );

  return appointmentsWithCustomers;
};

// Get barber's own profile
export const getBarberProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('barbers')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

// Get barber's availability
export const getMyAvailability = async (barberId: string) => {
  const { data, error } = await supabase
    .from('barber_availability')
    .select('*')
    .eq('barber_id', barberId)
    .order('day_of_week', { ascending: true });

  if (error) throw error;
  return data || [];
};

// Get barber stats
export const getBarberStats = async (barberId: string) => {
  const today = new Date().toISOString().split('T')[0];
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekStartStr = weekStart.toISOString().split('T')[0];

  // Today's appointments count
  const { count: todayCount, error: todayError } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('barber_id', barberId)
    .eq('appointment_date', today)
    .neq('status', 'cancelled');

  // This week's appointments count
  const { count: weekCount, error: weekError } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('barber_id', barberId)
    .gte('appointment_date', weekStartStr)
    .neq('status', 'cancelled');

  // All-time completed appointments count
  const { count: completedCount, error: completedError } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('barber_id', barberId)
    .eq('status', 'completed');

  if (todayError || weekError || completedError) {
    throw todayError || weekError || completedError;
  }

  return {
    todayCount: todayCount || 0,
    weekCount: weekCount || 0,
    totalCompleted: completedCount || 0,
  };
};
