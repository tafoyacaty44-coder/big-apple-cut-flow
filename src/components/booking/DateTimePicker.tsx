import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { BarberAvailability } from '@/lib/api/barbers';
import { Clock } from 'lucide-react';

interface DateTimePickerProps {
  barberAvailability: BarberAvailability[];
  serviceDuration: number;
  selectedDate: Date | null;
  selectedTime: string | null;
  onDateSelect: (date: Date) => void;
  onTimeSelect: (time: string) => void;
}

const DateTimePicker = ({
  barberAvailability,
  serviceDuration,
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
}: DateTimePickerProps) => {
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);

  // Get barber's availability for selected date
  const getBarberScheduleForDate = (date: Date): BarberAvailability | undefined => {
    const dayOfWeek = date.getDay();
    return barberAvailability.find(
      (slot) => slot.day_of_week === dayOfWeek && slot.is_available
    );
  };

  // Generate time slots based on barber availability
  useEffect(() => {
    if (!selectedDate) {
      setAvailableTimeSlots([]);
      return;
    }

    const schedule = getBarberScheduleForDate(selectedDate);
    if (!schedule) {
      setAvailableTimeSlots([]);
      return;
    }

    const slots: string[] = [];
    const [startHour, startMinute] = schedule.start_time.split(':').map(Number);
    const [endHour, endMinute] = schedule.end_time.split(':').map(Number);

    let currentMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    // Generate slots with service duration + 10 min buffer
    const slotDuration = serviceDuration + 10;

    while (currentMinutes + serviceDuration <= endMinutes) {
      const hours = Math.floor(currentMinutes / 60);
      const minutes = currentMinutes % 60;
      const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const timeString = `${displayHour}:${minutes.toString().padStart(2, '0')} ${ampm}`;
      slots.push(timeString);
      currentMinutes += slotDuration;
    }

    setAvailableTimeSlots(slots);
  }, [selectedDate, barberAvailability, serviceDuration]);

  // Check if date should be disabled (past dates or barber not available)
  const isDateDisabled = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) return true;

    const dayOfWeek = date.getDay();
    const schedule = barberAvailability.find(
      (slot) => slot.day_of_week === dayOfWeek
    );

    return !schedule?.is_available;
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Date Selection */}
      <Card className="p-6">
        <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-[hsl(var(--accent))]" />
          Select Date
        </h3>
        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate || undefined}
            onSelect={(date) => date && onDateSelect(date)}
            disabled={isDateDisabled}
            className={cn("rounded-md border pointer-events-auto")}
          />
        </div>
      </Card>

      {/* Time Selection */}
      <Card className="p-6">
        <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-[hsl(var(--accent))]" />
          Select Time
        </h3>
        {!selectedDate ? (
          <div className="text-center py-12 text-muted-foreground">
            Please select a date first
          </div>
        ) : availableTimeSlots.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No available times for this date
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
            {availableTimeSlots.map((time) => (
              <button
                key={time}
                onClick={() => onTimeSelect(time)}
                className={cn(
                  "p-3 rounded-md border-2 font-medium transition-all duration-300",
                  selectedTime === time
                    ? "border-[hsl(var(--accent))] bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))] shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                    : "border-border hover:border-[hsl(var(--accent))]/50 hover:bg-[hsl(var(--accent))]/5"
                )}
              >
                {time}
              </button>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default DateTimePicker;
