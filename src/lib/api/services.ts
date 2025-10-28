import { supabase } from "@/integrations/supabase/client";

export interface Service {
  id: string;
  name: string;
  description: string | null;
  regular_price: number;
  vip_price: number;
  duration_minutes: number;
  image_url: string | null;
  category: string;
  is_active: boolean;
  display_order: number;
}

export const getServices = async (): Promise<Service[]> => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('display_order');

  if (error) throw error;
  return data || [];
};

export const getServiceById = async (id: string): Promise<Service | null> => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

// Alias for getServices (for consistency)
export const getActiveServices = getServices;

export const updateServiceVipPrice = async (
  serviceId: string,
  vipPrice: number
): Promise<Service> => {
  const { data, error } = await supabase
    .from('services')
    .update({ vip_price: vipPrice })
    .eq('id', serviceId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const bulkUpdateVipPrices = async (
  updates: { serviceId: string; vipPrice: number }[]
): Promise<void> => {
  const promises = updates.map(({ serviceId, vipPrice }) =>
    supabase
      .from('services')
      .update({ vip_price: vipPrice })
      .eq('id', serviceId)
  );

  const results = await Promise.all(promises);
  const errors = results.filter(r => r.error);
  
  if (errors.length > 0) {
    throw new Error(`Failed to update ${errors.length} service(s)`);
  }
};
