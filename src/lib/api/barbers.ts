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

export const getBarbers = async (): Promise<Barber[]> => {
  const { data, error } = await supabase
    .from('barbers')
    .select('*')
    .eq('is_active', true);

  if (error) throw error;
  return data || [];
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
