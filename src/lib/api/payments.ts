import { supabase } from '@/integrations/supabase/client';

export interface Payment {
  id: string;
  appointment_id: string;
  method: 'zelle' | 'apple_pay' | 'cash_app';
  amount_cents: number;
  reference: string | null;
  proof_url: string | null;
  status: 'pending' | 'verified' | 'rejected';
  verified_by: string | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentWithDetails extends Payment {
  appointments?: {
    appointment_date: string;
    appointment_time: string;
    services?: { name: string };
    barbers?: { full_name: string };
    clients?: { full_name: string; email: string; phone: string };
  };
}

export const uploadPaymentProof = async (
  file: File,
  customerId: string
): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${customerId}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('payment-proofs')
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('payment-proofs')
    .getPublicUrl(fileName);

  return data.publicUrl;
};

export const submitPayment = async (paymentData: {
  appointmentId: string;
  method: 'zelle' | 'apple_pay' | 'cash_app';
  amountCents: number;
  reference?: string;
  proofUrl?: string;
}): Promise<void> => {
  const { error } = await supabase
    .from('payments')
    .update({
      method: paymentData.method,
      reference: paymentData.reference || null,
      proof_url: paymentData.proofUrl || null,
      updated_at: new Date().toISOString(),
    })
    .eq('appointment_id', paymentData.appointmentId);

  if (error) throw error;
};

export const getPaymentByAppointment = async (
  appointmentId: string
): Promise<Payment | null> => {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('appointment_id', appointmentId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const getAllPendingPayments = async (): Promise<PaymentWithDetails[]> => {
  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      appointments (
        appointment_date,
        appointment_time,
        services ( name ),
        barbers ( full_name ),
        clients ( full_name, email, phone )
      )
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as PaymentWithDetails[];
};

export const verifyPayment = async (
  paymentId: string,
  status: 'verified' | 'rejected'
): Promise<void> => {
  const { error } = await supabase.functions.invoke('verify-payment', {
    body: { paymentId, status },
  });

  if (error) throw error;
};
