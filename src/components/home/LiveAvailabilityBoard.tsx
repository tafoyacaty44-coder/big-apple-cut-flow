import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { getBarbersWithRealAvailability } from '@/lib/api/barbers';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { useBooking } from '@/contexts/BookingContext';
import { ChevronRight } from 'lucide-react';

const LiveAvailabilityBoard = () => {
  const navigate = useNavigate();
  const { setPrefilled } = useBooking();

  const { data: barbers = [], isLoading } = useQuery({
    queryKey: ['barbers', 'real-availability-home'],
    queryFn: () => getBarbersWithRealAvailability(30, 1), // Today only, 30 min slots
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  const handleSlotClick = (barberId: string, barberName: string, date: string, time: string) => {
    setPrefilled({ barberId, barberName, date, time });
    navigate('/book');
  };

  if (isLoading) {
    return (
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Today's Availability
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="container mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Today's Availability
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
          {barbers.map((barber) => {
            const todaySlots = barber.realAvailability[0]?.time_slots || [];
            const displaySlots = todaySlots.slice(0, 5);
            const hasMore = todaySlots.length > 5;

            return (
              <Card key={barber.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    {barber.profile_image_url ? (
                      <img 
                        src={barber.profile_image_url} 
                        alt={barber.full_name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-[hsl(var(--accent))]/10 flex items-center justify-center">
                        <span className="text-lg font-bold text-[hsl(var(--accent))]">
                          {barber.full_name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold">{barber.full_name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {todaySlots.length} slots today
                      </p>
                    </div>
                  </div>

                  {displaySlots.length > 0 ? (
                    <div className="space-y-2">
                      {displaySlots.map((time) => (
                        <Button
                          key={time}
                          variant="outline"
                          size="sm"
                          className="w-full justify-between hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--accent))]"
                          onClick={() => handleSlotClick(
                            barber.id, 
                            barber.full_name, 
                            barber.realAvailability[0].date, 
                            time
                          )}
                        >
                          {time}
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      ))}
                      {hasMore && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-[hsl(var(--accent))]"
                          onClick={() => navigate(`/barbers/${barber.id}`)}
                        >
                          View more times
                        </Button>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No slots available today
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <Button 
            variant="outline"
            onClick={() => navigate('/barbers')}
            className="border-[hsl(var(--accent))] text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))]/10"
          >
            View All Barbers
          </Button>
        </div>
      </div>
    </section>
  );
};

export default LiveAvailabilityBoard;
