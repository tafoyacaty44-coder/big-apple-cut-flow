import { supabase } from "@/integrations/supabase/client";
import fadeOne from '@/assets/gallery/fade-one.jpg';
import fadeTwo from '@/assets/gallery/fade-two.jpg';
import taperOne from '@/assets/gallery/taper-one.jpg';
import taperTwo from '@/assets/gallery/taper-two.jpg';
import taperThree from '@/assets/gallery/taper-three.jpg';
import cleanFadeOne from '@/assets/gallery/clean-fade-one.jpg';
import designOne from '@/assets/gallery/design-one.jpg';
import beardFadeOne from '@/assets/gallery/beard-fade-one.jpg';
import skinFadeOne from '@/assets/gallery/skin-fade-one.jpg';
import classicOne from '@/assets/gallery/classic-one.jpg';
import pompadourOne from '@/assets/gallery/pompadour-one.jpg';

export interface GalleryImage {
  id: string;
  image_url: string;
  category: string;
  title: string | null;
  description: string | null;
  display_order: number;
  is_active: boolean;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateGalleryImageData {
  image_url: string;
  category: string;
  title?: string | null;
  description?: string | null;
  display_order?: number;
}

export const getGalleryImages = async (category?: string): Promise<GalleryImage[]> => {
  let query = supabase
    .from('gallery_images')
    .select('*')
    .eq('is_active', true)
    .order('display_order');

  if (category && category !== 'All') {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
};

export const getAllGalleryImages = async (): Promise<GalleryImage[]> => {
  const { data, error } = await supabase
    .from('gallery_images')
    .select('*')
    .order('display_order');

  if (error) throw error;
  return data || [];
};

export const createGalleryImage = async (data: CreateGalleryImageData): Promise<GalleryImage> => {
  const { data: image, error } = await supabase
    .from('gallery_images')
    .insert({
      ...data,
      is_active: true,
    })
    .select()
    .single();

  if (error) throw error;
  return image;
};

export const updateGalleryImage = async (
  id: string,
  data: Partial<CreateGalleryImageData>
): Promise<GalleryImage> => {
  const { data: image, error } = await supabase
    .from('gallery_images')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return image;
};

export const deleteGalleryImage = async (id: string, imageUrl: string): Promise<void> => {
  // Delete from storage first
  await deleteGalleryImageFile(imageUrl);
  
  // Then delete from database
  const { error } = await supabase
    .from('gallery_images')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const toggleGalleryImageActive = async (id: string, isActive: boolean): Promise<void> => {
  const { error } = await supabase
    .from('gallery_images')
    .update({ is_active: isActive })
    .eq('id', id);

  if (error) throw error;
};

export const reorderGalleryImages = async (imageIds: string[]): Promise<void> => {
  const promises = imageIds.map((id, index) =>
    supabase
      .from('gallery_images')
      .update({ display_order: index })
      .eq('id', id)
  );

  const results = await Promise.all(promises);
  const errors = results.filter(r => r.error);
  
  if (errors.length > 0) {
    throw new Error(`Failed to reorder ${errors.length} image(s)`);
  }
};

export const uploadGalleryImage = async (file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('gallery-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('gallery-images')
    .getPublicUrl(filePath);

  return publicUrl;
};

export const deleteGalleryImageFile = async (url: string): Promise<void> => {
  // Extract the file path from the URL
  const urlParts = url.split('/gallery-images/');
  if (urlParts.length < 2) return;
  
  const filePath = urlParts[1];
  
  const { error } = await supabase.storage
    .from('gallery-images')
    .remove([filePath]);

  if (error) throw error;
};

// Fallback gallery images for initial import
export const fallbackGalleryImages = [
  { image_url: fadeOne, category: 'Fades', title: 'High Fade with Hard Part', display_order: 0 },
  { image_url: fadeTwo, category: 'Fades', title: 'Skin Fade with Design', display_order: 1 },
  { image_url: taperOne, category: 'Tapers', title: 'Classic Taper', display_order: 2 },
  { image_url: taperTwo, category: 'Tapers', title: 'Mid Taper Fade', display_order: 3 },
  { image_url: taperThree, category: 'Tapers', title: 'Low Taper with Beard', display_order: 4 },
  { image_url: cleanFadeOne, category: 'Fades', title: 'Clean Fade', display_order: 5 },
  { image_url: designOne, category: 'Designs', title: 'Hair Design Art', display_order: 6 },
  { image_url: beardFadeOne, category: 'Beard Work', title: 'Beard Fade Blend', display_order: 7 },
  { image_url: skinFadeOne, category: 'Fades', title: 'Bald Fade', display_order: 8 },
  { image_url: classicOne, category: 'Classic Cuts', title: 'Traditional Side Part', display_order: 9 },
  { image_url: pompadourOne, category: 'Pompadours', title: 'Modern Pompadour', display_order: 10 },
];

export const importGalleryAssets = async () => {
  const { data, error } = await supabase.functions.invoke('import-gallery-assets', {
    body: { images: fallbackGalleryImages }
  });
  
  if (error) throw error;
  return data;
};
