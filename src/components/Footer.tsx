import Logo from "./Logo";
import { Phone, MapPin, Instagram, Facebook } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-16">
      <div className="container mx-auto px-4">
        {/* Logo */}
        <div className="text-center mb-12">
          <Logo size="md" className="mx-auto mb-4 gold-glow" />
          <p className="tagline text-[hsl(var(--accent))] text-xl">
            Classic Craftsmanship, Modern Precision
          </p>
        </div>

        {/* Three Columns */}
        <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto mb-12">
          {/* About */}
          <div>
            <h3 className="text-[hsl(var(--accent))] font-bold text-lg mb-4 uppercase tracking-wider">
              About
            </h3>
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              Big Apple Barbers brings traditional barbering excellence to Manhattan's East Village. 
              Expert cuts, classic shaves, modern style.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-[hsl(var(--accent))] font-bold text-lg mb-4 uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="#services" className="text-primary-foreground/80 hover:text-[hsl(var(--accent))] transition-colors text-sm">
                  Services
                </a>
              </li>
              <li>
                <a href="#about" className="text-primary-foreground/80 hover:text-[hsl(var(--accent))] transition-colors text-sm">
                  About
                </a>
              </li>
              <li>
                <a href="#contact" className="text-primary-foreground/80 hover:text-[hsl(var(--accent))] transition-colors text-sm">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-foreground/80 hover:text-[hsl(var(--accent))] transition-colors text-sm">
                  Book Now
                </a>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-[hsl(var(--accent))] font-bold text-lg mb-4 uppercase tracking-wider">
              Connect
            </h3>
            <div className="space-y-3 mb-4">
              <a 
                href="tel:2126514858" 
                className="flex items-center space-x-2 text-primary-foreground/80 hover:text-[hsl(var(--accent))] transition-colors text-sm"
              >
                <Phone className="h-4 w-4" />
                <span>(212) 651-4858</span>
              </a>
              <div className="flex items-center space-x-2 text-primary-foreground/80 text-sm">
                <MapPin className="h-4 w-4" />
                <span>East Village, NYC</span>
              </div>
            </div>
            <div className="flex space-x-4">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[hsl(var(--accent))]/20 flex items-center justify-center hover:bg-[hsl(var(--accent))] transition-colors group"
              >
                <Instagram className="h-5 w-5 text-[hsl(var(--accent))] group-hover:text-primary" />
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[hsl(var(--accent))]/20 flex items-center justify-center hover:bg-[hsl(var(--accent))] transition-colors group"
              >
                <Facebook className="h-5 w-5 text-[hsl(var(--accent))] group-hover:text-primary" />
              </a>
            </div>
          </div>
        </div>

        {/* Decorative mustache divider */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-[hsl(var(--accent))] to-transparent"></div>
        </div>

        {/* Bottom Bar */}
        <div className="text-center text-primary-foreground/60 text-sm">
          <p className="mb-2">
            © {new Date().getFullYear()} Big Apple Barbers. All rights reserved.
          </p>
          <div className="flex justify-center space-x-4">
            <a href="#" className="hover:text-[hsl(var(--accent))] transition-colors">
              Privacy Policy
            </a>
            <span>|</span>
            <a href="#" className="hover:text-[hsl(var(--accent))] transition-colors">
              Terms of Service
            </a>
            <span>|</span>
            <a href="/staff-login" className="hover:text-[hsl(var(--accent))] transition-colors">
              Staff Login
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
