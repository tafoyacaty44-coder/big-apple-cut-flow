import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { getBarbersWithRealAvailability } from '@/lib/api/barbers';
import { Skeleton } from '@/components/ui/skeleton';
import { useBooking } from '@/contexts/BookingContext';
import { ChevronRight, Clock, Flame } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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
    toast({
      title: "Time selected!",
      description: `Selected ${time} with ${barberName}`,
    });
    navigate('/book');
  };

  const getUrgencyLevel = (slots: string[]) => {
    if (slots.length <= 2) return 'high';
    if (slots.length <= 5) return 'medium';
    return 'low';
  };

  if (isLoading) {
    return (
      <section className="py-16 px-4 bg-muted/30 animate-fade-in">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Available Today
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 bg-muted/30 animate-fade-in">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Clock className="h-6 w-6 text-[hsl(var(--accent))]" />
            <h2 className="text-3xl md:text-4xl font-bold">
              Available Today
            </h2>
          </div>
          <p className="text-muted-foreground">
            Book instantly with real-time availability
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
          {barbers.map((barber, index) => {
            const todaySlots = barber.realAvailability[0]?.time_slots || [];
            const displaySlots = todaySlots.slice(0, 5);
            const hasMore = todaySlots.length > 5;
            const urgency = getUrgencyLevel(todaySlots);

            return (
              <Card 
                key={barber.id} 
                className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    {barber.profile_image_url ? (
                      <img 
                        src={barber.profile_image_url} 
                        alt={barber.full_name}
                        className="h-12 w-12 rounded-full object-cover ring-2 ring-[hsl(var(--accent))]/20"
                        loading="lazy"
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
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">
                          {todaySlots.length} slots today
                        </p>
                        {urgency === 'high' && (
                          <Badge variant="destructive" className="text-xs flex items-center gap-1">
                            <Flame className="h-3 w-3" />
                            Filling Fast
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {displaySlots.length > 0 ? (
                    <div className="space-y-2">
                      {displaySlots.map((time, timeIndex) => (
                        <Button
                          key={time}
                          variant="outline"
                          size="sm"
                          className="w-full justify-between hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--accent))] transition-all duration-200 hover:scale-105 animate-fade-in"
                          style={{ animationDelay: `${(index * 100) + (timeIndex * 50)}ms` }}
                          onClick={() => handleSlotClick(
                            barber.id, 
                            barber.full_name, 
                            barber.realAvailability[0].date, 
                            time
                          )}
                          aria-label={`Book appointment at ${time} with ${barber.full_name}`}
                        >
                          {time}
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      ))}
                      {hasMore && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))]/10 transition-colors"
                          onClick={() => navigate(`/barbers/${barber.id}`)}
                        >
                          View more times
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4 space-y-2">
                      <p className="text-sm text-muted-foreground">
                        No slots available today
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/barbers/${barber.id}`)}
                        className="text-xs"
                      >
                        Check future dates
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-8 animate-fade-in" style={{ animationDelay: '400ms' }}>
          <Button 
            variant="outline"
            onClick={() => navigate('/barbers')}
            className="border-[hsl(var(--accent))] text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))]/10 transition-all duration-300 hover:scale-105"
            aria-label="View all barbers"
          >
            View All Barbers
          </Button>
        </div>
      </div>
    </section>
  );
};

export default LiveAvailabilityBoard;
