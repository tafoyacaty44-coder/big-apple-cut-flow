import { Card } from '@/components/ui/card';
import { GoldButton } from '@/components/ui/gold-button';
import { WeeklyAvailabilityIndicator } from './WeeklyAvailabilityIndicator';
import { useState } from 'react';
import { BarberDetailsDialog } from './BarberDetailsDialog';

interface SimplifiedBarberCardProps {
  barber: any;
  selectedServiceName: string;
  selectedServicePrice: number;
  isSelected: boolean;
  onSelect: () => void;
}

export const SimplifiedBarberCard = ({
  barber,
  selectedServiceName,
  selectedServicePrice,
  isSelected,
  onSelect,
}: SimplifiedBarberCardProps) => {
  const [showDetails, setShowDetails] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };


  return (
    <Card
      className={`transition-all duration-300 ${
        isSelected
          ? 'border-[hsl(var(--accent))] border-2 shadow-[0_0_20px_rgba(212,175,55,0.3)]'
          : 'border-border hover:border-[hsl(var(--accent))]/30'
      }`}
    >
      <div className="p-3">
        <div className="flex items-start gap-4">
          {/* Circular Profile Photo */}
          <div 
            className="w-16 h-16 rounded-full bg-[hsl(var(--accent))]/20 flex items-center justify-center text-xl font-bold text-[hsl(var(--accent))] flex-shrink-0 overflow-hidden cursor-pointer hover:ring-2 hover:ring-[hsl(var(--accent))] transition-all"
            onClick={() => setShowDetails(true)}
            role="button"
            aria-label="View barber details"
          >
            {barber.profile_image_url ? (
              <img
                src={barber.profile_image_url}
                alt={barber.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              getInitials(barber.full_name)
            )}
          </div>

          {/* Info Section */}
          <div className="flex-1 min-w-0 space-y-1.5">
            {/* Name and Price Row */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-base leading-tight mb-0.5">{barber.full_name}</h3>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  {barber.years_experience} yrs exp
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs font-semibold leading-tight">{selectedServiceName}</p>
                <p className="text-base font-bold text-[hsl(var(--accent))] leading-tight">
                  ${selectedServicePrice}
                </p>
              </div>
            </div>

            {/* Weekly Availability Dots */}
            <div>
              <WeeklyAvailabilityIndicator barberId={barber.id} />
            </div>

            {/* Notes (if any) */}
            {barber.notes && (
              <p className="text-[10px] text-muted-foreground italic leading-snug">
                "{barber.notes}"
              </p>
            )}

            {/* Status Message + Continue Button */}
            <div className="flex items-center gap-2 pt-1">
              {barber.status_message && (
                <div className="flex-1 px-2 py-1.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded">
                  <p className="text-[10px] text-amber-700 dark:text-amber-400 italic leading-snug">
                    {barber.status_message}
                  </p>
                </div>
              )}
              <GoldButton
                onClick={onSelect}
                size="sm"
                variant={isSelected ? 'default' : 'outline'}
                className="flex-shrink-0 px-4 py-1.5 text-xs"
              >
                {isSelected ? 'Selected' : 'Select'}
              </GoldButton>
            </div>
          </div>
        </div>
      </div>

      {/* Barber Details Dialog */}
      <BarberDetailsDialog 
        barber={{
          id: barber.id,
          full_name: barber.full_name,
          profile_image_url: barber.profile_image_url,
          years_experience: barber.years_experience,
          specialties: barber.specialties
        }}
        open={showDetails}
        onOpenChange={setShowDetails}
      />
    </Card>
  );
};
