import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';

interface SeoHeadProps {
  pageSlug: string;
  customTitle?: string;
  customDescription?: string;
  customImage?: string;
}

export function SeoHead({ pageSlug, customTitle, customDescription, customImage }: SeoHeadProps) {
  const { data: seoData } = useQuery({
    queryKey: ['seo', pageSlug],
    queryFn: async () => {
      const { data } = await supabase
        .from('seo_settings')
        .select('*')
        .eq('page_slug', pageSlug)
        .maybeSingle();
      return data;
    },
  });

  // Defaults from index.html
  const defaults = {
    title: "Big Apple Barbers - Classic Cuts & Modern Style | NYC East Village",
    description: "Premium barbershop in Manhattan's East Village. Expert haircuts, traditional shaves, and grooming services.",
    keywords: ["barber", "barbershop", "haircut", "NYC", "East Village"],
    ogImage: "https://lovable.dev/opengraph-image-p98pqg.png",
  };

  const title = customTitle || seoData?.meta_title || defaults.title;
  const description = customDescription || seoData?.meta_description || defaults.description;
  const keywords = seoData?.keywords?.join(', ') || defaults.keywords.join(', ');
  const ogImage = customImage || seoData?.og_image_url || defaults.ogImage;
  const ogTitle = seoData?.og_title || title;
  const ogDescription = seoData?.og_description || description;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      {seoData?.canonical_url && <link rel="canonical" href={seoData.canonical_url} />}
      {seoData?.robots && <meta name="robots" content={seoData.robots} />}
      
      {/* Open Graph / Social Media */}
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={ogDescription} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={ogImage} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
}
