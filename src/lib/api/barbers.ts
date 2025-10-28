import { supabase } from "@/integrations/supabase/client";

export interface Barber {
  id: string;
  user_id: string;
  full_name: string;
  bio: string | null;
  specialties: string[];
  years_experience: number;
  profile_image_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface BarberAvailability {
  id: string;
  barber_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
  status_message: string | null;
}

export interface BarberWithDetails extends Barber {
  full_name: string;
  availability: BarberAvailability[];
}

export const getBarbers = async (): Promise<Barber[]> => {
  const { data, error } = await supabase
    .from('barbers')
    .select('*')
    .eq('is_active', true);

  if (error) throw error;
  return data || [];
};

export const getBarbersWithAvailability = async (): Promise<BarberWithDetails[]> => {
  const { data, error } = await supabase
    .from('barbers')
    .select(`
      *,
      barber_availability(*)
    `)
    .eq('is_active', true);

  if (error) throw error;
  
  return (data || []).map((barber: any) => ({
    ...barber,
    full_name: barber.full_name || 'Unknown',
    availability: barber.barber_availability || []
  }));
};

export const getBarberById = async (id: string): Promise<Barber | null> => {
  const { data, error } = await supabase
    .from('barbers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

// Alias for getBarbers (for consistency)
export const getActiveBarbers = getBarbers;

// Get barbers with real-time availability using compute-availability engine
export interface BarberWithRealAvailability extends Barber {
  realAvailability: Array<{ date: string; time_slots: string[] }>;
  totalSlotsThisWeek: number;
  nextAvailableSlot: { date: string; time: string } | null;
}

export const getBarbersWithRealAvailability = async (
  serviceDuration = 30,
  daysAhead = 7
): Promise<BarberWithRealAvailability[]> => {
  const barbers = await getBarbers();
  const fromDate = new Date().toISOString().split('T')[0];
  const toDate = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const barbersWithAvailability = await Promise.all(
    barbers.map(async (barber) => {
      try {
        const { data, error } = await supabase.functions.invoke('compute-availability', {
          body: {
            barber_id: barber.id,
            from_date: fromDate,
            to_date: toDate,
            service_duration: serviceDuration
          }
        });

        if (error) {
          console.error(`Error fetching availability for barber ${barber.id}:`, error);
          return {
            ...barber,
            realAvailability: [],
            totalSlotsThisWeek: 0,
            nextAvailableSlot: null
          };
        }

        const availability = data || [];
        const totalSlots = availability.reduce(
          (sum: number, day: any) => sum + (day.time_slots?.length || 0),
          0
        );

        const nextSlot = availability
          .flatMap((day: any) => 
            (day.time_slots || []).map((time: string) => ({ date: day.date, time }))
          )
          .shift() || null;

        return {
          ...barber,
          realAvailability: availability,
          totalSlotsThisWeek: totalSlots,
          nextAvailableSlot: nextSlot
        };
      } catch (err) {
        console.error(`Error computing availability for barber ${barber.id}:`, err);
        return {
          ...barber,
          realAvailability: [],
          totalSlotsThisWeek: 0,
          nextAvailableSlot: null
        };
      }
    })
  );

  return barbersWithAvailability.sort((a, b) => b.totalSlotsThisWeek - a.totalSlotsThisWeek);
};
