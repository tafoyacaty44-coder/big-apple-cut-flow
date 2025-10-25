import { supabase } from "@/integrations/supabase/client";

export interface Barber {
  id: string;
  user_id: string;
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
