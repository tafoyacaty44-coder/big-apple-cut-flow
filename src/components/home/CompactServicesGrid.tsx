import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { getServices } from '@/lib/api/services';
import { useBooking } from '@/contexts/BookingContext';
import { ChevronDown, ChevronUp } from 'lucide-react';

import haircutImg from '@/assets/services/haircut.jpg';
import seniorImg from '@/assets/services/senior-haircut.jpg';
import washImg from '@/assets/services/haircut-wash.jpg';
import shaveImg from '@/assets/services/royal-shave.jpg';
import maskImg from '@/assets/services/black-mask.jpg';
import beardImg from '@/assets/services/beard-trim.jpg';
import wisemanImg from '@/assets/services/wiseman-special.jpg';
import comboImg from '@/assets/services/haircut-beard-combo.jpg';

const serviceImages: Record<string, string> = {
  'Haircut': haircutImg,
  'Senior Haircut': seniorImg,
  'Haircut and Wash': washImg,
  'Royal Shave': shaveImg,
  'Black Mask Facial': maskImg,
  'Beard Trim': beardImg,
  'Wiseman Special': wisemanImg,
  'Haircut and Beard Trim': comboImg,
};

const CompactServicesGrid = () => {
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();
  const { setPrefilled } = useBooking();

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: getServices,
  });

  const displayServices = showAll ? services : services.slice(0, 6);

  const handleBookService = (serviceId: string) => {
    setPrefilled({ serviceId });
    navigate('/book');
  };

  if (isLoading) {
    return null;
  }

  return (
    <section className="py-16 px-4 animate-fade-in">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Our Services
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Premium grooming services tailored to your style
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {displayServices.map((service, index) => {
            const imageSrc = serviceImages[service.name] || serviceImages["Haircut"];
            
            return (
              <Card 
                key={service.id} 
                className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="aspect-[3/2] overflow-hidden">
                  <img
                    src={imageSrc}
                    alt={service.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <CardContent className="p-4 space-y-3">
                  <div>
                    <h3 className="font-bold text-lg mb-1">{service.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {service.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xl font-bold text-[hsl(var(--accent))]">
                        ${service.regular_price}
                      </span>
                      {service.vip_price && (
                        <span className="text-xs text-muted-foreground ml-2">
                          VIP: ${service.vip_price}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {service.duration_minutes} min
                    </span>
                  </div>
                  <Button
                    size="sm"
                    className="w-full bg-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))]/90 transition-all duration-200 hover:scale-105"
                    onClick={() => handleBookService(service.id)}
                    aria-label={`Book ${service.name}`}
                  >
                    Book Now
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {services.length > 6 && (
          <div className="text-center mt-8 animate-fade-in">
            <Button
              variant="outline"
              onClick={() => setShowAll(!showAll)}
              className="border-[hsl(var(--accent))] text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))]/10 transition-all duration-300 hover:scale-105"
              aria-expanded={showAll}
              aria-label={showAll ? 'Show less services' : 'View all services'}
            >
              {showAll ? (
                <>
                  Show Less <ChevronUp className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  View All Services <ChevronDown className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default CompactServicesGrid;
