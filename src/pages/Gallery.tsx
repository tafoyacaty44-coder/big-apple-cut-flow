import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SectionHeading from '@/components/ui/section-heading';
import { useState } from 'react';
import { GoldButton } from '@/components/ui/gold-button';

const categories = ['All', 'Haircuts', 'Shaves', 'Beard Work', 'Transformations'];

const galleryImages = [
  { url: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800', category: 'Haircuts' },
  { url: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800', category: 'Shaves' },
  { url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800', category: 'Beard Work' },
  { url: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800', category: 'Haircuts' },
  { url: 'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=800', category: 'Transformations' },
  { url: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=800', category: 'Beard Work' },
  { url: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800', category: 'Haircuts' },
  { url: 'https://images.unsplash.com/photo-1542345812-d98b5cd6cf98?w=800', category: 'Shaves' },
  { url: 'https://images.unsplash.com/photo-1584824486539-53bb4646bdbc?w=800', category: 'Transformations' },
  { url: 'https://images.unsplash.com/photo-1492288991661-058aa541ff43?w=800', category: 'Haircuts' },
  { url: 'https://images.unsplash.com/photo-1531905098-b5a9bcb8b42c?w=800', category: 'Beard Work' },
  { url: 'https://images.unsplash.com/photo-1611937663369-b0c3b8b4d03c?w=800', category: 'Shaves' },
];

const Gallery = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredImages = selectedCategory === 'All' 
    ? galleryImages 
    : galleryImages.filter(img => img.category === selectedCategory);

  return (
    <div className="min-h-screen">
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
            {filteredImages.map((image, index) => (
              <div 
                key={index}
                className="group relative overflow-hidden rounded-lg border-2 border-border hover:border-[hsl(var(--accent))] transition-all duration-300 aspect-square cursor-pointer"
              >
                <img 
                  src={image.url} 
                  alt={`${image.category} example ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="inline-block px-3 py-1 bg-[hsl(var(--accent))] text-black text-sm font-semibold rounded-full">
                      {image.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Gallery;
