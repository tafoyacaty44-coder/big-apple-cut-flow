import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SectionHeading from '@/components/ui/section-heading';
import { useState } from 'react';
import { GoldButton } from '@/components/ui/gold-button';
import { useQuery } from '@tanstack/react-query';
import { getGalleryImages } from '@/lib/api/gallery';
import { Skeleton } from '@/components/ui/skeleton';
import { SeoHead } from '@/components/SeoHead';

const categories = ['All', 'Haircuts', 'Shaves', 'Beard Work', 'Transformations'];

const Gallery = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const { data: images = [], isLoading } = useQuery({
    queryKey: ['gallery-images', selectedCategory],
    queryFn: () => getGalleryImages(selectedCategory === 'All' ? undefined : selectedCategory),
  });

  const filteredImages = images;

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
