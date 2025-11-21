import { supabase } from "@/integrations/supabase/client";

// Template Management
export const getAppliedTemplates = async () => {
  const { data, error } = await supabase
    .from('applied_templates')
    .select('*, business_templates(*)')
    .order('applied_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const applyTemplate = async (
  templateId: string, 
  preserveExisting: boolean,
  customizations?: any
) => {
  const { data, error } = await supabase.functions.invoke('apply-business-template', {
    body: { templateId, preserveExisting, customizations }
  });
  
  if (error) throw error;
  return data;
};

export const exportConfig = async () => {
  const { data, error } = await supabase.functions.invoke('export-business-config');
  
  if (error) throw error;
  return data;
};

// Database Management
export const resetDatabase = async (confirmation: string) => {
  const { data, error } = await supabase.functions.invoke('reset-database', {
    body: { confirmation, preserveMasterAdmin: true }
  });
  
  if (error) throw error;
  return data;
};

export const getDatabaseStats = async () => {
  const tables = ['appointments', 'clients', 'services', 'barbers', 'gallery_images', 'blog_posts'] as const;
  
  const stats: Record<string, number> = {};
  
  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    
    if (!error) stats[table] = count || 0;
  }
  
  return stats;
};

// Branding Management
export const updateBrandingAsset = async (
  assetType: 'logo' | 'hero' | 'background',
  file: File
) => {
  // Upload to Storage
  const bucketName = assetType === 'logo' ? 'service-images' : 'gallery-images';
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(`branding/${Date.now()}-${file.name}`, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) throw uploadError;

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucketName)
    .getPublicUrl(uploadData.path);

  // Update business_config via edge function
  const { data, error } = await supabase.functions.invoke('update-branding', {
    body: { assetType, url: publicUrl }
  });

  if (error) throw error;
  return publicUrl;
};

export const updateColors = async (primaryColor: string, accentColor: string) => {
  const { data: config, error: fetchError } = await supabase
    .from('business_config')
    .select('id')
    .single();

  if (fetchError) throw fetchError;

  const { error } = await supabase
    .from('business_config')
    .update({ 
      primary_color: primaryColor, 
      accent_color: accentColor 
    })
    .eq('id', config.id);

  if (error) throw error;
};

export const updateBackgroundOpacity = async (opacity: number) => {
  const { data: config, error: fetchError } = await supabase
    .from('business_config')
    .select('id')
    .single();

  if (fetchError) throw fetchError;

  const { error } = await supabase
    .from('business_config')
    .update({ background_opacity: opacity })
    .eq('id', config.id);

  if (error) throw error;
};

// User & Role Management
export const getAllUsers = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      phone,
      created_at,
      user_roles (role)
    `)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const promoteToMasterAdmin = async (targetEmail: string) => {
  const { data, error } = await supabase.functions.invoke('promote-to-master-admin', {
    body: { targetEmail }
  });
  
  if (error) throw error;
  return data;
};

// System Information
export const getSystemInfo = async () => {
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  
  const { data: config } = await supabase
    .from('business_config')
    .select('*')
    .single();
  
  const { data: templates } = await supabase
    .from('applied_templates')
    .select('*, business_templates(name)')
    .order('applied_at', { ascending: false })
    .limit(1);
  
  return {
    projectId,
    supabaseUrl: supabaseUrl?.replace(/^https?:\/\//, ''),
    businessConfig: config,
    currentTemplate: templates?.[0] || null,
    setupCompletedAt: config?.created_at,
    lastUpdated: config?.updated_at
  };
};
