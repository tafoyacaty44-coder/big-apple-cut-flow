import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify user from JWT
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is master_admin
    const { data: roleCheck, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'master_admin')
      .single();

    if (roleError || !roleCheck) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: master_admin role required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { assetType, url } = await req.json();

    // Determine which field to update
    const fieldMap = {
      'logo': 'logo_url',
      'hero': 'hero_image_url',
      'background': 'background_pattern_url'
    };

    const field = fieldMap[assetType as keyof typeof fieldMap];
    if (!field) {
      return new Response(
        JSON.stringify({ error: 'Invalid asset type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update business_config
    const { data: config, error: configError } = await supabase
      .from('business_config')
      .update({ [field]: url })
      .select()
      .single();

    if (configError) {
      throw new Error(`Failed to update config: ${configError.message}`);
    }

    // Log admin action
    await supabase
      .from('admin_actions')
      .insert({
        admin_user_id: user.id,
        action_type: 'branding_update',
        target_table: 'business_config',
        target_id: config.id,
        details: {
          asset_type: assetType,
          url: url
        }
      });

    return new Response(
      JSON.stringify({ success: true, config }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Update branding error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Update failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
