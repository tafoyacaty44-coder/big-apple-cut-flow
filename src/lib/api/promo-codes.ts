import { supabase } from "@/integrations/supabase/client";

export interface PromoCodeValidation {
  valid: boolean;
  discount: number;
  campaign_id?: string;
  error?: string;
}

export const validatePromoCode = async (code: string): Promise<PromoCodeValidation> => {
  if (!code || code.trim().length === 0) {
    return { valid: false, discount: 0, error: 'Please enter a promo code' };
  }

  try {
    const { data, error } = await supabase
      .from('promotional_campaigns')
      .select('id, promo_code, promo_discount, promo_expires_at, status')
      .eq('promo_code', code.toUpperCase().trim())
      .in('status', ['sent', 'scheduled'])
      .maybeSingle();

    if (error) {
      console.error('Error validating promo code:', error);
      return { valid: false, discount: 0, error: 'Failed to validate code' };
    }

    if (!data) {
      return { valid: false, discount: 0, error: 'Invalid promo code' };
    }

    // Check expiration
    if (data.promo_expires_at) {
      const expirationDate = new Date(data.promo_expires_at);
      if (expirationDate < new Date()) {
        return { valid: false, discount: 0, error: 'This promo code has expired' };
      }
    }

    return {
      valid: true,
      discount: data.promo_discount || 0,
      campaign_id: data.id,
    };
  } catch (error: any) {
    console.error('Error validating promo code:', error);
    return { valid: false, discount: 0, error: 'Failed to validate code' };
  }
};

export const trackPromoUsage = async (campaignId: string): Promise<void> => {
  try {
    // Increment click_through_count on campaign
    const { data: campaign } = await supabase
      .from('promotional_campaigns')
      .select('click_through_count')
      .eq('id', campaignId)
      .single();

    if (campaign) {
      await supabase
        .from('promotional_campaigns')
        .update({ click_through_count: (campaign.click_through_count || 0) + 1 })
        .eq('id', campaignId);
    }

    console.log(`Tracked promo code usage for campaign ${campaignId}`);
  } catch (error) {
    console.error('Error tracking promo usage:', error);
  }
};
