import { BarberAvailability } from '@/lib/api/barbers';

interface WeeklyAvailabilityBadgesProps {
  availability: BarberAvailability[];
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const WeeklyAvailabilityBadges = ({ availability }: WeeklyAvailabilityBadgesProps) => {
  const availabilityMap = availability.reduce((acc, slot) => {
    acc[slot.day_of_week] = slot;
    return acc;
  }, {} as Record<number, BarberAvailability>);

  const formatTime = (time: string) => {
    if (!time || time === '00:00:00') return 'Closed';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="flex gap-2 justify-center">
      {DAYS.map((day, index) => {
        const slot = availabilityMap[index];
        const isAvailable = slot?.is_available || false;
        const hours = slot ? `${formatTime(slot.start_time)} - ${formatTime(slot.end_time)}` : 'Not Set';

        return (
          <div
            key={index}
            className="relative group"
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                isAvailable
                  ? 'bg-green-500 text-white'
                  : 'bg-red-500 text-white'
              }`}
            >
              {day}
            </div>
            <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-background border border-border rounded-lg px-3 py-2 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 shadow-lg">
              <div className="font-bold">{day}</div>
              <div className="text-muted-foreground">{hours}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WeeklyAvailabilityBadges;
