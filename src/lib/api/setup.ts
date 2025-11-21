import { supabase } from "@/integrations/supabase/client";

export interface BusinessConfig {
  id: string;
  business_name: string;
  business_type: string;
  staff_title: string;
  service_title: string;
  primary_color: string;
  accent_color: string;
  logo_url: string | null;
  hero_image_url: string | null;
  currency: string;
  timezone: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  is_setup_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface BusinessTemplate {
  id: string;
  name: string;
  business_type: string;
  description: string | null;
  config_json: any;
  preview_image_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface SetupWizardData {
  adminData: {
    email: string;
    password: string;
    fullName: string;
  };
  businessData: {
    business_name: string;
    business_type: string;
    phone?: string;
    email?: string;
    address?: string;
    primary_color?: string;
    accent_color?: string;
    logo_url?: string;
    hero_image_url?: string;
    staff_title?: string;
    service_title?: string;
    timezone?: string;
    currency?: string;
  };
  templateId?: string;
  customServices?: any[];
  loadDemoData: boolean;
}

// Check if setup is needed
export const checkSetupNeeded = async (userRole?: string): Promise<boolean> => {
  try {
    // First check if there's any master_admin
    const { data: masterAdmin, error: adminError } = await supabase
      .from('user_roles')
      .select('id')
      .eq('role', 'master_admin')
      .limit(1)
      .single();

    // If no master admin exists, it's a fresh install - setup needed
    if (adminError || !masterAdmin) {
      return true;
    }

    // If master admin exists, only allow setup for master_admin users
    if (userRole !== 'master_admin') {
      return false;
    }

    // Check if setup is complete
    const { data: config } = await supabase
      .from('business_config')
      .select('is_setup_complete')
      .single();

    // If no config or incomplete, setup needed for master_admin
    return !config || !config.is_setup_complete;
  } catch (error) {
    console.error('Error checking setup status:', error);
    return false;
  }
};

// Get business config
export const getBusinessConfig = async (): Promise<BusinessConfig | null> => {
  const { data, error } = await supabase
    .from('business_config')
    .select('*')
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  return data;
};

// Get all templates
export const getBusinessTemplates = async (): Promise<BusinessTemplate[]> => {
  const { data, error } = await supabase
    .from('business_templates')
    .select('*')
    .eq('is_active', true)
    .order('created_at');

  if (error) throw error;
  return data || [];
};

// Complete setup wizard
export const completeSetupWizard = async (setupData: SetupWizardData) => {
  const { data, error } = await supabase.functions.invoke('setup-wizard-complete', {
    body: setupData,
  });

  if (error) throw error;
  return data;
};

// Mark setup as skipped (stores flag in localStorage)
export const skipSetup = () => {
  localStorage.setItem('setup_wizard_skipped', 'true');
};

// Check if setup was skipped
export const wasSetupSkipped = (): boolean => {
  return localStorage.getItem('setup_wizard_skipped') === 'true';
};

// Upload business logo
export const uploadBusinessLogo = async (file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `logo-${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('service-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('service-images')
    .getPublicUrl(fileName);

  return publicUrl;
};

// Upload hero image
export const uploadHeroImage = async (file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `hero-${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('gallery-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('gallery-images')
    .getPublicUrl(fileName);

  return publicUrl;
};
