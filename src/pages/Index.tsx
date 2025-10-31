import Logo from "@/components/Logo";
import { GoldButton } from "@/components/ui/gold-button";
import { useNavigate } from "react-router-dom";
import { MapPin, Phone } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-primary flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Logo */}
        <div className="mb-12 animate-fade-in">
          <Logo size="lg" className="mx-auto" />
        </div>

        {/* Navigation Buttons */}
        <div className="w-full max-w-md space-y-4 animate-fade-in">
          <GoldButton 
            size="lg" 
            className="w-full text-lg py-6"
            onClick={() => navigate('/book')}
          >
            Book an Appointment
          </GoldButton>

          <GoldButton 
            size="lg" 
            className="w-full text-lg py-6"
            onClick={() => {
              const servicesSection = document.getElementById('services');
              if (servicesSection) {
                servicesSection.scrollIntoView({ behavior: 'smooth' });
              } else {
                navigate('/book');
              }
            }}
          >
            Our Services
          </GoldButton>

          <GoldButton 
            size="lg" 
            className="w-full text-lg py-6"
            onClick={() => navigate('/login')}
          >
            Login & Reschedule
          </GoldButton>

          <GoldButton 
            size="lg" 
            className="w-full text-lg py-6"
            onClick={() => navigate('/barbers')}
          >
            Meet our Stylist
          </GoldButton>

          <GoldButton 
            size="lg" 
            className="w-full text-lg py-6"
            onClick={() => {
              const contactSection = document.getElementById('contact');
              if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
              } else {
                navigate('/');
                setTimeout(() => {
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }}
          >
            Contact Us
          </GoldButton>

          <GoldButton 
            size="lg" 
            className="w-full text-lg py-6"
            onClick={() => navigate('/gallery')}
          >
            Gallery & Styles
          </GoldButton>
        </div>
      </div>

      {/* Contact Information Footer */}
      <div className="py-8 px-4 text-center space-y-2 animate-fade-in">
        <div className="flex items-center justify-center gap-2 text-accent text-xl font-semibold mb-2">
          <Phone className="h-5 w-5" />
          <a href="tel:2126514858" className="hover:text-accent/80 transition-colors">
            212-651-4858
          </a>
        </div>
        <div className="text-primary-foreground/90 space-y-1">
          <div className="text-lg font-medium">422 East 14 Street</div>
          <div className="flex items-center justify-center gap-2 text-lg">
            <MapPin className="h-4 w-4" />
            <span>New York, NY 10009</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
