import { GoldButton } from "@/components/ui/gold-button";
import { Phone, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import Logo from "./Logo";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? "bg-primary/95 shadow-lg" : "bg-primary"
    } backdrop-blur-sm`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a href="/" className="flex items-center space-x-2">
            <Logo size="sm" className="gold-glow" />
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-primary-foreground hover:text-[hsl(var(--accent))] transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:h-0.5 after:w-0 after:bg-[hsl(var(--accent))] after:transition-all after:duration-300 hover:after:w-full">
              Home
            </a>
            <a href="/#services" className="text-primary-foreground hover:text-[hsl(var(--accent))] transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:h-0.5 after:w-0 after:bg-[hsl(var(--accent))] after:transition-all after:duration-300 hover:after:w-full">
              Services
            </a>
            <a href="/barbers" className="text-primary-foreground hover:text-[hsl(var(--accent))] transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:h-0.5 after:w-0 after:bg-[hsl(var(--accent))] after:transition-all after:duration-300 hover:after:w-full">
              Barbers
            </a>
            <a href="/gallery" className="text-primary-foreground hover:text-[hsl(var(--accent))] transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:h-0.5 after:w-0 after:bg-[hsl(var(--accent))] after:transition-all after:duration-300 hover:after:w-full">
              Gallery
            </a>
            <a href="/blog" className="text-primary-foreground hover:text-[hsl(var(--accent))] transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:h-0.5 after:w-0 after:bg-[hsl(var(--accent))] after:transition-all after:duration-300 hover:after:w-full">
              Blog
            </a>
            <a href="/#contact" className="text-primary-foreground hover:text-[hsl(var(--accent))] transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:h-0.5 after:w-0 after:bg-[hsl(var(--accent))] after:transition-all after:duration-300 hover:after:w-full">
              Contact
            </a>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <a href="tel:2126514858" className="flex items-center space-x-2 text-primary-foreground hover:text-[hsl(var(--accent))] transition-colors">
              <Phone className="h-4 w-4" />
              <span className="font-semibold">(212) 651-4858</span>
            </a>
            <a href="/login" className="text-primary-foreground hover:text-[hsl(var(--accent))] transition-colors text-sm font-semibold">
              Sign In
            </a>
            <GoldButton onClick={() => window.location.href = '/book'}>
              Book Now
            </GoldButton>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-primary-foreground"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-[hsl(var(--accent))]">
            <div className="flex flex-col space-y-4">
              <a href="/" className="text-primary-foreground hover:text-[hsl(var(--accent))] transition-colors" onClick={() => setIsMenuOpen(false)}>
                Home
              </a>
              <a href="/#services" className="text-primary-foreground hover:text-[hsl(var(--accent))] transition-colors" onClick={() => setIsMenuOpen(false)}>
                Services
              </a>
              <a href="/barbers" className="text-primary-foreground hover:text-[hsl(var(--accent))] transition-colors" onClick={() => setIsMenuOpen(false)}>
                Barbers
              </a>
              <a href="/gallery" className="text-primary-foreground hover:text-[hsl(var(--accent))] transition-colors" onClick={() => setIsMenuOpen(false)}>
                Gallery
              </a>
              <a href="/blog" className="text-primary-foreground hover:text-[hsl(var(--accent))] transition-colors" onClick={() => setIsMenuOpen(false)}>
                Blog
              </a>
              <a href="/#contact" className="text-primary-foreground hover:text-[hsl(var(--accent))] transition-colors" onClick={() => setIsMenuOpen(false)}>
                Contact
              </a>
              <a href="tel:2126514858" className="flex items-center space-x-2 text-primary-foreground hover:text-[hsl(var(--accent))] transition-colors">
                <Phone className="h-4 w-4" />
                <span className="font-semibold">(212) 651-4858</span>
              </a>
              <a href="/login" className="text-primary-foreground hover:text-[hsl(var(--accent))] transition-colors font-semibold">
                Sign In
              </a>
              <GoldButton className="w-full" onClick={() => window.location.href = '/book'}>
                Book Now
              </GoldButton>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
