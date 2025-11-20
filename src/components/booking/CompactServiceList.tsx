import { useRef, useEffect } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Check } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  regular_price: number;
  vip_price?: number | null;
  duration_minutes: number;
  image_url?: string;
  description?: string;
}

interface CompactServiceListProps {
  services: Service[];
  addons: Service[];
  selectedServiceId: string | null;
  selectedAddonIds: string[];
  onServiceSelect: (serviceId: string) => void;
  onAddonToggle: (addonIds: string[]) => void;
  isVip?: boolean;
}

export const CompactServiceList = ({
  services,
  addons,
  selectedServiceId,
  selectedAddonIds,
  onServiceSelect,
  onAddonToggle,
  isVip = false,
}: CompactServiceListProps) => {
  const addonsRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Auto-scroll to add-ons section on mobile when a service is selected
  useEffect(() => {
    if (selectedServiceId && addons.length > 0 && isMobile && addonsRef.current) {
      setTimeout(() => {
        addonsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);
    }
  }, [selectedServiceId, addons.length, isMobile]);

  return (
    <div className="space-y-4">
      {/* Main Services - Text-Only Compact Layout */}
      <RadioGroup value={selectedServiceId ?? undefined} onValueChange={onServiceSelect}>
        <div className="space-y-3">
          {services.map((service) => {
            const price = isVip && service.vip_price ? service.vip_price : service.regular_price;
            const isSelected = selectedServiceId === service.id;
            
            return (
              <div key={service.id}>
                <RadioGroupItem
                  value={service.id}
                  id={service.id}
                  className="sr-only"
                />
                <Label
                  htmlFor={service.id}
                  className="cursor-pointer block"
                >
                  <div className={cn(
                    "p-3 border rounded-lg transition-all hover:border-[hsl(var(--accent))] hover:shadow-md",
                    isSelected && "border-[hsl(var(--accent))] bg-[hsl(var(--accent))]/5 shadow-md"
                  )}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm leading-tight truncate">{service.name}</h3>
                        {service.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {service.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-base font-bold text-[hsl(var(--accent))]">
                          ${price.toFixed(2)}
                        </span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {service.duration_minutes}min
                        </span>
                      </div>
                    </div>
                  </div>
                </Label>
              </div>
            );
          })}
        </div>
      </RadioGroup>

      {/* Add-ons Section - Simple Click Handler */}
      {selectedServiceId && addons.length > 0 && (
        <div ref={addonsRef} className="space-y-2">
          <h4 className="font-semibold text-xs text-muted-foreground uppercase">Add-ons (Optional)</h4>
          <div className="space-y-2">
            {addons.map((addon) => {
              const addonPrice = isVip && addon.vip_price ? addon.vip_price : addon.regular_price;
              const isSelected = selectedAddonIds.includes(addon.id);
              
              return (
                <div 
                  key={addon.id}
                  onClick={() => {
                    const newIds = isSelected
                      ? selectedAddonIds.filter(id => id !== addon.id)
                      : [...selectedAddonIds, addon.id];
                    onAddonToggle(newIds);
                  }}
                  className={cn(
                    "flex items-center gap-3 p-3 border rounded-lg transition-all cursor-pointer select-none",
                    "hover:border-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))]/10",
                    isSelected && "border-[hsl(var(--accent))] bg-[hsl(var(--accent))]/5 shadow-sm"
                  )}
                >
                  {/* Custom checkbox visual */}
                  <div className={cn(
                    "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all",
                    isSelected 
                      ? "bg-[hsl(var(--accent))] border-[hsl(var(--accent))]" 
                      : "border-muted-foreground/30"
                  )}>
                    {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                  </div>
                  
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-sm font-medium">{addon.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[hsl(var(--accent))]">
                        +${addonPrice.toFixed(2)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {addon.duration_minutes}min
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
