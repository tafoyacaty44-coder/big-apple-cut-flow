import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify caller is master_admin
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Invalid authentication');
    }

    const { data: callerRole, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleError || callerRole?.role !== 'master_admin') {
      throw new Error('Unauthorized: Only master admins can promote users');
    }

    const { targetEmail } = await req.json();

    if (!targetEmail) {
      throw new Error('Target email is required');
    }

    // Find target user by email
    const { data: targetUser, error: targetUserError } = await supabase.auth.admin.listUsers();
    
    if (targetUserError) {
      throw new Error('Failed to lookup user');
    }

    const foundUser = targetUser.users.find((u: any) => u.email === targetEmail);
    
    if (!foundUser) {
      throw new Error(`User with email ${targetEmail} not found`);
    }

    // Check if user already has master_admin role
    const { data: existingRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', foundUser.id)
      .single();

    if (existingRole?.role === 'master_admin') {
      throw new Error('User is already a master admin');
    }

    // Delete existing role
    await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', foundUser.id);

    // Insert master_admin role
    const { error: insertError } = await supabase
      .from('user_roles')
      .insert({
        user_id: foundUser.id,
        role: 'master_admin',
      });

    if (insertError) {
      console.error('Insert role error:', insertError);
      throw new Error('Failed to update user role');
    }

    // Log admin action
    await supabase.from('admin_actions').insert({
      admin_user_id: user.id,
      action_type: 'promote_to_master_admin',
      target_table: 'user_roles',
      target_id: foundUser.id,
      details: { target_email: targetEmail },
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `User ${targetEmail} promoted to master_admin`,
        userId: foundUser.id 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error: any) {
    console.error('Error in promote-to-master-admin:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});
