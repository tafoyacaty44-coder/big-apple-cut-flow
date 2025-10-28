import { Card } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { BarberWithDetails } from '@/lib/api/barbers';
import RealTimeAvailabilityBadges from './RealTimeAvailabilityBadges';

interface BarberCardProps {
  barber: any;
  selectedServiceName: string;
  selectedServicePrice: number;
  selectedServiceDuration: number;
  isSelected: boolean;
  onSelect: () => void;
}

const BarberCard = ({
  barber,
  selectedServiceName,
  selectedServicePrice,
  selectedServiceDuration,
  isSelected,
  onSelect,
}: BarberCardProps) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const totalSlots = barber.totalSlotsThisWeek || 0;
  const nextSlot = barber.nextAvailableSlot;
  
  const getStatusMessage = () => {
    if (totalSlots === 0) return 'Fully booked this week';
    if (nextSlot) {
      const date = new Date(nextSlot.date);
      const isToday = date.toDateString() === new Date().toDateString();
      return isToday 
        ? `Next: Today at ${nextSlot.time}`
        : `Next: ${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at ${nextSlot.time}`;
    }
    return `${totalSlots} slots available`;
  };

  const getStatusColor = () => {
    if (totalSlots === 0) return 'text-red-500';
    if (totalSlots < 5) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <Card
      onClick={onSelect}
      className={`cursor-pointer transition-all duration-300 ${
        isSelected
          ? 'border-[hsl(var(--accent))] border-2 shadow-[0_0_20px_rgba(212,175,55,0.3)]'
          : 'border-border border-2 hover:border-[hsl(var(--accent))]/50'
      }`}
    >
      <div className="p-6">
        {/* Profile Section */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-[hsl(var(--accent))]/20 flex items-center justify-center text-2xl font-bold text-[hsl(var(--accent))]">
            {barber.profile_image_url ? (
              <img
                src={barber.profile_image_url}
                alt={barber.full_name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              getInitials(barber.full_name)
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-xl mb-1">{barber.full_name}</h3>
            <p className="text-sm text-muted-foreground mb-1">
              {barber.years_experience} years experience
            </p>
            {barber.specialties && barber.specialties.length > 0 && (
              <p className="text-xs text-[hsl(var(--accent))]">
                {barber.specialties.join(' • ')}
              </p>
            )}
          </div>
          {isSelected && (
            <div className="w-8 h-8 rounded-full bg-[hsl(var(--accent))] flex items-center justify-center">
              <Check className="h-5 w-5 text-black" />
            </div>
          )}
        </div>

        {/* Service Info */}
        <div className="mb-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-sm font-semibold">{selectedServiceName}</p>
          <p className="text-xs text-muted-foreground">
            ${selectedServicePrice} • {selectedServiceDuration} min
          </p>
        </div>

        {/* Real-Time Weekly Availability */}
        {barber.realAvailability && barber.realAvailability.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2 text-center">Next 7 Days</p>
            <RealTimeAvailabilityBadges availability={barber.realAvailability} />
          </div>
        )}

        {/* Status Message */}
        <div className="p-3 bg-background/50 rounded-lg border border-border">
          <p className={`text-sm font-medium ${getStatusColor()}`}>
            {getStatusMessage()}
          </p>
        </div>

        {barber.bio && (
          <p className="text-xs text-muted-foreground mt-3">{barber.bio}</p>
        )}
      </div>
    </Card>
  );
};

export default BarberCard;
