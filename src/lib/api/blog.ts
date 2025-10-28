import { supabase } from "@/integrations/supabase/client";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featured_image_url?: string;
  author_id?: string;
  published_at?: string;
  scheduled_publish_at?: string;
  is_published: boolean;
  category: string;
  tags: string[];
  views_count: number;
  reading_time_minutes: number;
  meta_title?: string;
  meta_description?: string;
  is_featured: boolean;
  is_pinned: boolean;
  series_name?: string;
  series_order?: number;
  archived_at?: string;
  created_at: string;
  updated_at: string;
}

export interface BlogPostFilters {
  category?: string;
  search?: string;
  status?: 'all' | 'published' | 'draft' | 'scheduled';
  featured?: boolean;
  archived?: boolean;
}

export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const calculateReadingTime = (content: string): number => {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
};

export const getBlogPosts = async (filters?: BlogPostFilters) => {
  let query = supabase
    .from('blog_posts')
    .select('*, profiles(full_name)')
    .order('is_pinned', { ascending: false })
    .order('published_at', { ascending: false, nullsFirst: false });

  if (filters?.category) {
    query = query.eq('category', filters.category);
  }

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
  }

  if (filters?.status === 'published') {
    query = query.eq('is_published', true).lte('published_at', new Date().toISOString());
  } else if (filters?.status === 'draft') {
    query = query.eq('is_published', false).is('scheduled_publish_at', null);
  } else if (filters?.status === 'scheduled') {
    query = query.eq('is_published', false).not('scheduled_publish_at', 'is', null);
  }

  if (filters?.featured) {
    query = query.eq('is_featured', true);
  }

  if (filters?.archived === false) {
    query = query.is('archived_at', null);
  } else if (filters?.archived === true) {
    query = query.not('archived_at', 'is', null);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const getBlogPost = async (slug: string) => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*, profiles(full_name)')
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const getRelatedPosts = async (postId: string, category: string, limit = 3) => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, featured_image_url, published_at, category, reading_time_minutes')
    .eq('category', category)
    .eq('is_published', true)
    .lte('published_at', new Date().toISOString())
    .neq('id', postId)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
};

export const createBlogPost = async (post: Partial<BlogPost>) => {
  const slug = post.slug || generateSlug(post.title || '');
  const reading_time = calculateReadingTime(post.content || '');

  const { data, error } = await supabase
    .from('blog_posts')
    .insert([{
      title: post.title!,
      content: post.content!,
      category: post.category!,
      slug,
      reading_time_minutes: reading_time,
      excerpt: post.excerpt,
      featured_image_url: post.featured_image_url,
      is_published: post.is_published || false,
      is_featured: post.is_featured || false,
      is_pinned: post.is_pinned || false,
      tags: post.tags || [],
      meta_title: post.meta_title,
      meta_description: post.meta_description,
      scheduled_publish_at: post.scheduled_publish_at,
      series_name: post.series_name,
      series_order: post.series_order,
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateBlogPost = async (id: string, post: Partial<BlogPost>) => {
  const updates: any = { ...post };
  
  if (post.title && !post.slug) {
    updates.slug = generateSlug(post.title);
  }
  
  if (post.content) {
    updates.reading_time_minutes = calculateReadingTime(post.content);
  }

  const { data, error } = await supabase
    .from('blog_posts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteBlogPost = async (id: string) => {
  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const togglePublishStatus = async (id: string, publish: boolean) => {
  const updates: any = {
    is_published: publish,
  };

  if (publish) {
    updates.published_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('blog_posts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const incrementViews = async (id: string) => {
  // Simple approach: fetch current count and increment
  const { data: post } = await supabase
    .from('blog_posts')
    .select('views_count')
    .eq('id', id)
    .single();
  
  if (post) {
    await supabase
      .from('blog_posts')
      .update({ views_count: post.views_count + 1 })
      .eq('id', id);
  }
};

export const uploadBlogImage = async (file: File) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('blog-images')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('blog-images')
    .getPublicUrl(filePath);

  return data.publicUrl;
};

export const saveDraft = async (postId: string | null, draftData: any) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  if (postId) {
    const { error } = await supabase
      .from('blog_drafts')
      .upsert({
        post_id: postId,
        author_id: user.id,
        ...draftData,
        auto_saved_at: new Date().toISOString(),
      });
    if (error) throw error;
  }
};

export const getDraft = async (postId: string) => {
  const { data, error } = await supabase
    .from('blog_drafts')
    .select('*')
    .eq('post_id', postId)
    .order('auto_saved_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
};
