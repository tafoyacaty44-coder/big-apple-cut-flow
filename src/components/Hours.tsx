import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, MapPin, Phone } from "lucide-react";
import Logo from "./Logo";

const Hours = () => {
  return (
    <section id="about" className="py-24 bg-primary relative overflow-hidden">
      {/* Logo watermark */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-[0.03]">
        <Logo size="xl" className="h-96 w-auto" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[hsl(var(--accent))] gold-underline inline-block pb-3">
            Visit Us
          </h2>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto mt-6">
            Experience the finest grooming in Manhattan's East Village
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Hours */}
          <Card className="bg-card/5 border-[hsl(var(--accent))]/20 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-[hsl(var(--accent))]/20 flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-[hsl(var(--accent))]" />
              </div>
              <CardTitle className="text-[hsl(var(--accent))]">Hours</CardTitle>
              <CardDescription className="text-primary-foreground/70">We're open 7 days a week</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-primary-foreground/90">
              <div className="flex justify-between">
                <span>Mon - Fri</span>
                <span className="font-semibold">9am - 8pm</span>
              </div>
              <div className="flex justify-between">
                <span>Saturday</span>
                <span className="font-semibold">9am - 7pm</span>
              </div>
              <div className="flex justify-between">
                <span>Sunday</span>
                <span className="font-semibold">10am - 6pm</span>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card className="bg-card/5 border-[hsl(var(--accent))]/20 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-[hsl(var(--accent))]/20 flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-[hsl(var(--accent))]" />
              </div>
              <CardTitle className="text-[hsl(var(--accent))]">Location</CardTitle>
              <CardDescription className="text-primary-foreground/70">Find us in the heart of East Village</CardDescription>
            </CardHeader>
            <CardContent className="text-primary-foreground/90">
              <p className="mb-4">
                422 E 14th St<br />
                New York, NY 10009
              </p>
              <a 
                href="https://maps.google.com/?q=422+E+14th+St,+New+York,+NY+10009" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[hsl(var(--accent))] hover:text-[hsl(var(--gold-light))] transition-colors font-medium inline-flex items-center gap-1"
              >
                Get Directions →
              </a>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="bg-card/5 border-[hsl(var(--accent))]/20 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-[hsl(var(--accent))]/20 flex items-center justify-center mb-4">
                <Phone className="h-6 w-6 text-[hsl(var(--accent))]" />
              </div>
              <CardTitle className="text-[hsl(var(--accent))]">Contact</CardTitle>
              <CardDescription className="text-primary-foreground/70">Call us or walk right in</CardDescription>
            </CardHeader>
            <CardContent className="text-primary-foreground/90">
              <a 
                href="tel:2126514858" 
                className="text-2xl font-bold text-[hsl(var(--accent))] hover:text-[hsl(var(--gold-light))] transition-colors mb-4 block"
              >
                (212) 651-4858
              </a>
              <p className="text-sm">
                Walk-ins welcome or call ahead to book your appointment
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Hours;
