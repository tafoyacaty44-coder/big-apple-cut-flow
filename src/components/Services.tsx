import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    <section id="services" className="py-24 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Services</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Premium grooming services delivered by master barbers
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card key={index} className="vintage-shadow hover:shadow-xl transition-shadow duration-300 border-2">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle className="text-xl mb-2">{service.title}</CardTitle>
                  <CardDescription>
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-foreground">{service.price}</div>
                      <div className="text-sm text-muted-foreground">VIP: {service.vipPrice}</div>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{service.description}</p>
                  <Button variant="outline" className="w-full">
                    Book Now
                  </Button>
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
