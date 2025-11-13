import { Card } from '@/components/ui/card';
import { GoldButton } from '@/components/ui/gold-button';
import { WeeklyAvailabilityIndicator } from './WeeklyAvailabilityIndicator';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

interface SimplifiedBarberCardProps {
  barber: any;
  selectedServiceName: string;
  selectedServicePrice: number;
  isSelected: boolean;
  onSelect: () => void;
  onVipCodeChange?: (code: string) => void;
}

export const SimplifiedBarberCard = ({
  barber,
  selectedServiceName,
  selectedServicePrice,
  isSelected,
  onSelect,
  onVipCodeChange,
}: SimplifiedBarberCardProps) => {
  const [vipCode, setVipCode] = useState('');

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const handleVipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value;
    setVipCode(code);
    onVipCodeChange?.(code);
  };

  return (
    <Card
      className={`transition-all duration-300 ${
        isSelected
          ? 'border-[hsl(var(--accent))] border-2 shadow-[0_0_20px_rgba(212,175,55,0.3)]'
          : 'border-border hover:border-[hsl(var(--accent))]/30'
      }`}
    >
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Circular Profile Photo */}
          <div className="w-20 h-20 rounded-full bg-[hsl(var(--accent))]/20 flex items-center justify-center text-2xl font-bold text-[hsl(var(--accent))] flex-shrink-0 overflow-hidden">
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
          <div className="flex-1 min-w-0 space-y-2">
            {/* Name and Price Row */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-lg mb-0.5">{barber.full_name}</h3>
                <p className="text-xs text-muted-foreground">
                  {barber.years_experience} yrs exp
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-semibold">{selectedServiceName}</p>
                <p className="text-lg font-bold text-[hsl(var(--accent))]">
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
              <p className="text-xs text-muted-foreground italic leading-relaxed">
                "{barber.notes}"
              </p>
            )}

            {/* VIP Code + Continue Button */}
            <div className="flex items-center gap-2 pt-1">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="VIP Code (Optional)"
                  value={vipCode}
                  onChange={handleVipCodeChange}
                  className="h-9 text-sm"
                />
              </div>
              <GoldButton
                onClick={onSelect}
                size="sm"
                variant={isSelected ? 'default' : 'outline'}
                className="flex-shrink-0 px-6"
              >
                {isSelected ? 'Selected' : 'Select'}
              </GoldButton>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
