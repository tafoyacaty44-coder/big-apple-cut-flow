import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SectionHeading from '@/components/ui/section-heading';
import { GoldButton } from '@/components/ui/gold-button';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getBarbersWithAvailability } from '@/lib/api/barbers';
import BarberCard from '@/components/booking/BarberCard';
import { Loader2 } from 'lucide-react';

const Barbers = () => {
  const navigate = useNavigate();

  const { data: barbers, isLoading } = useQuery({
    queryKey: ['barbers-with-availability'],
    queryFn: getBarbersWithAvailability,
  });

  const handleBooking = (barberId: string, barberName: string) => {
    navigate('/book', { state: { selectedBarber: { id: barberId, name: barberName } } });
  };

  const handleViewDetail = (barberId: string) => {
    navigate(`/barbers/${barberId}`);
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

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--accent))]" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {barbers?.map((barber) => (
                <div key={barber.id} className="relative">
                  <div 
                    className="cursor-pointer" 
                    onClick={() => handleViewDetail(barber.id)}
                  >
                    <BarberCard
                      barber={barber}
                      selectedServiceName="Select a service"
                      selectedServicePrice={0}
                      selectedServiceDuration={0}
                      isSelected={false}
                      onSelect={() => handleViewDetail(barber.id)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <GoldButton 
                      variant="outline"
                      onClick={() => handleViewDetail(barber.id)}
                    >
                      View Schedule
                    </GoldButton>
                    <GoldButton 
                      onClick={() => handleBooking(barber.id, barber.full_name)}
                    >
                      Book Now
                    </GoldButton>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Barbers;
