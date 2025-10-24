import { Button } from "@/components/ui/button";
import { Scissors } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary to-background opacity-50" />
      
      <div className="container mx-auto px-4 py-32 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/10 mb-8">
            <Scissors className="h-10 w-10 text-accent" />
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-balance">
            Classic Cuts,
            <br />
            <span className="text-accent">Modern Style</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto text-balance">
            Experience the finest grooming in the heart of NYC. Where tradition meets excellence.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-8 py-6"
            >
              Book Appointment
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8 py-6 border-2"
            >
              View Services
            </Button>
          </div>

          {/* Address */}
          <div className="mt-12 pt-12 border-t border-border">
            <p className="text-muted-foreground mb-2">Visit us at</p>
            <p className="text-lg font-semibold">422 E 14th St, New York, NY 10009</p>
          </div>
        </div>
      </div>

      {/* Decorative Barber Pole Stripe */}
      <div className="absolute bottom-0 left-0 right-0 h-2 barber-stripe opacity-50" />
    </section>
  );
};

export default Hero;
