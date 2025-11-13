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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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

      {/* Add-ons - Compact Checkboxes */}
      {selectedServiceId && addons.length > 0 && (
        <div className="mt-3 pt-3 border-t">
          <h3 className="font-semibold text-xs mb-2 text-muted-foreground uppercase">Add-ons (Optional)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {addons.map((addon) => {
              const price = isVip && addon.vip_price ? addon.vip_price : addon.regular_price;
              const isSelected = selectedAddonIds.includes(addon.id);
              
              return (
                <div key={addon.id} className={cn(
                  "flex items-center gap-2 p-2 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer",
                  isSelected && "border-[hsl(var(--accent))] bg-[hsl(var(--accent))]/5"
                )}>
                  <Checkbox
                    id={addon.id}
                    checked={isSelected}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        onAddonToggle([...selectedAddonIds, addon.id]);
                      } else {
                        onAddonToggle(selectedAddonIds.filter(id => id !== addon.id));
                      }
                    }}
                  />
                  <Label
                    htmlFor={addon.id}
                    className="flex-1 cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-xs truncate">{addon.name}</div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <span className="font-bold text-xs text-[hsl(var(--accent))]">
                        +${price.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
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
};
