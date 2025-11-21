import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the authenticated user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if the caller is at least an admin
    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleError || !userRole || !['admin', 'master_admin'].includes(userRole.role)) {
      return new Response(
        JSON.stringify({ error: 'You must be an admin to use this feature' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if a master_admin already exists
    const { data: existingMasterAdmin, error: checkError } = await supabase
      .from('user_roles')
      .select('id')
      .eq('role', 'master_admin')
      .limit(1)
      .maybeSingle();

    if (checkError) {
      throw checkError;
    }

    if (existingMasterAdmin) {
      return new Response(
        JSON.stringify({ error: 'A master admin already exists in this project' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Delete the user's existing role
    const { error: deleteError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', user.id);

    if (deleteError) {
      throw deleteError;
    }

    // Insert the master_admin role
    const { error: insertError } = await supabase
      .from('user_roles')
      .insert({ user_id: user.id, role: 'master_admin' });

    if (insertError) {
      throw insertError;
    }

    // Log the action to admin_actions table
    await supabase
      .from('admin_actions')
      .insert({
        admin_user_id: user.id,
        action_type: 'bootstrap_master_admin',
        target_id: user.id,
        target_table: 'user_roles',
        details: {
          email: user.email,
          timestamp: new Date().toISOString(),
          action: 'Bootstrap master admin role claimed'
        }
      });

    console.log(`User ${user.email} (${user.id}) successfully bootstrapped to master_admin`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'You are now the master admin',
        user_id: user.id,
        email: user.email
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Bootstrap master admin error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
