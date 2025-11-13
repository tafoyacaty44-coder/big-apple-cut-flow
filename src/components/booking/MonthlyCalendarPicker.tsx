import { useState, useEffect, useRef } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, startOfWeek, endOfWeek, isBefore, startOfDay } from 'date-fns';
import { GoldButton } from '@/components/ui/gold-button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MonthlyCalendarPickerProps {
  barberId: string;
  serviceDuration: number;
  selectedDate: Date | null;
  selectedTime: string | null;
  onDateSelect: (date: Date) => void;
  onTimeSelect: (time: string) => void;
  availabilityData: any[];
}

export const MonthlyCalendarPicker = ({
  barberId,
  serviceDuration,
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
  availabilityData,
}: MonthlyCalendarPickerProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [now, setNow] = useState(new Date());
  const timeSlotsRef = useRef<HTMLDivElement>(null);

  // Auto-refresh current time every minute for accurate past time filtering
  useEffect(() => {
    const intervalId = setInterval(() => {
      setNow(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(intervalId);
  }, []);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Normalize slot field names (backend uses time_slots, fallback to slots)
  const getSlots = (avail: any): string[] => {
    return avail?.time_slots ?? avail?.slots ?? [];
  };

  // Get availability for a specific date
  const getDateAvailability = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return availabilityData.find((av) => av.date === dateStr);
  };

  const hasAvailability = (date: Date) => {
    const avail = getDateAvailability(date);
    let slots = getSlots(avail);
    
    // Filter out past times if checking today
    if (isSameDay(date, now)) {
      slots = slots.filter(timeSlot => {
        const [hours, minutes] = timeSlot.split(':');
        const slotTime = new Date();
        slotTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        return slotTime > now;
      });
    }
    
    return slots.length > 0;
  };

  const isPastDate = (date: Date) => {
    return isBefore(date, startOfDay(new Date()));
  };

  // Update available time slots when date is selected
  useEffect(() => {
    if (selectedDate) {
      const avail = getDateAvailability(selectedDate);
      let slots = getSlots(avail);
      
      // Filter out past times if selected date is today
      if (isSameDay(selectedDate, now)) {
        slots = slots.filter(timeSlot => {
          const [hours, minutes] = timeSlot.split(':');
          const slotTime = new Date();
          slotTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
          return slotTime > now;
        });
      }
      
      setAvailableTimeSlots(slots);
    } else {
      setAvailableTimeSlots([]);
    }
  }, [selectedDate, availabilityData, now]);

  // Auto-scroll to time slots when date is selected and slots are available
  useEffect(() => {
    if (selectedDate && availableTimeSlots.length > 0 && timeSlotsRef.current) {
      setTimeout(() => {
        timeSlotsRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        });
      }, 100);
    }
  }, [selectedDate, availableTimeSlots]);

  const getDayClassName = (date: Date) => {
    const past = isPastDate(date);
    const today = isToday(date);
    const selected = selectedDate && isSameDay(date, selectedDate);
    const dateStr = format(date, 'yyyy-MM-dd');
    const hasData = availabilityData.some((av) => av.date === dateStr);
    const available = hasAvailability(date);

    if (past) {
      return 'bg-muted/30 text-muted-foreground cursor-not-allowed';
    }
    if (selected) {
      return 'bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] font-bold shadow-md';
    }
    if (today) {
      return 'bg-foreground text-background font-bold border-2 border-[hsl(var(--accent))]';
    }
    if (!hasData) {
      // Neutral style for days where availability hasn't loaded yet
      return 'bg-muted/50 text-muted-foreground cursor-wait';
    }
    if (available) {
      return 'bg-green-500 text-white hover:bg-green-600 cursor-pointer';
    }
    return 'bg-destructive/80 text-white cursor-not-allowed';
  };

  const handlePreviousMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  return (
    <div className="space-y-3">
      {/* Calendar Header - Compact */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={handlePreviousMonth}
          className="p-1 hover:bg-muted rounded-md transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h3 className="text-sm font-bold uppercase">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <button
          onClick={handleNextMonth}
          className="p-1 hover:bg-muted rounded-md transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day Labels - Compact */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
          <div key={i} className="text-center text-[10px] font-semibold text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid - Compact */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date, i) => {
          const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
          const past = isPastDate(date);
          const available = hasAvailability(date);

          return (
            <button
              key={i}
              onClick={() => {
                if (!past && available) {
                  onDateSelect(date);
                }
              }}
              disabled={past || !available}
              className={cn(
                'aspect-square rounded-md text-xs font-medium transition-all',
                getDayClassName(date),
                !isCurrentMonth && 'opacity-30'
              )}
            >
              {format(date, 'd')}
            </button>
          );
        })}
      </div>

      {/* Time Slots - Compact */}
      {selectedDate && availableTimeSlots.length > 0 && (
        <div ref={timeSlotsRef} className="mt-3 pt-3 border-t">
          <h4 className="text-xs font-semibold mb-2 text-muted-foreground uppercase">
            {format(selectedDate, 'MMM d, yyyy')}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5">
            {availableTimeSlots.map((time) => {
              const isSelected = selectedTime === time;
              return (
                <GoldButton
                  key={time}
                  onClick={() => onTimeSelect(time)}
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  className="min-h-[32px] text-xs"
                >
                  {time}
                </GoldButton>
              );
            })}
          </div>
        </div>
      )}

      {selectedDate && availableTimeSlots.length === 0 && (
        <div className="mt-3 pt-3 border-t text-center text-xs text-muted-foreground">
          No times available. Select another date.
        </div>
      )}

      {!selectedDate && (
        <div className="mt-3 pt-3 border-t text-center text-xs text-muted-foreground">
          Select a date to see available times
        </div>
      )}
    </div>
  );
};
