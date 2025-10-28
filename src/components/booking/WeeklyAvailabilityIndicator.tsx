import { useQuery } from '@tanstack/react-query';
import { getBarberAvailability } from '@/lib/api/availability';
import { format, addDays } from 'date-fns';
import { cn } from '@/lib/utils';

interface WeeklyAvailabilityIndicatorProps {
  barberId: string;
  onDateClick?: (date: string) => void;
}

export const WeeklyAvailabilityIndicator = ({ 
  barberId, 
  onDateClick 
}: WeeklyAvailabilityIndicatorProps) => {
  const today = new Date();
  const fromDate = format(today, 'yyyy-MM-dd');
  const toDate = format(addDays(today, 6), 'yyyy-MM-dd');

  const { data: availability, isLoading } = useQuery({
    queryKey: ['availability', 'barber', barberId, fromDate, toDate, 30],
    queryFn: () => getBarberAvailability(barberId, fromDate, toDate, 30),
    refetchInterval: 60000,
  });

  if (isLoading) {
    return (
      <div className="flex gap-1 justify-center items-center">
        {[...Array(7)].map((_, i) => (
          <div 
            key={i} 
            className="w-8 h-8 rounded-full bg-muted animate-pulse"
          />
        ))}
      </div>
    );
  }

  const dates = [];
  for (let i = 0; i < 7; i++) {
    dates.push(addDays(today, i));
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-1 justify-center items-center">
        {dates.map((date) => {
          const dateStr = format(date, 'yyyy-MM-dd');
          const isToday = dateStr === fromDate;
          const dayAvailability = availability?.find(a => a.date === dateStr);
          const slotCount = dayAvailability?.time_slots.length || 0;
          
          return (
            <button
              key={dateStr}
              onClick={() => onDateClick?.(dateStr)}
              className={cn(
                "w-8 h-8 rounded-full text-xs font-medium transition-all",
                isToday && "border-2 border-primary",
                slotCount > 0 
                  ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-100" 
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
              disabled={slotCount === 0}
              title={`${format(date, 'EEE')}: ${slotCount} slots available`}
            >
              {slotCount > 0 ? slotCount : '—'}
            </button>
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground px-1">
        {dates.map((date) => (
          <span key={format(date, 'yyyy-MM-dd')} className="w-8 text-center">
            {format(date, 'EEE').charAt(0)}
          </span>
        ))}
      </div>
    </div>
  );
};
