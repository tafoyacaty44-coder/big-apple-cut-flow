import { useQuery } from '@tanstack/react-query';
import { getBarberAvailability } from '@/lib/api/availability';
import { format, addDays } from 'date-fns';

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

  const { data, isLoading } = useQuery({
    queryKey: ['availability', 'barber', barberId, fromDate, toDate, 30],
    queryFn: () => getBarberAvailability(barberId, fromDate, toDate, 30),
    refetchInterval: 60000,
  });

  if (isLoading) {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-1.5">
          {[...Array(7)].map((_, i) => (
            <div 
              key={i} 
              className="flex-1 aspect-square rounded-full bg-muted animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const date = addDays(today, i);
    weekDays.push({
      date: format(date, 'yyyy-MM-dd'),
      dayLabel: format(date, 'EEE').charAt(0), // S, M, T, W, etc
      isToday: i === 0,
    });
  }

  return (
    <div className="space-y-1.5">
      {/* Day Labels */}
      <div className="flex items-center justify-between gap-1.5 text-[10px] text-muted-foreground font-medium">
        {weekDays.map((dayData, index) => (
          <div key={index} className="flex-1 text-center min-w-0">
            {dayData.dayLabel}
          </div>
        ))}
      </div>
      
      {/* Colored Availability Dots */}
      <div className="flex items-center justify-between gap-1.5">
        {weekDays.map((dayData, index) => {
          const dayAvailability = data?.find((d: any) => d.date === dayData.date);
          const slotCount = dayAvailability?.time_slots?.length || 0;
          const hasSlots = slotCount > 0;
          const isClickable = hasSlots && onDateClick;

          return (
            <button
              key={index}
              onClick={() => isClickable && onDateClick(dayData.date)}
              disabled={!hasSlots}
              className={`
                flex-1 aspect-square rounded-full flex items-center justify-center text-[10px] font-bold transition-all
                ${
                  dayData.isToday
                    ? 'bg-foreground text-background border-2 border-[hsl(var(--accent))]'
                    : hasSlots
                    ? 'bg-green-500 text-white hover:bg-green-600 cursor-pointer'
                    : 'bg-destructive/80 text-white cursor-not-allowed'
                }
              `}
              aria-label={`${dayData.dayLabel}: ${hasSlots ? `${slotCount} slots available` : 'No availability'}`}
            >
              {hasSlots ? slotCount : '×'}
            </button>
          );
        })}
      </div>
    </div>
  );
};
