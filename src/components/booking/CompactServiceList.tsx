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
  serviceImages: Record<string, string>;
  isVip?: boolean;
}

export const CompactServiceList = ({
  services,
  addons,
  selectedServiceId,
  selectedAddonIds,
  onServiceSelect,
  onAddonToggle,
  serviceImages,
  isVip = false,
}: CompactServiceListProps) => {
  return (
    <div className="space-y-3">
      {/* Main Services - Compact 4-column Grid */}
      <RadioGroup value={selectedServiceId || undefined} onValueChange={onServiceSelect}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {services.map((service) => {
            const price = isVip && service.vip_price ? service.vip_price : service.regular_price;
            
            return (
              <div key={service.id}>
                <RadioGroupItem
                  value={service.id}
                  id={service.id}
                  className="sr-only"
                />
                <Label
                  htmlFor={service.id}
                  className={cn(
                    "cursor-pointer block",
                    selectedServiceId === service.id && "ring-2 ring-[hsl(var(--accent))] ring-offset-2"
                  )}
                >
                  <Card className={cn(
                    "overflow-hidden transition-all hover:shadow-lg h-full",
                    selectedServiceId === service.id && "border-[hsl(var(--accent))] shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                  )}>
                    <div className="aspect-square relative overflow-hidden">
                      <img
                        src={service.image_url}
                        alt={service.name}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <CardContent className="p-2 space-y-0.5">
                      <h3 className="font-semibold text-xs leading-tight">{service.name}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-[hsl(var(--accent))]">
                          ${price.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {service.duration_minutes}m
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Label>
              </div>
            );
          })}
        </div>
      </RadioGroup>

      {/* Add-ons - Compact Horizontal Checkboxes */}
      {selectedServiceId && addons.length > 0 && (
        <div className="mt-3 pt-3 border-t">
          <h3 className="font-bold text-sm mb-2">Add-ons (Optional)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {addons.map((addon) => {
              const price = isVip && addon.vip_price ? addon.vip_price : addon.regular_price;
              const isSelected = selectedAddonIds.includes(addon.id);
              
              return (
                <div key={addon.id} className="flex items-center gap-2 p-2 border rounded-lg hover:bg-muted/50 transition-colors">
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
                      <div className="font-semibold text-xs">{addon.name}</div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <span className="font-bold text-xs text-[hsl(var(--accent))]">
                        +${price.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {addon.duration_minutes}m
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
