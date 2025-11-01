import { GoldButton } from "@/components/ui/gold-button";
import { Phone, Menu, X, User, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Logo from "./Logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, userRole, signOut } = useAuth();

  const getDashboardPath = () => {
    if (userRole === 'admin') return '/admin';
    if (userRole === 'barber') return '/barber';
    return '/dashboard';
  };

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
          <Link to="/" className="flex items-center space-x-2">
            <Logo size="sm" variant="light" className="gold-glow" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-primary-foreground hover:text-[hsl(var(--accent))] transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:h-0.5 after:w-0 after:bg-[hsl(var(--accent))] after:transition-all after:duration-300 hover:after:w-full">
              Home
            </Link>
            <Link to="/#services" className="text-primary-foreground hover:text-[hsl(var(--accent))] transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:h-0.5 after:w-0 after:bg-[hsl(var(--accent))] after:transition-all after:duration-300 hover:after:w-full">
              Services
            </Link>
            <Link to="/barbers" className="text-primary-foreground hover:text-[hsl(var(--accent))] transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:h-0.5 after:w-0 after:bg-[hsl(var(--accent))] after:transition-all after:duration-300 hover:after:w-full">
              Barbers
            </Link>
            <Link to="/gallery" className="text-primary-foreground hover:text-[hsl(var(--accent))] transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:h-0.5 after:w-0 after:bg-[hsl(var(--accent))] after:transition-all after:duration-300 hover:after:w-full">
              Gallery
            </Link>
            <Link to="/blog" className="text-primary-foreground hover:text-[hsl(var(--accent))] transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:h-0.5 after:w-0 after:bg-[hsl(var(--accent))] after:transition-all after:duration-300 hover:after:w-full">
              Blog
            </Link>
            <Link to="/#contact" className="text-primary-foreground hover:text-[hsl(var(--accent))] transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:h-0.5 after:w-0 after:bg-[hsl(var(--accent))] after:transition-all after:duration-300 hover:after:w-full">
              Contact
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <a href="tel:2126514858">
              <Button 
                variant="outline" 
                className="border-accent text-accent hover:bg-accent hover:text-accent-foreground transition-all"
              >
                <Phone className="h-4 w-4 mr-2" />
                <span className="font-semibold">(212) 651-4858</span>
              </Button>
            </a>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full bg-[hsl(var(--accent))] flex items-center justify-center border-2 border-[hsl(var(--accent))]">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-primary-foreground font-semibold">
                      {user.email?.split('@')[0]}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to={getDashboardPath()} className="cursor-pointer">
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login" className="text-primary-foreground hover:text-[hsl(var(--accent))] transition-colors text-sm font-semibold">
                Sign In
              </Link>
            )}
            <Link to="/book">
              <GoldButton>Book Now</GoldButton>
            </Link>
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
              <Link to="/" className="text-primary-foreground hover:text-[hsl(var(--accent))] transition-colors" onClick={() => setIsMenuOpen(false)}>
                Home
              </Link>
              <Link to="/#services" className="text-primary-foreground hover:text-[hsl(var(--accent))] transition-colors" onClick={() => setIsMenuOpen(false)}>
                Services
              </Link>
              <Link to="/barbers" className="text-primary-foreground hover:text-[hsl(var(--accent))] transition-colors" onClick={() => setIsMenuOpen(false)}>
                Barbers
              </Link>
              <Link to="/gallery" className="text-primary-foreground hover:text-[hsl(var(--accent))] transition-colors" onClick={() => setIsMenuOpen(false)}>
                Gallery
              </Link>
              <Link to="/blog" className="text-primary-foreground hover:text-[hsl(var(--accent))] transition-colors" onClick={() => setIsMenuOpen(false)}>
                Blog
              </Link>
              <Link to="/#contact" className="text-primary-foreground hover:text-[hsl(var(--accent))] transition-colors" onClick={() => setIsMenuOpen(false)}>
                Contact
              </Link>
              <a href="tel:2126514858" className="w-full">
                <Button 
                  variant="outline" 
                  className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground justify-start"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  <span className="font-semibold">(212) 651-4858</span>
                </Button>
              </a>
              {user ? (
                <>
                  <Link to={getDashboardPath()} className="text-primary-foreground hover:text-[hsl(var(--accent))] transition-colors font-semibold" onClick={() => setIsMenuOpen(false)}>
                    Dashboard
                  </Link>
                  <Button variant="ghost" onClick={() => { signOut(); setIsMenuOpen(false); }} className="justify-start text-primary-foreground hover:text-[hsl(var(--accent))]">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Link to="/login" className="text-primary-foreground hover:text-[hsl(var(--accent))] transition-colors font-semibold" onClick={() => setIsMenuOpen(false)}>
                  Sign In
                </Link>
              )}
              <Link to="/book" onClick={() => setIsMenuOpen(false)}>
                <GoldButton className="w-full">Book Now</GoldButton>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
