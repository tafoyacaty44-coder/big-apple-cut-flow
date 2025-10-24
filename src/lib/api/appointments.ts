import { supabase } from "@/integrations/supabase/client";

export interface Appointment {
  id: string;
  confirmation_number: string;
  customer_id: string | null;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  barber_id: string | null;
  service_id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  payment_status: string;
  payment_amount: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const createAppointment = async (appointmentData: any): Promise<Appointment> => {
  const { data, error } = await supabase
    .from('appointments')
    .insert([appointmentData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getCustomerAppointments = async (customerId: string): Promise<Appointment[]> => {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('customer_id', customerId)
    .order('appointment_date', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const getAppointmentByConfirmation = async (confirmationNumber: string): Promise<Appointment | null> => {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('confirmation_number', confirmationNumber)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const cancelAppointment = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', id);

  if (error) throw error;
};
