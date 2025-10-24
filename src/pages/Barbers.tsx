import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SectionHeading from '@/components/ui/section-heading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GoldButton } from '@/components/ui/gold-button';
import { Scissors, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const barbers = [
  {
    name: 'Marco',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    experience: 12,
    specialties: ['Classic Cuts', 'Beard Sculpting', 'Hot Towel Shaves'],
    bio: 'Master barber with over a decade of experience in traditional barbering techniques.',
  },
  {
    name: 'Anthony',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
    experience: 8,
    specialties: ['Modern Styles', 'Fades', 'Hair Coloring'],
    bio: 'Specialist in contemporary cuts and precision fades with an eye for detail.',
  },
  {
    name: 'Vincent',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    experience: 15,
    specialties: ['Straight Razor', 'Classic Cuts', 'Beard Trim'],
    bio: 'Veteran barber known for his exceptional straight razor technique and classic expertise.',
  },
  {
    name: 'Luis',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
    experience: 6,
    specialties: ['Modern Cuts', 'Styling', 'Consultations'],
    bio: 'Creative stylist who excels at helping clients find their perfect look.',
  },
];

const Barbers = () => {
  const navigate = useNavigate();

  const handleBooking = (barberName: string) => {
    navigate('/book', { state: { selectedBarber: barberName } });
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <SectionHeading 
            title="Meet Our Barbers"
            subtitle="Skilled craftsmen dedicated to perfecting your look"
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {barbers.map((barber, index) => (
              <Card 
                key={index}
                className="border-2 border-border hover:border-[hsl(var(--accent))] hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all duration-300 group overflow-hidden"
              >
                <div className="relative overflow-hidden aspect-square">
                  <img 
                    src={barber.image} 
                    alt={barber.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-2xl font-bold text-white mb-1">{barber.name}</h3>
                    <p className="text-[hsl(var(--accent))] text-sm font-semibold">
                      {barber.experience} years experience
                    </p>
                  </div>
                </div>

                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Scissors className="h-5 w-5 text-[hsl(var(--accent))]" />
                    Specialties
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {barber.specialties.map((specialty, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[hsl(var(--accent))]/10 border border-[hsl(var(--accent))]/20 text-xs"
                      >
                        <Star className="h-3 w-3 text-[hsl(var(--accent))]" />
                        {specialty}
                      </span>
                    ))}
                  </div>
                  
                  <p className="text-sm text-muted-foreground">{barber.bio}</p>

                  <GoldButton 
                    className="w-full"
                    onClick={() => handleBooking(barber.name)}
                  >
                    Book with {barber.name}
                  </GoldButton>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Barbers;
