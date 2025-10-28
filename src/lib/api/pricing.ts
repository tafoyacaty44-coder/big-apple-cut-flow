import { supabase } from "@/integrations/supabase/client";

export interface ServicePrice {
  id: string;
  service_id: string;
  barber_id: string | null;
  default_price_cents: number;
  vip_price_cents: number | null;
}

export const getServicePrices = async (): Promise<ServicePrice[]> => {
  const { data, error } = await supabase
    .from('service_prices')
    .select('*');

  if (error) throw error;
  return data || [];
};

export const getServicePriceForBarber = async (
  serviceId: string,
  barberId: string
): Promise<ServicePrice | null> => {
  const { data, error } = await supabase
    .from('service_prices')
    .select('*')
    .eq('service_id', serviceId)
    .eq('barber_id', barberId)
    .single();

  if (error) throw error;
  return data;
};

export const upsertServicePrice = async (
  serviceId: string,
  barberId: string | null,
  defaultPriceCents: number,
  vipPriceCents: number | null
): Promise<ServicePrice> => {
  const { data, error } = await supabase
    .from('service_prices')
    .upsert({
      service_id: serviceId,
      barber_id: barberId,
      default_price_cents: defaultPriceCents,
      vip_price_cents: vipPriceCents,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};
