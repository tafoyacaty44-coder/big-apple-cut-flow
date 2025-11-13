import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, startOfWeek, endOfWeek, isBefore, startOfDay } from 'date-fns';
import { GoldButton } from '@/components/ui/gold-button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Get availability for a specific date
  const getDateAvailability = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return availabilityData.find((av) => av.date === dateStr);
  };

  const hasAvailability = (date: Date) => {
    const avail = getDateAvailability(date);
    return avail && avail.slots && avail.slots.length > 0;
  };

  const isPastDate = (date: Date) => {
    return isBefore(date, startOfDay(new Date()));
  };

  // Update available time slots when date is selected
  useEffect(() => {
    if (selectedDate) {
      const avail = getDateAvailability(selectedDate);
      setAvailableTimeSlots(avail?.slots || []);
    } else {
      setAvailableTimeSlots([]);
    }
  }, [selectedDate, availabilityData]);

  const getDayClassName = (date: Date) => {
    const past = isPastDate(date);
    const today = isToday(date);
    const selected = selectedDate && isSameDay(date, selectedDate);
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
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={handlePreviousMonth}
          className="p-1 hover:bg-muted rounded-md transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-bold uppercase">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <button
          onClick={handleNextMonth}
          className="p-1 hover:bg-muted rounded-md transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Day Labels */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
          <div key={i} className="text-center text-xs font-semibold text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
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
              className={`
                aspect-square rounded-md text-sm transition-all
                ${getDayClassName(date)}
                ${!isCurrentMonth ? 'opacity-30' : ''}
              `}
            >
              {format(date, 'd')}
            </button>
          );
        })}
      </div>

      {/* Time Slots */}
      <div className="pt-3 border-t">
        <p className="text-sm font-semibold mb-3">
          Select from available time *
        </p>
        {availableTimeSlots.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 max-h-[250px] overflow-y-auto">
            {availableTimeSlots.map((time) => (
              <GoldButton
                key={time}
                onClick={() => onTimeSelect(time)}
                variant={selectedTime === time ? 'default' : 'outline'}
                size="sm"
                className="w-full"
              >
                {time}
              </GoldButton>
            ))}
          </div>
        ) : (
          <p className="text-sm text-destructive font-medium">
            {selectedDate
              ? 'NO TIMESLOTS AVAILABLE - Please select another date'
              : 'Please select a date to view available times'}
          </p>
        )}
      </div>
    </div>
  );
};
