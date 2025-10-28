import { useQuery } from '@tanstack/react-query';
import { getBarberAvailability } from '@/lib/api/availability';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock } from 'lucide-react';
import { useState } from 'react';
import { format, addDays } from 'date-fns';

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
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  const today = new Date();
  const fromDate = format(today, 'yyyy-MM-dd');
  const toDate = format(addDays(today, 6), 'yyyy-MM-dd');

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
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-48 bg-muted rounded"></div>
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
          <div className="grid grid-cols-7 gap-2">
            {dates.map((date) => {
              const dateStr = format(date, 'yyyy-MM-dd');
              const dayAvailability = availability?.find(a => a.date === dateStr);
              const hasSlots = (dayAvailability?.time_slots.length || 0) > 0;
              const isSelected = selectedDate === dateStr;

              return (
                <Button
                  key={dateStr}
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  className="flex flex-col h-auto py-2"
                  disabled={!hasSlots}
                  onClick={() => setSelectedDate(dateStr)}
                >
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
                  variant="outline"
                  size="sm"
                  onClick={() => onSelectTime?.(selectedDate, time)}
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
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => onSelectTime?.(date, time)}
                >
                  <span className="font-medium">{format(new Date(date), 'EEE, MMM d')}</span>
                  <span className="mx-2">•</span>
                  <span>{time}</span>
                </Button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No availability in the next 7 days
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};