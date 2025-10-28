import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RedeemPointsRequest {
  customer_id: string;
  service_price: number;
  appointment_id?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { customer_id, service_price, appointment_id }: RedeemPointsRequest = await req.json();

    if (!customer_id || !service_price) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: customer_id and service_price' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Redeeming points for customer: ${customer_id}, service price: ${service_price}`);

    // Get customer's current points
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('rewards_points')
      .eq('id', customer_id)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'Customer profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const currentPoints = profile.rewards_points || 0;

    // Get applicable tier based on current points
    const { data: tiers, error: tiersError } = await supabase
      .from('reward_tiers')
      .select('*')
      .lte('min_points', currentPoints)
      .order('min_points', { ascending: false })
      .limit(1);

    if (tiersError) {
      console.error('Tiers fetch error:', tiersError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch reward tiers' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const applicableTier = tiers && tiers.length > 0 ? tiers[0] : null;

    if (!applicableTier) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'No reward tier available yet',
          current_points: currentPoints,
          discount_amount: 0,
          discount_percent: 0,
          final_price: service_price
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate discount
    const discountPercent = applicableTier.discount_percent;
    const discountAmount = (service_price * discountPercent) / 100;
    const finalPrice = Math.max(0, service_price - discountAmount);

    // For Gold tier (100% discount), deduct the required points
    let pointsToDeduct = 0;
    if (discountPercent === 100 && applicableTier.min_points > 0) {
      pointsToDeduct = applicableTier.min_points;
      
      // Create redemption transaction
      const { error: transactionError } = await supabase
        .from('rewards_activity')
        .insert({
          customer_id,
          action_type: 'redeemed',
          points_earned: 0,
          points_redeemed: pointsToDeduct,
          related_appointment_id: appointment_id || null,
          description: `Redeemed ${applicableTier.name} - Free service`
        });

      if (transactionError) {
        console.error('Transaction error:', transactionError);
        return new Response(
          JSON.stringify({ error: 'Failed to create redemption transaction' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    console.log(`Redemption calculated: ${discountPercent}% off, discount: $${discountAmount.toFixed(2)}`);

    return new Response(
      JSON.stringify({
        success: true,
        current_points: currentPoints,
        tier_name: applicableTier.name,
        discount_percent: discountPercent,
        discount_amount: discountAmount,
        final_price: finalPrice,
        points_deducted: pointsToDeduct,
        new_balance: currentPoints - pointsToDeduct
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in redeem-points:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
