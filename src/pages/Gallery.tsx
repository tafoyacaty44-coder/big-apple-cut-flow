import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SectionHeading from '@/components/ui/section-heading';
import { useState } from 'react';
import { GoldButton } from '@/components/ui/gold-button';
import { useQuery } from '@tanstack/react-query';
import { getGalleryImages } from '@/lib/api/gallery';
import { Skeleton } from '@/components/ui/skeleton';
import { SeoHead } from '@/components/SeoHead';

// Import gallery images
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

const categories = ['All', 'Fades', 'Tapers', 'Classic Cuts', 'Designs', 'Beard Work', 'Pompadours'];

// Fallback images when database is empty
const fallbackImages = [
  { id: '1', image_url: fadeOne, category: 'Fades', title: 'High Fade with Hard Part', description: null, display_order: 0, is_active: true, uploaded_by: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '2', image_url: fadeTwo, category: 'Fades', title: 'Skin Fade with Design', description: null, display_order: 1, is_active: true, uploaded_by: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '3', image_url: taperOne, category: 'Tapers', title: 'Classic Taper', description: null, display_order: 2, is_active: true, uploaded_by: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '4', image_url: taperTwo, category: 'Tapers', title: 'Mid Taper Fade', description: null, display_order: 3, is_active: true, uploaded_by: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '5', image_url: taperThree, category: 'Tapers', title: 'Low Taper with Beard', description: null, display_order: 4, is_active: true, uploaded_by: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '6', image_url: cleanFadeOne, category: 'Fades', title: 'Clean Fade', description: null, display_order: 5, is_active: true, uploaded_by: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '7', image_url: designOne, category: 'Designs', title: 'Hair Design Art', description: null, display_order: 6, is_active: true, uploaded_by: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '8', image_url: beardFadeOne, category: 'Beard Work', title: 'Beard Fade Blend', description: null, display_order: 7, is_active: true, uploaded_by: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '9', image_url: skinFadeOne, category: 'Fades', title: 'Bald Fade', description: null, display_order: 8, is_active: true, uploaded_by: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '10', image_url: classicOne, category: 'Classic Cuts', title: 'Traditional Side Part', description: null, display_order: 9, is_active: true, uploaded_by: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '11', image_url: pompadourOne, category: 'Pompadours', title: 'Modern Pompadour', description: null, display_order: 10, is_active: true, uploaded_by: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

const Gallery = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const { data: dbImages = [], isLoading } = useQuery({
    queryKey: ['gallery-images', selectedCategory],
    queryFn: () => getGalleryImages(selectedCategory === 'All' ? undefined : selectedCategory),
  });

  // Use database images if available, otherwise fallback images
  const images = dbImages.length > 0 ? dbImages : fallbackImages;
  
  // Apply category filter to fallback images if needed
  const filteredImages = selectedCategory === 'All' 
    ? images 
    : images.filter(img => img.category === selectedCategory);

  return (
    <div className="min-h-screen pt-20">
      <SeoHead pageSlug="gallery" />
      <Navigation />
      
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <SectionHeading 
            title="Our Work"
            subtitle="Browse our portfolio of transformations"
          />

          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((category) => (
              <GoldButton
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
                size="sm"
              >
                {category}
              </GoldButton>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 max-w-7xl mx-auto">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} className="aspect-[3/4] rounded-lg" />
              ))
            ) : filteredImages.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No images found in this category.</p>
              </div>
            ) : (
              filteredImages.map((image) => (
                <div 
                  key={image.id}
                  className="group relative overflow-hidden rounded-lg aspect-[3/4] cursor-pointer border border-border hover:border-accent transition-all duration-300"
                >
                  <img 
                    src={image.image_url} 
                    alt={image.title || `${image.category} style`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-3 left-3 right-3">
                      {image.title && (
                        <p className="text-white font-semibold text-sm mb-1">{image.title}</p>
                      )}
                      <span className="inline-block px-2 py-1 bg-accent text-accent-foreground text-xs font-semibold rounded">
                        {image.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Gallery;
