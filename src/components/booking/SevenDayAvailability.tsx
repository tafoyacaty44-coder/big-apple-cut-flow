import { useQuery } from '@tanstack/react-query';
import { getBarberAvailability } from '@/lib/api/availability';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import { cn, formatTime12h } from '@/lib/utils';
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
  const timeSlotsRef = useRef<HTMLDivElement>(null);
  
  const toDate = format(addDays(today, 6), 'yyyy-MM-dd');

  const handleTimeSelect = (date: string, time: string) => {
    setSelectedTimeSlot(time);
    onSelectTime?.(date, time);
    toast({
      title: '✓ Time Selected',
      description: `${format(new Date(date), 'EEEE, MMM d')} at ${formatTime12h(time)}`,
    });
  };

  const { data: availability, isLoading } = useQuery({
    queryKey: ['availability', 'barber', barberId, fromDate, toDate, serviceDuration],
    queryFn: () => getBarberAvailability(barberId, fromDate, toDate, serviceDuration),
    refetchInterval: 60000,
  });

  // Auto-scroll to time slots when date is selected
  useEffect(() => {
    if (selectedDate && timeSlotsRef.current) {
      setTimeout(() => {
        timeSlotsRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        });
      }, 100);
    }
  }, [selectedDate]);

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
    <div className="grid grid-cols-1 md:grid-cols-[35%_65%] gap-4">
      {/* Left: Compact 7-Day Calendar */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Select Date
        </h4>
        <div className="grid grid-cols-1 gap-1.5">
          {dates.map((date) => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const dayAvailability = availability?.find(a => a.date === dateStr);
            const hasSlots = (dayAvailability?.time_slots.length || 0) > 0;
            const isSelected = selectedDate === dateStr;
            const isToday = dateStr === fromDate;

            return (
              <Button
                key={dateStr}
                variant={isSelected ? 'default' : 'outline'}
                size="sm"
                className={cn(
                  "flex items-center justify-between h-auto py-2 px-3",
                  isToday && !isSelected && "border-[hsl(var(--accent))] border-2"
                )}
                disabled={!hasSlots}
                onClick={() => setSelectedDate(dateStr)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">
                    {format(date, 'EEE')}
                  </span>
                  <span className="text-lg font-bold">
                    {format(date, 'd')}
                  </span>
                  {isToday && (
                    <span className="text-xs bg-[hsl(var(--accent))]/20 text-[hsl(var(--accent))] px-1.5 py-0.5 rounded">
                      TODAY
                    </span>
                  )}
                </div>
                {hasSlots && (
                  <span className="text-xs text-muted-foreground">
                    {dayAvailability.time_slots.length} slots
                  </span>
                )}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Right: Time Slots */}
      <div ref={timeSlotsRef} className="space-y-2">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <Clock className="h-4 w-4" />
          {selectedDate 
            ? `Available Times - ${format(new Date(selectedDate), 'EEEE, MMM d')}`
            : 'Select a date to see times'
          }
        </h4>
        
        {selectedDate && selectedDaySlots.length > 0 ? (
          <div className="grid grid-cols-3 gap-2 max-h-[400px] overflow-y-auto pr-2">
            {selectedDaySlots.map((time) => (
              <Button
                key={time}
                variant={selectedTimeSlot === time ? 'default' : 'outline'}
                size="sm"
                className="h-10"
                onClick={() => handleTimeSelect(selectedDate, time)}
              >
                {formatTime12h(time)}
              </Button>
            ))}
          </div>
        ) : selectedDate && selectedDaySlots.length === 0 ? (
          <div className="flex items-center justify-center h-[200px] border-2 border-dashed border-border rounded-lg">
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                NO TIMESLOTS AVAILABLE
              </p>
              <p className="text-xs text-muted-foreground">
                Please select another date
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[200px] border-2 border-dashed border-border rounded-lg">
            <p className="text-sm text-muted-foreground">
              Select a date to view available times
            </p>
          </div>
        )}
      </div>
    </div>
  );
};