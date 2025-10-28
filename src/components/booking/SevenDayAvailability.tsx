import { useQuery } from '@tanstack/react-query';
import { getBarberAvailability } from '@/lib/api/availability';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock } from 'lucide-react';
import { useState } from 'react';
import { format, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface SevenDayAvailabilityProps {
  barberId: string;
  serviceDuration?: number;
  onSelectTime?: (date: string, time: string) => void;
}

export const SevenDayAvailability = ({ 
  barberId, 
  serviceDuration = 30,
  onSelectTime 
}: SevenDayAvailabilityProps) => {
  const { toast } = useToast();
  const today = new Date();
  const fromDate = format(today, 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate] = useState<string | null>(fromDate);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  
  const toDate = format(addDays(today, 6), 'yyyy-MM-dd');

  const handleTimeSelect = (date: string, time: string) => {
    setSelectedTimeSlot(time);
    onSelectTime?.(date, time);
    toast({
      title: '✓ Time Selected',
      description: `${format(new Date(date), 'EEEE, MMM d')} at ${time}`,
    });
  };

  const { data: availability, isLoading } = useQuery({
    queryKey: ['availability', 'barber', barberId, fromDate, toDate, serviceDuration],
    queryFn: () => getBarberAvailability(barberId, fromDate, toDate, serviceDuration),
    refetchInterval: 60000,
  });

  // Get next 5 available slots across all days
  const nextSlots = availability
    ?.flatMap(day => day.time_slots.map(time => ({ date: day.date, time })))
    .slice(0, 5) || [];

  const dates = [];
  for (let i = 0; i < 7; i++) {
    dates.push(addDays(today, i));
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            7-Day Availability
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Skeleton className="h-4 w-32" />
            <div className="grid grid-cols-7 gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map(i => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <Skeleton className="h-4 w-48" />
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const selectedDaySlots = availability?.find(day => day.date === selectedDate)?.time_slots || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          7-Day Availability
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Week Calendar */}
        <div>
          <h4 className="text-sm font-medium mb-3">Select a day</h4>
          <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-2 -mx-2 px-2 md:grid md:grid-cols-7 md:overflow-visible">
            {dates.map((date) => {
              const dateStr = format(date, 'yyyy-MM-dd');
              const dayAvailability = availability?.find(a => a.date === dateStr);
              const hasSlots = (dayAvailability?.time_slots.length || 0) > 0;
              const isSelected = selectedDate === dateStr;
              const isToday = dateStr === fromDate;

              return (
                <Button
                  key={dateStr}
                  variant={isSelected ? 'default' : isToday ? 'secondary' : 'outline'}
                  size="sm"
                  className={cn(
                    "flex flex-col h-auto py-2 flex-shrink-0 snap-center min-w-[70px] md:min-w-0 min-h-[48px]",
                    isToday && !isSelected && "border-primary border-2"
                  )}
                  disabled={!hasSlots}
                  onClick={() => setSelectedDate(dateStr)}
                >
                  {isToday && (
                    <span className="text-xs font-bold text-primary">TODAY</span>
                  )}
                  <span className="text-xs font-medium">
                    {format(date, 'EEE')}
                  </span>
                  <span className="text-lg font-bold">
                    {format(date, 'd')}
                  </span>
                  {hasSlots && (
                    <span className="text-xs text-muted-foreground mt-1">
                      {dayAvailability.time_slots.length} slots
                    </span>
                  )}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Time Slots for Selected Day */}
        {selectedDate && selectedDaySlots.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3">
              Available times for {format(new Date(selectedDate), 'EEEE, MMMM d')}
            </h4>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {selectedDaySlots.map((time) => (
                <Button
                  key={time}
                  variant={selectedTimeSlot === time ? 'default' : 'outline'}
                  size="sm"
                  className="min-h-[44px]"
                  onClick={() => handleTimeSelect(selectedDate, time)}
                >
                  {time}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Next Available Times */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Next Available Times
          </h4>
          {nextSlots.length > 0 ? (
            <div className="space-y-2">
              {nextSlots.map(({ date, time }, idx) => (
                <Button
                  key={`${date}-${time}-${idx}`}
                  variant={selectedTimeSlot === time ? 'default' : 'outline'}
                  className="w-full justify-start min-h-[44px]"
                  onClick={() => handleTimeSelect(date, time)}
                >
                  <span className="font-medium">{format(new Date(date), 'EEE, MMM d')}</span>
                  <span className="mx-2">•</span>
                  <span>{time}</span>
                </Button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 space-y-3">
              <p className="text-sm text-muted-foreground">
                No availability in the next 7 days
              </p>
              <Button variant="outline" size="sm" className="min-h-[44px]">
                Notify Me When Available
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};