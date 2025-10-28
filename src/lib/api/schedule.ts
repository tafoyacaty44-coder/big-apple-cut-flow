import { supabase } from "@/integrations/supabase/client";

export interface WorkingHours {
  id: string;
  barber_id: string;
  weekday: number;
  start_time: string;
  end_time: string;
}

export interface Break {
  id: string;
  barber_id: string;
  type: 'custom' | 'everyday' | 'weekly';
  date: string | null;
  weekday: number | null;
  start_time: string;
  end_time: string;
  note: string | null;
}

export interface DayOff {
  id: string;
  barber_id: string;
  date: string;
}

// Working Hours
export const getWorkingHours = async (barberId?: string): Promise<WorkingHours[]> => {
  let query = supabase.from('working_hours').select('*');
  
  if (barberId) {
    query = query.eq('barber_id', barberId);
  }

  const { data, error } = await query.order('weekday');

  if (error) throw error;
  return data || [];
};

export const upsertWorkingHours = async (
  barberId: string,
  weekday: number,
  startTime: string,
  endTime: string
): Promise<WorkingHours> => {
  const { data, error } = await supabase
    .from('working_hours')
    .upsert({
      barber_id: barberId,
      weekday,
      start_time: startTime,
      end_time: endTime,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Breaks
export const getBreaks = async (barberId?: string): Promise<Break[]> => {
  let query = supabase.from('breaks').select('*');
  
  if (barberId) {
    query = query.eq('barber_id', barberId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as Break[];
};

export const createBreak = async (
  barberId: string,
  type: 'custom' | 'everyday' | 'weekly',
  startTime: string,
  endTime: string,
  date?: string,
  weekday?: number,
  note?: string
): Promise<Break> => {
  const { data, error } = await supabase
    .from('breaks')
    .insert({
      barber_id: barberId,
      type,
      start_time: startTime,
      end_time: endTime,
      date,
      weekday,
      note,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Break;
};

export const deleteBreak = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('breaks')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Days Off
export const getDaysOff = async (barberId?: string): Promise<DayOff[]> => {
  let query = supabase.from('days_off').select('*');
  
  if (barberId) {
    query = query.eq('barber_id', barberId);
  }

  const { data, error } = await query.order('date', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const createDayOff = async (
  barberId: string,
  date: string
): Promise<DayOff> => {
  const { data, error } = await supabase
    .from('days_off')
    .insert({
      barber_id: barberId,
      date,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteDayOff = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('days_off')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
