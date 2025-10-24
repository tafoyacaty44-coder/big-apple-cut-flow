import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GoldButton } from "@/components/ui/gold-button";
import SectionHeading from "@/components/ui/section-heading";
import { Scissors, Sparkles, Users, Star } from "lucide-react";

const services = [
  {
    icon: Scissors,
    title: "Classic Haircut",
    price: "$45",
    vipPrice: "$55",
    description: "Traditional barbershop cut with hot towel service and styling"
  },
  {
    icon: Star,
    title: "Premium Cut & Style",
    price: "$65",
    vipPrice: "$75",
    description: "Precision cut, wash, hot towel, and premium styling products"
  },
  {
    icon: Sparkles,
    title: "Traditional Shave",
    price: "$40",
    vipPrice: "$50",
    description: "Hot lather straight razor shave with aftershave treatment"
  },
  {
    icon: Users,
    title: "Cut & Shave Combo",
    price: "$75",
    vipPrice: "$90",
    description: "Complete grooming experience - haircut and traditional shave"
  }
];

const Services = () => {
  return (
    <section id="services" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <SectionHeading 
          title="Our Services"
          subtitle="Premium grooming services delivered by master barbers"
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card 
                key={index} 
                className="border-2 border-border hover:border-[hsl(var(--accent))] hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all duration-300 hover:scale-105 group"
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-[hsl(var(--accent))]/10 flex items-center justify-center mb-4 group-hover:bg-[hsl(var(--accent))]/20 transition-colors">
                    <Icon className="h-6 w-6 text-[hsl(var(--accent))]" />
                  </div>
                  <CardTitle className="text-xl mb-2">{service.title}</CardTitle>
                  <CardDescription>
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-foreground">{service.price}</div>
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[hsl(var(--accent))]/10 border border-[hsl(var(--accent))]/20">
                        <span className="text-xs font-semibold text-[hsl(var(--accent))]">VIP</span>
                        <span className="text-xs text-[hsl(var(--accent))]">{service.vipPrice}</span>
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
