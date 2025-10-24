import { Clock, MapPin, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Hours = () => {
  const hours = [
    { days: "Monday - Thursday", time: "10:00 AM - 7:30 PM" },
    { days: "Friday - Saturday", time: "10:00 AM - 6:00 PM" },
    { days: "Sunday", time: "10:30 AM - 6:00 PM" }
  ];

  return (
    <section id="about" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Visit Us</h2>
            <p className="text-xl text-muted-foreground">
              Located in the heart of Manhattan's East Village
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Hours */}
            <Card className="border-2 vintage-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 mx-auto mb-4">
                  <Clock className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-center mb-6">Hours</h3>
                <div className="space-y-3">
                  {hours.map((schedule, index) => (
                    <div key={index} className="text-center">
                      <div className="font-semibold text-sm">{schedule.days}</div>
                      <div className="text-muted-foreground text-sm">{schedule.time}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card className="border-2 vintage-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 mx-auto mb-4">
                  <MapPin className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-center mb-6">Location</h3>
                <div className="text-center space-y-2">
                  <p className="font-semibold">422 E 14th St</p>
                  <p className="text-muted-foreground">New York, NY 10009</p>
                  <a 
                    href="https://maps.google.com/?q=422+E+14th+St,+New+York,+NY+10009"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-4 text-accent hover:underline"
                  >
                    Get Directions →
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="border-2 vintage-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 mx-auto mb-4">
                  <Phone className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-center mb-6">Contact</h3>
                <div className="text-center space-y-4">
                  <a 
                    href="tel:2126514858"
                    className="block text-2xl font-bold text-accent hover:underline"
                  >
                    (212) 651-4858
                  </a>
                  <p className="text-sm text-muted-foreground">
                    Call us to book your appointment or walk-ins welcome
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hours;
