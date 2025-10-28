import { supabase } from "@/integrations/supabase/client";

export interface VipSettings {
  id: number;
  enabled: boolean;
  vip_code: string | null;
}

export const getVipSettings = async (): Promise<VipSettings | null> => {
  const { data, error } = await supabase
    .from('vip_settings')
    .select('*')
    .eq('id', 1)
    .single();

  if (error) throw error;
  return data;
};

export const updateVipSettings = async (
  enabled: boolean,
  vipCode: string
): Promise<VipSettings> => {
  const { data, error } = await supabase
    .from('vip_settings')
    .update({
      enabled,
      vip_code: vipCode,
    })
    .eq('id', 1)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const validateVipCode = async (code: string): Promise<boolean> => {
  const settings = await getVipSettings();
  return settings?.enabled && settings.vip_code === code;
};
