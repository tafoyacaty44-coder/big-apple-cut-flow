import { supabase } from "@/integrations/supabase/client";

export interface RewardAction {
  id: string;
  code: string;
  description: string | null;
  points: number;
  is_active: boolean;
  created_at: string;
}

export interface RewardTier {
  id: string;
  name: string;
  min_points: number;
  discount_percent: number;
  benefits: string[] | null;
  display_order: number;
  created_at: string;
}

export interface RewardTransaction {
  id: string;
  customer_id: string;
  action_type: string;
  points_earned: number;
  points_redeemed: number;
  created_at: string;
  action_id: string | null;
  description: string | null;
  related_appointment_id: string | null;
}

export interface ReferralCode {
  id: string;
  customer_id: string;
  code: string;
  times_used: number;
  created_at: string;
}

export interface RewardsBalance {
  total_points: number;
  current_tier: RewardTier | null;
  next_tier: RewardTier | null;
  progress_percent: number;
}

// Get customer's rewards balance and tier info
export const getRewardsBalance = async (customerId: string): Promise<RewardsBalance> => {
  // Get current points
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('rewards_points')
    .eq('id', customerId)
    .single();

  if (profileError) throw profileError;

  const totalPoints = profile?.rewards_points || 0;

  // Get all tiers
  const { data: tiers, error: tiersError } = await supabase
    .from('reward_tiers')
    .select('*')
    .order('min_points', { ascending: true });

  if (tiersError) throw tiersError;

  // Find current tier (highest tier below or equal to current points)
  const currentTier = tiers
    ?.filter(tier => tier.min_points <= totalPoints)
    .sort((a, b) => b.min_points - a.min_points)[0] || null;

  // Find next tier (lowest tier above current points)
  const nextTier = tiers
    ?.filter(tier => tier.min_points > totalPoints)
    .sort((a, b) => a.min_points - b.min_points)[0] || null;

  // Calculate progress to next tier
  let progressPercent = 0;
  if (nextTier && currentTier) {
    const pointsIntoCurrentTier = totalPoints - currentTier.min_points;
    const pointsNeededForNext = nextTier.min_points - currentTier.min_points;
    progressPercent = (pointsIntoCurrentTier / pointsNeededForNext) * 100;
  } else if (nextTier && !currentTier) {
    progressPercent = (totalPoints / nextTier.min_points) * 100;
  } else if (!nextTier && currentTier) {
    progressPercent = 100; // At max tier
  }

  return {
    total_points: totalPoints,
    current_tier: currentTier,
    next_tier: nextTier,
    progress_percent: Math.min(progressPercent, 100)
  };
};

// Get customer's reward transactions
export const getRewardsTransactions = async (
  customerId: string,
  limit: number = 50
): Promise<RewardTransaction[]> => {
  const { data, error } = await supabase
    .from('rewards_activity')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
};

// Get all reward actions
export const getRewardActions = async (): Promise<RewardAction[]> => {
  const { data, error } = await supabase
    .from('reward_actions')
    .select('*')
    .eq('is_active', true)
    .order('points', { ascending: false });

  if (error) throw error;
  return data || [];
};

// Get all reward tiers
export const getRewardTiers = async (): Promise<RewardTier[]> => {
  const { data, error } = await supabase
    .from('reward_tiers')
    .select('*')
    .order('min_points', { ascending: true });

  if (error) throw error;
  return data || [];
};

// Get or create referral code
export const getReferralCode = async (customerId: string): Promise<ReferralCode> => {
  const { data, error } = await supabase.functions.invoke('generate-referral', {
    body: { customer_id: customerId }
  });

  if (error) throw error;
  if (!data.success) throw new Error(data.error || 'Failed to generate referral code');

  return {
    id: '',
    customer_id: customerId,
    code: data.referral_code,
    times_used: data.times_used,
    created_at: data.created_at
  };
};

// Award points (admin or automatic)
export const awardPoints = async (
  customerId: string,
  actionCode: string,
  appointmentId?: string
): Promise<any> => {
  const { data, error } = await supabase.functions.invoke('award-points', {
    body: {
      customer_id: customerId,
      action_code: actionCode,
      appointment_id: appointmentId
    }
  });

  if (error) throw error;
  if (!data.success) throw new Error(data.error || 'Failed to award points');
  
  return data;
};

// Calculate redemption discount
export const calculateRedemption = async (
  customerId: string,
  servicePrice: number,
  appointmentId?: string
): Promise<any> => {
  const { data, error } = await supabase.functions.invoke('redeem-points', {
    body: {
      customer_id: customerId,
      service_price: servicePrice,
      appointment_id: appointmentId
    }
  });

  if (error) throw error;
  return data;
};
