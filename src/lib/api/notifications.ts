import { supabase } from "@/integrations/supabase/client";

export interface Notification {
  id: string;
  appointment_id: string | null;
  channel: 'email' | 'sms';
  template: string;
  provider_message_id: string | null;
  sent_at: string | null;
  error: string | null;
  created_at: string;
}

export interface NotificationJob {
  id: string;
  appointment_id: string | null;
  channel: 'email' | 'sms';
  template: string;
  scheduled_for: string;
  attempts: number;
  status: 'queued' | 'sent' | 'failed' | 'canceled';
  last_error: string | null;
  created_at: string;
}

export const getNotifications = async (): Promise<Notification[]> => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) throw error;
  return data as unknown as Notification[];
};

export const getNotificationJobs = async (): Promise<NotificationJob[]> => {
  const { data, error } = await supabase
    .from('notification_jobs')
    .select('*')
    .order('scheduled_for', { ascending: false })
    .limit(100);

  if (error) throw error;
  return data as unknown as NotificationJob[];
};

export const scheduleAppointmentMessages = async (
  appointmentId: string,
  eventType: 'created' | 'verified' | 'rescheduled' | 'canceled'
) => {
  const { data, error } = await supabase.functions.invoke('schedule-appointment-messages', {
    body: {
      appointment_id: appointmentId,
      event_type: eventType,
    },
  });

  if (error) throw error;
  return data;
};

export const retryNotificationJob = async (jobId: string) => {
  const { error } = await supabase
    .from('notification_jobs')
    .update({
      status: 'queued',
      scheduled_for: new Date().toISOString(),
      attempts: 0,
      last_error: null,
    })
    .eq('id', jobId);

  if (error) throw error;
};
