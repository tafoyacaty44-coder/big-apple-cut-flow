import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getTodayAvailability } from '@/lib/api/availability';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Clock, RefreshCw } from 'lucide-react';
import SectionHeading from '@/components/ui/section-heading';
import { WeeklyAvailabilityIndicator } from '@/components/booking/WeeklyAvailabilityIndicator';
import { formatDistance } from 'date-fns';

export const TodayAvailability = () => {
  const navigate = useNavigate();

  const { data: barbers } = useQuery({
    queryKey: ['barbers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('barbers')
        .select('*')
        .eq('is_active', true);
      if (error) throw error;
      return data;
    }
  });

  const { data: availabilityMap, isLoading, dataUpdatedAt, refetch } = useQuery({
    queryKey: ['availability', 'today'],
    queryFn: getTodayAvailability,
    refetchInterval: 60000, // Refresh every minute
  });

  if (isLoading) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <SectionHeading 
            title="Today's Availability" 
            subtitle="Book your appointment today"
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-6">
                  <div className="h-24 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <SectionHeading 
            title="Today's Availability" 
            subtitle="Book your appointment today"
          />
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>Updated {formatDistance(dataUpdatedAt, new Date(), { addSuffix: true })}</span>
            <Button variant="ghost" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {barbers?.map((barber) => {
            const slots = availabilityMap?.get(barber.id) || [];
            
            return (
              <Card key={barber.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={barber.profile_image_url || undefined} />
                      <AvatarFallback>
                        {barber.full_name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">{barber.full_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {barber.years_experience} years experience
                      </p>
                    </div>
                  </div>

                  {slots.length > 0 ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Next available times:</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                  {slots.map((time) => (
                          <Button
                            key={time}
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/book?barber=${barber.id}&time=${time}`)}
                          >
                            {time}
                          </Button>
                        ))}
                      </div>
                      
                      {/* Weekly Availability Indicator */}
                      <div className="mt-4 pt-4 border-t">
                        <div className="text-xs text-muted-foreground mb-2 text-center">
                          This week:
                        </div>
                        <WeeklyAvailabilityIndicator 
                          barberId={barber.id}
                          onDateClick={(date) => navigate(`/barbers/${barber.id}?date=${date}`)}
                        />
                      </div>
                      
                      <Button 
                        className="w-full mt-4"
                        onClick={() => navigate(`/barbers/${barber.id}`)}
                      >
                        View Full Schedule
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground mb-3">
                        No availability today
                      </p>
                      <Button 
                        variant="outline"
                        onClick={() => navigate(`/barbers/${barber.id}`)}
                      >
                        View Future Dates
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};