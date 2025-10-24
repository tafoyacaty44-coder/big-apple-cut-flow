import { Button } from "@/components/ui/button";
import { Phone, Menu } from "lucide-react";
import { useState } from "react";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a href="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold">
              <span className="text-foreground">BIG APPLE</span>
              <span className="text-accent"> BARBERS</span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#services" className="text-foreground hover:text-accent transition-colors">
              Services
            </a>
            <a href="#about" className="text-foreground hover:text-accent transition-colors">
              About
            </a>
            <a href="#contact" className="text-foreground hover:text-accent transition-colors">
              Contact
            </a>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <a href="tel:2126514858" className="flex items-center space-x-2 text-foreground hover:text-accent transition-colors">
              <Phone className="h-4 w-4" />
              <span className="font-semibold">(212) 651-4858</span>
            </a>
            <Button variant="default" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              Book Now
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-4">
              <a href="#services" className="text-foreground hover:text-accent transition-colors">
                Services
              </a>
              <a href="#about" className="text-foreground hover:text-accent transition-colors">
                About
              </a>
              <a href="#contact" className="text-foreground hover:text-accent transition-colors">
                Contact
              </a>
              <a href="tel:2126514858" className="flex items-center space-x-2 text-foreground hover:text-accent transition-colors">
                <Phone className="h-4 w-4" />
                <span className="font-semibold">(212) 651-4858</span>
              </a>
              <Button variant="default" className="bg-accent hover:bg-accent/90 text-accent-foreground w-full">
                Book Now
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
