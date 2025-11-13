import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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
  return (
    <div className="space-y-3">
      {/* Main Services - Text-Only Compact Layout */}
      <RadioGroup value={selectedServiceId || undefined} onValueChange={onServiceSelect}>
        <div className="space-y-3">
          {services.map((service) => {
            const price = isVip && service.vip_price ? service.vip_price : service.regular_price;
            const isSelected = selectedServiceId === service.id;
            
            return (
              <div key={service.id} className="space-y-2">
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

                {/* Add-ons appear directly below selected service */}
                {isSelected && addons.length > 0 && (
                  <div className="ml-2 pl-3 border-l-2 border-[hsl(var(--accent))]/30 space-y-2">
                    <h4 className="font-semibold text-xs text-muted-foreground uppercase">Add-ons (Optional)</h4>
                    <div className="space-y-2">
                      {addons.map((addon) => {
                        const addonPrice = isVip && addon.vip_price ? addon.vip_price : addon.regular_price;
                        const isAddonSelected = selectedAddonIds.includes(addon.id);
                        
                        return (
                          <div key={addon.id} className={cn(
                            "flex items-center gap-2 p-2 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer",
                            isAddonSelected && "border-[hsl(var(--accent))] bg-[hsl(var(--accent))]/5"
                          )}>
                            <Checkbox
                              id={addon.id}
                              checked={isAddonSelected}
                              onCheckedChange={(checked) => {
                                const newAddonIds = checked
                                  ? [...selectedAddonIds, addon.id]
                                  : selectedAddonIds.filter((id) => id !== addon.id);
                                onAddonToggle(newAddonIds);
                              }}
                            />
                            <Label
                              htmlFor={addon.id}
                              className="flex-1 cursor-pointer flex items-center justify-between"
                            >
                              <span className="text-sm font-medium">{addon.name}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-[hsl(var(--accent))]">
                                  +${addonPrice.toFixed(2)}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {addon.duration_minutes}min
                                </span>
                              </div>
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </RadioGroup>
    </div>
  );
};
