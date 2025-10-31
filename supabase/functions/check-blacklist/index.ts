import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';

console.log('check-blacklist function started');

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, phone } = await req.json();

    if (!email && !phone) {
      return new Response(
        JSON.stringify({ error: 'Email or phone required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Normalize inputs
    const emailNorm = email ? email.toLowerCase().trim() : null;
    const phoneNorm = phone ? phone.replace(/\D/g, '') : null; // Remove all non-digits

    console.log('Checking blacklist for:', { emailNorm, phoneNorm });

    // Query blacklist table
    let query = supabase
      .from('blacklisted_customers')
      .select('id')
      .limit(1);

    // Build OR condition
    const orConditions = [];
    if (emailNorm) orConditions.push(`email_norm.eq.${emailNorm}`);
    if (phoneNorm) orConditions.push(`phone_norm.eq.${phoneNorm}`);

    if (orConditions.length > 0) {
      query = query.or(orConditions.join(','));
    }

    const { data, error } = await query;

    if (error) {
      console.error('Blacklist check error:', error);
      throw error;
    }

    const blacklisted = !!(data && data.length > 0);
    
    console.log('Blacklist check result:', { blacklisted });

    return new Response(
      JSON.stringify({ blacklisted }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in check-blacklist:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
