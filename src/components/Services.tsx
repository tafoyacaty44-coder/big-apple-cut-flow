import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GoldButton } from "@/components/ui/gold-button";
import SectionHeading from "@/components/ui/section-heading";
import { Scissors, Sparkles, Star, Briefcase } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { getServices } from '@/lib/api/services';

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

const iconMap: Record<string, any> = {
  'haircut': Scissors,
  'shave': Sparkles,
  'combo': Briefcase,
  'treatment': Star,
};

const Services = () => {
  const { data: services = [], isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: getServices,
  });

  if (isLoading) {
    return (
      <section id="services" className="py-24 bg-background">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">Loading services...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="services" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <SectionHeading 
          title="Our Services"
          subtitle="Premium grooming services delivered by master barbers"
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {services.map((service) => {
            const Icon = iconMap[service.category] || Scissors;
            return (
              <Card 
                key={service.id} 
                className="border-2 border-border hover:border-[hsl(var(--accent))] hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all duration-300 hover:scale-105 group overflow-hidden"
              >
                <div className="aspect-[4/3] overflow-hidden relative">
                  <img 
                    src={serviceImages[service.name]}
                    alt={service.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-[hsl(var(--accent))]/90 flex items-center justify-center backdrop-blur-sm">
                    <Icon className="h-6 w-6 text-black" />
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-xl mb-2">{service.name}</CardTitle>
                  <CardDescription>
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-foreground">${service.regular_price}</div>
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[hsl(var(--accent))]/10 border border-[hsl(var(--accent))]/20">
                        <span className="text-xs font-semibold text-[hsl(var(--accent))]">VIP</span>
                        <span className="text-xs text-[hsl(var(--accent))]">${service.vip_price}</span>
                      </div>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{service.description}</p>
                  <GoldButton variant="outline" className="w-full">
                    Book Now
                  </GoldButton>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            *VIP pricing includes priority booking and premium aftercare products
          </p>
        </div>
      </div>
    </section>
  );
};

export default Services;
