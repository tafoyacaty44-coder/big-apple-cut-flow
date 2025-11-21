import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SetupWizardData {
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const setupData: SetupWizardData = await req.json();
    const { adminData, businessData, templateId, customServices, loadDemoData } = setupData;

    // Step 1: Create master admin user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminData.email,
      password: adminData.password,
      email_confirm: true,
      user_metadata: {
        full_name: adminData.fullName,
      },
    });

    if (authError) throw new Error(`Failed to create admin: ${authError.message}`);
    if (!authData.user) throw new Error('No user returned from auth');

    const userId = authData.user.id;

    // Step 2: Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        full_name: adminData.fullName,
      });

    if (profileError) throw new Error(`Failed to create profile: ${profileError.message}`);

    // Step 3: Assign master_admin role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role: 'master_admin',
      });

    if (roleError) throw new Error(`Failed to assign role: ${roleError.message}`);

    // Step 4: Create business config
    const businessConfig = {
      business_name: businessData.business_name,
      business_type: businessData.business_type,
      phone: businessData.phone || null,
      email: businessData.email || null,
      address: businessData.address || null,
      primary_color: businessData.primary_color || '#D4AF37',
      accent_color: businessData.accent_color || '#1A1A1A',
      logo_url: businessData.logo_url || null,
      hero_image_url: businessData.hero_image_url || null,
      staff_title: businessData.staff_title || 'Barber',
      service_title: businessData.service_title || 'Service',
      timezone: businessData.timezone || 'America/Chicago',
      currency: businessData.currency || 'USD',
      is_setup_complete: true,
    };

    const { data: configData, error: configError } = await supabase
      .from('business_config')
      .insert(businessConfig)
      .select()
      .single();

    if (configError) throw new Error(`Failed to create business config: ${configError.message}`);

    // Step 5: Apply template if selected
    if (templateId) {
      const { data: template, error: templateError } = await supabase
        .from('business_templates')
        .select('*, template_services(*)')
        .eq('id', templateId)
        .single();

      if (templateError) throw new Error(`Failed to fetch template: ${templateError.message}`);

      // Track applied template
      await supabase
        .from('applied_templates')
        .insert({
          template_id: templateId,
          applied_by: userId,
          config_snapshot: template,
        });

      // Create services from template (if not using custom services)
      const servicesToCreate = customServices && customServices.length > 0
        ? customServices
        : template.template_services || [];

      if (servicesToCreate.length > 0) {
        const services = servicesToCreate.map((svc: any, index: number) => ({
          name: svc.name,
          description: svc.description || null,
          regular_price: svc.regular_price || svc.price || 0,
          vip_price: svc.vip_price || svc.price || 0,
          duration_minutes: svc.duration_minutes || 30,
          category: svc.category || 'standard',
          image_url: null,
          display_order: index,
          is_active: true,
        }));

        const { error: servicesError } = await supabase
          .from('services')
          .insert(services);

        if (servicesError) throw new Error(`Failed to create services: ${servicesError.message}`);
      }
    }

    // Step 6: Load demo data if requested
    if (loadDemoData) {
      // Invoke the existing seed-demo-data function
      const { error: seedError } = await supabase.functions.invoke('seed-demo-data', {
        body: { skipAuth: true },
      });

      if (seedError) {
        console.error('Failed to seed demo data:', seedError);
        // Don't fail the entire setup if demo data fails
      }
    }

    // Step 7: Log admin action
    await supabase
      .from('admin_actions')
      .insert({
        admin_user_id: userId,
        action_type: 'setup_wizard_complete',
        target_table: 'business_config',
        target_id: configData.id,
        details: {
          template_id: templateId,
          loaded_demo_data: loadDemoData,
        },
      });

    return new Response(
      JSON.stringify({
        success: true,
        userId,
        businessId: configData.id,
        message: 'Setup completed successfully',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Setup wizard error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Setup failed',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
