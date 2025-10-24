import { Scissors } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-12 border-t-4 border-accent">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Scissors className="h-6 w-6 text-accent" />
              <span className="text-xl font-bold">Big Apple Barbers</span>
            </div>
            <p className="text-primary-foreground/80">
              Classic cuts and modern style in the heart of NYC since establishment.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-primary-foreground/80">
              <li><a href="#services" className="hover:text-accent transition-colors">Services</a></li>
              <li><a href="#about" className="hover:text-accent transition-colors">About</a></li>
              <li><a href="#contact" className="hover:text-accent transition-colors">Contact</a></li>
              <li><a href="/appointments" className="hover:text-accent transition-colors">Book Appointment</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-bold mb-4">Contact</h3>
            <ul className="space-y-2 text-primary-foreground/80">
              <li>422 E 14th St</li>
              <li>New York, NY 10009</li>
              <li>
                <a href="tel:2126514858" className="hover:text-accent transition-colors">
                  (212) 651-4858
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-primary-foreground/20 text-center text-sm text-primary-foreground/60">
          <p>&copy; {new Date().getFullYear()} Big Apple Barbers. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
