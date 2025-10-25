import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GoldButton } from "@/components/ui/gold-button";
import SectionHeading from "@/components/ui/section-heading";
import { MapPin, Phone, Clock } from "lucide-react";

const Contact = () => {
  return (
    <section id="contact" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <SectionHeading 
          title="Get In Touch"
          subtitle="Visit us in the East Village or reach out to book your appointment"
        />

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Map */}
          <div className="rounded-lg overflow-hidden shadow-lg h-[400px]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.0254037689894!2d-73.98685!3d40.730824!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c2599e8b4c5c5b%3A0x1234567890abcdef!2s422%20E%2014th%20St%2C%20New%20York%2C%20NY%2010009!5e0!3m2!1sen!2sus!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Big Apple Barbers Location"
            />
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <Card className="border-2 border-border hover:border-[hsl(var(--accent))]/30 transition-colors">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-[hsl(var(--accent))]/10 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-[hsl(var(--accent))]" />
                  </div>
                  <CardTitle className="text-lg">Address</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  422 E 14th St<br />
                  New York, NY 10009
                </p>
                <a 
                  href="https://maps.google.com/?q=422+E+14th+St,+New+York,+NY+10009" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[hsl(var(--accent))] hover:text-[hsl(var(--gold-dark))] transition-colors font-medium mt-2 inline-block"
                >
                  Get Directions →
                </a>
              </CardContent>
            </Card>

            <Card className="border-2 border-border hover:border-[hsl(var(--accent))]/30 transition-colors">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-[hsl(var(--accent))]/10 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-[hsl(var(--accent))]" />
                  </div>
                  <CardTitle className="text-lg">Phone</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <a 
                  href="tel:2126514858" 
                  className="text-2xl font-bold text-[hsl(var(--accent))] hover:text-[hsl(var(--gold-dark))] transition-colors"
                >
                  (212) 651-4858
                </a>
                <p className="text-muted-foreground mt-2">
                  Call to book or ask about our services
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-border hover:border-[hsl(var(--accent))]/30 transition-colors">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-[hsl(var(--accent))]/10 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-[hsl(var(--accent))]" />
                  </div>
                  <CardTitle className="text-lg">Hours</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-muted-foreground">
                <div className="flex justify-between">
                  <span>Mon - Thu</span>
                  <span className="font-semibold">10am - 7:30pm</span>
                </div>
                <div className="flex justify-between">
                  <span>Friday</span>
                  <span className="font-semibold">10am - 6pm</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday</span>
                  <span className="font-semibold">10am - 6pm</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span className="font-semibold">10:30am - 6pm</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="text-center mt-12">
          <GoldButton size="lg">
            Book Your Appointment
          </GoldButton>
        </div>
      </div>
    </section>
  );
};

export default Contact;
