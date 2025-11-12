import { Card } from '@/components/ui/card';
import { GoldButton } from '@/components/ui/gold-button';
import { WeeklyAvailabilityIndicator } from './WeeklyAvailabilityIndicator';

interface BarberCardProps {
  barber: any;
  selectedServiceName: string;
  selectedServicePrice: number;
  selectedServiceDuration: number;
  isSelected: boolean;
  onSelect: () => void;
  compact?: boolean;
}

const BarberCard = ({
  barber,
  selectedServiceName,
  selectedServicePrice,
  selectedServiceDuration,
  isSelected,
  onSelect,
  compact = false,
}: BarberCardProps) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  if (compact) {
    // Compact horizontal row layout
    return (
      <div
        className={`flex items-center gap-4 p-3 rounded-lg border-2 transition-all ${
          isSelected
            ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent))]/5'
            : 'border-border hover:bg-muted/50'
        }`}
      >
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-[hsl(var(--accent))]/20 flex items-center justify-center text-lg font-bold text-[hsl(var(--accent))] flex-shrink-0">
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

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base mb-0.5 truncate">{barber.full_name}</h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{barber.years_experience} yrs exp</span>
            {barber.specialties && barber.specialties.length > 0 && (
              <>
                <span>•</span>
                <span className="truncate">{barber.specialties.join(', ')}</span>
              </>
            )}
          </div>
        </div>

        {/* Weekly Availability */}
        <div className="flex-shrink-0">
          <WeeklyAvailabilityIndicator barberId={barber.id} />
        </div>

        {/* Select Button */}
        <GoldButton 
          onClick={onSelect}
          size="sm"
          variant={isSelected ? "default" : "outline"}
          className="flex-shrink-0"
        >
          {isSelected ? "Selected" : "Select"}
        </GoldButton>
      </div>
    );
  }

  // Original vertical card layout (fallback)
  return (
    <Card
      className={`transition-all duration-300 ${
        isSelected
          ? 'border-[hsl(var(--accent))] border-2 shadow-[0_0_20px_rgba(212,175,55,0.3)]'
          : 'border-border border-2'
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
        </div>

        {/* Service Info */}
        <div className="mb-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-sm font-semibold">{selectedServiceName}</p>
          <p className="text-xs text-muted-foreground">
            ${selectedServicePrice} • {selectedServiceDuration} min
          </p>
        </div>

        {barber.bio && (
          <p className="text-xs text-muted-foreground mb-4">{barber.bio}</p>
        )}

        {/* Select Button */}
        <GoldButton 
          onClick={onSelect}
          className="w-full"
          variant={isSelected ? "default" : "outline"}
        >
          {isSelected ? "Selected" : "Select Barber"}
        </GoldButton>
      </div>
    </Card>
  );
};

export default BarberCard;
