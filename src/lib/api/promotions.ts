import { supabase } from "@/integrations/supabase/client";

export interface PromotionalCampaign {
  id: string;
  title: string;
  type: 'promotional' | 'announcement' | 'seasonal' | 'loyalty';
  channel: 'email' | 'sms' | 'both';
  subject?: string;
  message_body: string;
  email_html?: string;
  target_audience: 'all_customers' | 'vip_only' | 'recent_customers' | 'inactive_customers' | 'custom';
  custom_filters?: any;
  custom_recipient_ids?: string[];
  custom_phone_numbers?: string[];
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'canceled';
  scheduled_for?: string;
  sent_at?: string;
  created_by: string;
  total_recipients: number;
  sent_count: number;
  failed_count: number;
  click_through_count: number;
  promo_code?: string;
  promo_discount?: number;
  promo_expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CampaignRecipient {
  id: string;
  campaign_id: string;
  client_id: string;
  channel: 'email' | 'sms';
  status: 'queued' | 'sent' | 'failed' | 'bounced' | 'clicked';
  sent_at?: string;
  error_message?: string;
  clicked_at?: string;
  created_at: string;
}

export const getCampaigns = async (filters?: {
  status?: PromotionalCampaign['status'];
  type?: PromotionalCampaign['type'];
}): Promise<PromotionalCampaign[]> => {
  let query = supabase
    .from('promotional_campaigns')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.type) {
    query = query.eq('type', filters.type);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as PromotionalCampaign[];
};

export const getCampaign = async (id: string): Promise<PromotionalCampaign> => {
  const { data, error } = await supabase
    .from('promotional_campaigns')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as PromotionalCampaign;
};

export const createCampaign = async (
  campaign: Omit<PromotionalCampaign, 'id' | 'created_at' | 'updated_at' | 'sent_count' | 'failed_count' | 'click_through_count' | 'total_recipients'>
): Promise<PromotionalCampaign> => {
  const { data, error } = await supabase
    .from('promotional_campaigns')
    .insert(campaign)
    .select()
    .single();

  if (error) throw error;
  return data as PromotionalCampaign;
};

export const updateCampaign = async (
  id: string,
  updates: Partial<PromotionalCampaign>
): Promise<PromotionalCampaign> => {
  const { data, error } = await supabase
    .from('promotional_campaigns')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as PromotionalCampaign;
};

export const deleteCampaign = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('promotional_campaigns')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const sendCampaign = async (id: string): Promise<any> => {
  const { data, error } = await supabase.functions.invoke('send-promotional-campaign', {
    body: { campaign_id: id },
  });

  if (error) throw error;
  return data;
};

export const pauseCampaign = async (id: string): Promise<void> => {
  await updateCampaign(id, { status: 'paused' });
};

export const cancelCampaign = async (id: string): Promise<void> => {
  await updateCampaign(id, { status: 'canceled' });
};

export const duplicateCampaign = async (id: string): Promise<PromotionalCampaign> => {
  const original = await getCampaign(id);
  
  const duplicate = {
    ...original,
    title: `${original.title} (Copy)`,
    status: 'draft' as const,
    scheduled_for: undefined,
    sent_at: undefined,
    sent_count: 0,
    failed_count: 0,
    click_through_count: 0,
    total_recipients: 0,
  };

  // Remove fields that shouldn't be copied
  delete (duplicate as any).id;
  delete (duplicate as any).created_at;
  delete (duplicate as any).updated_at;

  return createCampaign(duplicate);
};

export const getRecipientCount = async (targetAudience: string): Promise<number> => {
  // This would call the database to get estimated recipient count
  // For now, return a placeholder
  const { count, error } = await supabase
    .from('clients')
    .select('*', { count: 'exact', head: true })
    .eq('opt_in_email', true);

  if (error) throw error;
  return count || 0;
};

export const getCampaignRecipients = async (campaignId: string): Promise<CampaignRecipient[]> => {
  const { data, error } = await supabase
    .from('campaign_recipients')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as CampaignRecipient[];
};

export const generatePromoCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};
