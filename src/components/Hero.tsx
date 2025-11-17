import { GoldButton } from "@/components/ui/gold-button";
import Logo from "./Logo";
import { MapPin } from "lucide-react";
import heroBg from "@/assets/hero-barbershop.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/70" />
      
      {/* Subtle texture overlay */}
      <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTI0YzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMCAyNGMtMi4yMSAwLTQgMS43OS00IDRzMS43OSA0IDQgNCA0LTEuNzkgNC00LTEuNzktNC00LTR6bTAtMjRjLTIuMjEgMC00IDEuNzktNCA0czEuNzkgNCA0IDQgNC0xLjc5IDQtNC0xLjc5LTQtNC00eiIvPjwvZz48L2c+PC9zdmc+')] z-[1]"></div>
      
      <div className="container relative z-10 text-center px-4 py-8 md:py-16">
        {/* Logo with gold glow */}
        <div className="mb-8 animate-fade-in">
          <Logo size="xl" className="mx-auto gold-glow" />
        </div>
        
        {/* Tagline */}
        <p className="tagline text-2xl md:text-4xl text-primary-foreground/90 mb-4 animate-fade-in">
          Classic Craftsmanship, Modern Precision
        </p>
        
        {/* Location */}
        <div className="flex items-center justify-center space-x-2 text-[hsl(var(--accent))] mb-12 animate-fade-in">
          <MapPin className="h-5 w-5" />
          <span className="text-lg font-medium">East Village, NYC</span>
        </div>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in">
          <GoldButton size="lg" onClick={() => window.location.href = '/book'}>
            Book an Appointment
          </GoldButton>
          <GoldButton variant="outline" size="lg" onClick={() => {
            document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
          }}>
            View Services
          </GoldButton>
        </div>
      </div>

      {/* Decorative bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent"></div>
    </section>
  );
};

export default Hero;
