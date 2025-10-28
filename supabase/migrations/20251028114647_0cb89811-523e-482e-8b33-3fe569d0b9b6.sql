-- Create blog_posts table with enhanced features
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image_url TEXT,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  published_at TIMESTAMP WITH TIME ZONE,
  scheduled_publish_at TIMESTAMP WITH TIME ZONE,
  is_published BOOLEAN NOT NULL DEFAULT false,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  views_count INTEGER NOT NULL DEFAULT 0,
  reading_time_minutes INTEGER NOT NULL DEFAULT 5,
  meta_title TEXT,
  meta_description TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  series_name TEXT,
  series_order INTEGER,
  archived_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create blog_drafts table for autosave
CREATE TABLE public.blog_drafts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT,
  excerpt TEXT,
  category TEXT,
  tags TEXT[],
  auto_saved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_posts_published_at ON public.blog_posts(published_at DESC);
CREATE INDEX idx_blog_posts_category ON public.blog_posts(category);
CREATE INDEX idx_blog_posts_author ON public.blog_posts(author_id);
CREATE INDEX idx_blog_posts_scheduled ON public.blog_posts(scheduled_publish_at) WHERE is_published = false;
CREATE INDEX idx_blog_posts_series ON public.blog_posts(series_name, series_order);
CREATE INDEX idx_blog_drafts_post_id ON public.blog_drafts(post_id);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_drafts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blog_posts
CREATE POLICY "Anyone can view published posts"
  ON public.blog_posts FOR SELECT
  USING (is_published = true AND published_at <= now() AND archived_at IS NULL);

CREATE POLICY "Admins can view all posts"
  ON public.blog_posts FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert posts"
  ON public.blog_posts FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update posts"
  ON public.blog_posts FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete posts"
  ON public.blog_posts FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for blog_drafts
CREATE POLICY "Users can manage their own drafts"
  ON public.blog_drafts FOR ALL
  USING (auth.uid() = author_id);

CREATE POLICY "Admins can view all drafts"
  ON public.blog_drafts FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Trigger to update updated_at
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for blog images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for blog-images
CREATE POLICY "Anyone can view blog images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog-images');

CREATE POLICY "Admins can upload blog images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'blog-images' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update blog images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'blog-images' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete blog images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'blog-images' AND has_role(auth.uid(), 'admin'));