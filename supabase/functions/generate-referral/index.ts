import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateReferralRequest {
  customer_id: string;
}

// Generate random 8-character alphanumeric code
function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { customer_id }: GenerateReferralRequest = await req.json();

    if (!customer_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: customer_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating referral code for customer: ${customer_id}`);

    // Check if customer already has a referral code
    const { data: existingCode, error: checkError } = await supabase
      .from('referral_codes')
      .select('*')
      .eq('customer_id', customer_id)
      .maybeSingle();

    if (checkError) {
      console.error('Check error:', checkError);
      return new Response(
        JSON.stringify({ error: 'Failed to check existing referral codes' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If code exists, return it
    if (existingCode) {
      console.log(`Existing code found: ${existingCode.code}`);
      return new Response(
        JSON.stringify({
          success: true,
          referral_code: existingCode.code,
          times_used: existingCode.times_used,
          created_at: existingCode.created_at,
          referral_link: `${Deno.env.get('SUPABASE_URL').replace('//', '//')}signup?ref=${existingCode.code}`
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate new unique code
    let code = generateReferralCode();
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const { data: duplicate } = await supabase
        .from('referral_codes')
        .select('code')
        .eq('code', code)
        .maybeSingle();

      if (!duplicate) break;
      
      code = generateReferralCode();
      attempts++;
    }

    if (attempts >= maxAttempts) {
      return new Response(
        JSON.stringify({ error: 'Failed to generate unique referral code' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create new referral code
    const { data: newCode, error: createError } = await supabase
      .from('referral_codes')
      .insert({
        customer_id,
        code,
        times_used: 0
      })
      .select()
      .single();

    if (createError) {
      console.error('Create error:', createError);
      return new Response(
        JSON.stringify({ error: 'Failed to create referral code', details: createError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`New referral code created: ${code}`);

    return new Response(
      JSON.stringify({
        success: true,
        referral_code: newCode.code,
        times_used: 0,
        created_at: newCode.created_at,
        referral_link: `${Deno.env.get('SUPABASE_URL').replace('//', '//')}signup?ref=${code}`
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-referral:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
