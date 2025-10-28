import { supabase } from '@/integrations/supabase/client';

export interface AvailabilitySlot {
  date: string;
  time_slots: string[];
}

export interface ScheduleRequest {
  id: string;
  barber_id: string;
  kind: 'working_hours' | 'breaks' | 'day_off';
  status: 'pending' | 'approved' | 'rejected';
  weekday?: number;
  start_time?: string;
  end_time?: string;
  break_kind?: string;
  date?: string;
  break_weekday?: number;
  break_start?: string;
  break_end?: string;
  day_off_date?: string;
  note?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
}

export interface AvailabilityOverride {
  id: string;
  barber_id: string;
  start_time: string;
  end_time: string;
  kind: 'open' | 'closed';
  note?: string;
  created_by?: string;
  created_at: string;
}

// Get today's availability for all barbers (next 3 slots each)
export const getTodayAvailability = async (): Promise<Map<string, string[]>> => {
  const today = new Date().toISOString().split('T')[0];
  
  const { data: barbers, error } = await supabase
    .from('barbers')
    .select('id, full_name')
    .eq('is_active', true);

  if (error) throw error;

  const availabilityMap = new Map<string, string[]>();

  for (const barber of barbers || []) {
    try {
      const { data, error: funcError } = await supabase.functions.invoke('compute-availability', {
        body: {
          barber_id: barber.id,
          from_date: today,
          to_date: today,
          service_duration: 30
        }
      });

      if (funcError) {
        console.error(`Error fetching availability for barber ${barber.id}:`, funcError);
        continue;
      }

      const slots = data?.[0]?.time_slots?.slice(0, 3) || [];
      availabilityMap.set(barber.id, slots);
    } catch (err) {
      console.error(`Error computing availability for barber ${barber.id}:`, err);
    }
  }

  return availabilityMap;
};

// Get availability for specific barber over date range
export const getBarberAvailability = async (
  barberId: string,
  fromDate: string,
  toDate: string,
  serviceDuration = 30
): Promise<AvailabilitySlot[]> => {
  const { data, error } = await supabase.functions.invoke('compute-availability', {
    body: {
      barber_id: barberId,
      from_date: fromDate,
      to_date: toDate,
      service_duration: serviceDuration
    }
  });

  if (error) throw error;
  return data || [];
};

// Barber creates schedule change request
export const createScheduleRequest = async (payload: Partial<ScheduleRequest>): Promise<ScheduleRequest> => {
  const { data, error } = await supabase.functions.invoke('request-schedule-change', {
    body: payload
  });

  if (error) throw error;
  return data;
};

// Get barber's own schedule requests
export const getMyScheduleRequests = async (barberId: string): Promise<ScheduleRequest[]> => {
  const { data, error } = await supabase
    .from('schedule_change_requests')
    .select('*')
    .eq('barber_id', barberId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

// Admin: Get all schedule requests
export const getAllScheduleRequests = async (status?: 'pending' | 'approved' | 'rejected'): Promise<ScheduleRequest[]> => {
  let query = supabase
    .from('schedule_change_requests')
    .select('*, barbers(full_name)')
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

// Admin: Review schedule request
export const reviewScheduleRequest = async (
  requestId: string,
  approve: boolean,
  note?: string
): Promise<void> => {
  const { error } = await supabase.functions.invoke('review-schedule-change', {
    body: { request_id: requestId, approve, note }
  });

  if (error) throw error;
};

// Admin: Create availability override
export const createAvailabilityOverride = async (
  payload: Omit<AvailabilityOverride, 'id' | 'created_at' | 'created_by'>
): Promise<AvailabilityOverride> => {
  const { data, error } = await supabase.functions.invoke('admin-override-availability', {
    body: payload
  });

  if (error) throw error;
  return data;
};

// Admin: Get all overrides
export const getAllOverrides = async (barberId?: string): Promise<AvailabilityOverride[]> => {
  let query = supabase
    .from('availability_overrides')
    .select('*')
    .order('start_time', { ascending: true });

  if (barberId) {
    query = query.eq('barber_id', barberId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

// Admin: Delete override
export const deleteOverride = async (overrideId: string): Promise<void> => {
  const { error } = await supabase
    .from('availability_overrides')
    .delete()
    .eq('id', overrideId);

  if (error) throw error;
};