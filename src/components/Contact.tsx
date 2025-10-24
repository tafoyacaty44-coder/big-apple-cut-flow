import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Clock } from "lucide-react";

const Contact = () => {
  return (
    <section id="contact" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Get In Touch</h2>
            <p className="text-xl text-muted-foreground">
              Ready for your next cut? We're here to serve you.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Map */}
            <Card className="vintage-shadow border-2 overflow-hidden">
              <CardContent className="p-0">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.0254037689894!2d-73.98685!3d40.730824!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c2599e8b4c5c5b%3A0x1234567890abcdef!2s422%20E%2014th%20St%2C%20New%20York%2C%20NY%2010009!5e0!3m2!1sen!2sus!4v1234567890"
                  width="100%"
                  height="400"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Big Apple Barbers Location"
                />
              </CardContent>
            </Card>

            {/* Contact Info */}
            <div className="space-y-6">
              <Card className="vintage-shadow border-2">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-2">Address</h3>
                      <p className="text-muted-foreground">
                        422 E 14th St<br />
                        New York, NY 10009
                      </p>
                      <a 
                        href="https://maps.google.com/?q=422+E+14th+St,+New+York,+NY+10009"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-2 text-accent hover:underline"
                      >
                        Get Directions →
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="vintage-shadow border-2">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-2">Phone</h3>
                      <a 
                        href="tel:2126514858"
                        className="text-xl font-bold text-accent hover:underline"
                      >
                        (212) 651-4858
                      </a>
                      <p className="text-sm text-muted-foreground mt-2">
                        Call to book or inquire about services
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="vintage-shadow border-2">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-2">Hours</h3>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-semibold">Mon-Thu:</span> 10:00 AM - 7:30 PM</p>
                        <p><span className="font-semibold">Fri-Sat:</span> 10:00 AM - 6:00 PM</p>
                        <p><span className="font-semibold">Sunday:</span> 10:30 AM - 6:00 PM</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-6 text-lg">
                Book Your Appointment
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
