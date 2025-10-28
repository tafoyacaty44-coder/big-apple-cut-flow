import { cn } from '@/lib/utils';

interface RealTimeAvailabilityBadgesProps {
  availability: Array<{ date: string; time_slots: string[] }>;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const RealTimeAvailabilityBadges = ({ availability }: RealTimeAvailabilityBadgesProps) => {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  return (
    <div className="flex gap-2 justify-center">
      {availability.slice(0, 7).map((day, index) => {
        const dayDate = new Date(day.date);
        const dayOfWeek = dayDate.getDay();
        const isToday = day.date === todayStr;
        const slotCount = day.time_slots.length;

        return (
          <div
            key={day.date}
            className="relative group"
          >
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                isToday && "ring-2 ring-[hsl(var(--accent))] ring-offset-2",
                slotCount > 0
                  ? "bg-green-500 text-white"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {slotCount > 0 ? slotCount : '—'}
            </div>
            <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-background border border-border rounded-lg px-3 py-2 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 shadow-lg">
              <div className="font-bold">{DAYS[dayOfWeek]}</div>
              <div className="text-muted-foreground">
                {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
              <div className="text-foreground mt-1">
                {slotCount > 0 ? `${slotCount} slots available` : 'Fully booked'}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RealTimeAvailabilityBadges;
