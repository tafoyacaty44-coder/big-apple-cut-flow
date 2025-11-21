import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GalleryImage {
  image_url: string;
  category: string;
  title: string;
  display_order: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Verify user is master_admin
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleError || roleData?.role !== 'master_admin') {
      throw new Error('Only master admins can import gallery assets');
    }

    const { images } = await req.json();

    if (!images || !Array.isArray(images)) {
      throw new Error('Invalid images data');
    }

    console.log(`Importing ${images.length} gallery images...`);

    // Insert all images into gallery_images table
    const imagesToInsert = images.map((img: GalleryImage, index: number) => ({
      image_url: img.image_url,
      category: img.category,
      title: img.title || null,
      display_order: img.display_order ?? index,
      is_active: true,
      uploaded_by: user.id,
    }));

    const { data: insertedImages, error: insertError } = await supabase
      .from('gallery_images')
      .insert(imagesToInsert)
      .select();

    if (insertError) {
      console.error('Insert error:', insertError);
      throw insertError;
    }

    console.log(`Successfully imported ${insertedImages.length} images`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        count: insertedImages.length,
        message: `Successfully imported ${insertedImages.length} gallery images` 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error importing gallery assets:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to import gallery assets';
    return new Response(
      JSON.stringify({ 
        error: errorMessage
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
