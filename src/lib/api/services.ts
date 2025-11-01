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

export const getAddonServices = async (): Promise<Service[]> => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .eq('category', 'addon')
    .order('display_order');

  if (error) throw error;
  return data || [];
};

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

export interface CreateServiceData {
  name: string;
  description: string | null;
  regular_price: number;
  vip_price: number;
  duration_minutes: number;
  category: string;
  image_url: string | null;
  display_order?: number;
}

export const createService = async (data: CreateServiceData): Promise<Service> => {
  const { data: service, error } = await supabase
    .from('services')
    .insert([{ ...data, is_active: true }] as any)
    .select()
    .single();

  if (error) throw error;
  return service;
};

export const updateService = async (
  id: string,
  data: Partial<CreateServiceData>
): Promise<Service> => {
  const { data: service, error } = await supabase
    .from('services')
    .update(data as any)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return service;
};

export const deleteService = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('services')
    .update({ is_active: false })
    .eq('id', id);

  if (error) throw error;
};

export const toggleServiceActive = async (id: string, isActive: boolean): Promise<void> => {
  const { error } = await supabase
    .from('services')
    .update({ is_active: isActive })
    .eq('id', id);

  if (error) throw error;
};

export const reorderServices = async (serviceIds: string[]): Promise<void> => {
  const promises = serviceIds.map((id, index) =>
    supabase
      .from('services')
      .update({ display_order: index })
      .eq('id', id)
  );

  const results = await Promise.all(promises);
  const errors = results.filter(r => r.error);
  
  if (errors.length > 0) {
    throw new Error(`Failed to reorder ${errors.length} service(s)`);
  }
};

export const uploadServiceImage = async (file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('service-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('service-images')
    .getPublicUrl(filePath);

  return publicUrl;
};

export const deleteServiceImage = async (url: string): Promise<void> => {
  // Extract the file path from the URL
  const urlParts = url.split('/service-images/');
  if (urlParts.length < 2) return;
  
  const filePath = urlParts[1];
  
  const { error } = await supabase.storage
    .from('service-images')
    .remove([filePath]);

  if (error) throw error;
};
