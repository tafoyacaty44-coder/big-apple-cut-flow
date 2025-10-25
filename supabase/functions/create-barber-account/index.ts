import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateBarberRequest {
  email: string;
  password: string;
  fullName: string;
  bio?: string;
  specialties?: string[];
  yearsExperience?: number;
  profileImageUrl?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Verify the caller is an admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError || !roleData) {
      throw new Error('Only admins can create barber accounts');
    }

    const { 
      email, 
      password, 
      fullName, 
      bio, 
      specialties, 
      yearsExperience,
      profileImageUrl 
    }: CreateBarberRequest = await req.json();

    if (!email || !password || !fullName) {
      throw new Error('Email, password, and full name are required');
    }

    console.log(`Creating barber account for: ${email}`);

    // Create the auth user
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      },
    });

    if (createError) {
      console.error('Error creating user:', createError);
      throw createError;
    }

    if (!newUser.user) {
      throw new Error('Failed to create user');
    }

    console.log(`User created with ID: ${newUser.user.id}`);

    // Delete default customer role
    await supabaseAdmin
      .from('user_roles')
      .delete()
      .eq('user_id', newUser.user.id);

    // Add barber role
    const { error: roleInsertError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: newUser.user.id,
        role: 'barber',
      });

    if (roleInsertError) {
      console.error('Error assigning barber role:', roleInsertError);
      throw roleInsertError;
    }

    // Create barber profile
    const { data: barberProfile, error: barberError } = await supabaseAdmin
      .from('barbers')
      .insert({
        user_id: newUser.user.id,
        full_name: fullName,
        bio: bio || null,
        specialties: specialties || [],
        years_experience: yearsExperience || 0,
        profile_image_url: profileImageUrl || null,
        is_active: true,
      })
      .select()
      .single();

    if (barberError) {
      console.error('Error creating barber profile:', barberError);
      throw barberError;
    }

    // Create default availability (Mon-Fri 9am-6pm)
    const defaultAvailability = [1, 2, 3, 4, 5].map(day => ({
      barber_id: barberProfile.id,
      day_of_week: day,
      start_time: '09:00',
      end_time: '18:00',
      is_available: true,
    }));

    const { error: availError } = await supabaseAdmin
      .from('barber_availability')
      .insert(defaultAvailability);

    if (availError) {
      console.error('Error creating default availability:', availError);
    }

    console.log(`Barber account created successfully: ${newUser.user.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: newUser.user.id,
          email: newUser.user.email,
        },
        barber: barberProfile,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in create-barber-account:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
