import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SectionHeading from '@/components/ui/section-heading';
import { useState } from 'react';
import { GoldButton } from '@/components/ui/gold-button';
import { useQuery } from '@tanstack/react-query';
import { getGalleryImages } from '@/lib/api/gallery';
import { Skeleton } from '@/components/ui/skeleton';

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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-7xl mx-auto">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} className="aspect-square rounded-lg" />
              ))
            ) : filteredImages.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No images found in this category.</p>
              </div>
            ) : (
              filteredImages.map((image) => (
                <div 
                  key={image.id}
                  className="group relative overflow-hidden rounded-lg border-2 border-border hover:border-[hsl(var(--accent))] transition-all duration-300 aspect-square cursor-pointer"
                >
                  <img 
                    src={image.image_url} 
                    alt={image.title || `${image.category} example`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 right-4">
                      {image.title && (
                        <p className="text-white font-semibold mb-1">{image.title}</p>
                      )}
                      <span className="inline-block px-3 py-1 bg-[hsl(var(--accent))] text-black text-sm font-semibold rounded-full">
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
