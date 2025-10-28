import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AwardPointsRequest {
  client_id?: string;
  customer_id?: string;
  action_code: string;
  appointment_id?: string;
  custom_amount?: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { client_id, customer_id, action_code, appointment_id, custom_amount }: AwardPointsRequest = await req.json();

    // Use either client_id or customer_id (supporting both for flexibility)
    const targetId = customer_id || client_id;
    
    if (!targetId || !action_code) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: customer_id/client_id and action_code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Awarding points: action=${action_code}, customer=${targetId}`);

    // Get the reward action
    const { data: action, error: actionError } = await supabase
      .from('reward_actions')
      .select('*')
      .eq('code', action_code)
      .eq('is_active', true)
      .single();

    if (actionError || !action) {
      console.error('Action not found:', actionError);
      return new Response(
        JSON.stringify({ error: `Reward action '${action_code}' not found or inactive` }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const pointsToAward = custom_amount || action.points;

    // Create transaction in rewards_activity
    const { data: transaction, error: transactionError } = await supabase
      .from('rewards_activity')
      .insert({
        customer_id: targetId,
        action_type: 'earned',
        points_earned: pointsToAward,
        points_redeemed: 0,
        action_id: action.id,
        related_appointment_id: appointment_id || null,
        description: action.description
      })
      .select()
      .single();

    if (transactionError) {
      console.error('Transaction error:', transactionError);
      return new Response(
        JSON.stringify({ error: 'Failed to create reward transaction', details: transactionError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get updated balance (trigger already updated profiles.rewards_points)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('rewards_points')
      .eq('id', targetId)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
    }

    console.log(`Points awarded successfully: ${pointsToAward} points, new balance: ${profile?.rewards_points || 0}`);

    return new Response(
      JSON.stringify({
        success: true,
        points_awarded: pointsToAward,
        new_balance: profile?.rewards_points || 0,
        transaction_id: transaction.id,
        action: action.code
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in award-points:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
