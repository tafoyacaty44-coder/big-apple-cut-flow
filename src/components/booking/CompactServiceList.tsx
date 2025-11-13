import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup } from '@/components/ui/radio-group';

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
  onAddonToggle: (addonId: string) => void;
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
  const selectedService = services.find((s) => s.id === selectedServiceId);

  return (
    <div className="space-y-4">
      {/* Main Services - Square Grid */}
      <RadioGroup value={selectedServiceId || ''} onValueChange={onServiceSelect}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {services.map((service) => {
            const isSelected = service.id === selectedServiceId;
            const imageUrl = serviceImages[service.name as keyof typeof serviceImages];
            const price = isVip && service.vip_price ? service.vip_price : service.regular_price;
            const regularPrice = service.regular_price;
            const hasSavings = isVip && service.vip_price && service.vip_price < service.regular_price;

            return (
              <div
                key={service.id}
                className={`
                  relative flex flex-col items-center p-3 rounded-lg border-2 transition-all cursor-pointer group
                  ${
                    isSelected
                      ? 'border-[hsl(var(--accent))] shadow-[0_0_20px_rgba(212,175,55,0.3)]'
                      : 'border-border hover:border-[hsl(var(--accent))]/40 hover:shadow-md'
                  }
                `}
                onClick={() => onServiceSelect(service.id)}
              >
                {/* Square Image */}
                {imageUrl && (
                  <div className="w-full aspect-square rounded-md overflow-hidden bg-muted mb-2">
                    <img
                      src={imageUrl}
                      alt={service.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Service Name */}
                <h3 className="font-bold text-sm text-center mb-1 line-clamp-2 w-full">
                  {service.name}
                </h3>

                {/* Price */}
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <span className="font-bold text-base text-[hsl(var(--accent))]">
                    ${price}
                  </span>
                  {hasSavings && (
                    <span className="line-through text-xs text-muted-foreground/60">
                      ${regularPrice}
                    </span>
                  )}
                </div>

                {/* Duration */}
                <p className="text-xs text-muted-foreground mb-2">
                  {service.duration_minutes} min
                </p>

                {/* Radio Indicator */}
                <div
                  className={`w-6 h-6 rounded-full border-2 transition-all ${
                    isSelected
                      ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent))]'
                      : 'border-border group-hover:border-[hsl(var(--accent))]/50'
                  }`}
                >
                  {isSelected && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-[hsl(var(--accent-foreground))]" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </RadioGroup>

      {/* Add-ons (shown below grid when service is selected) */}
      {selectedService && addons.length > 0 && (
        <div className="pt-3 border-t space-y-3">
          <h3 className="font-semibold text-sm">Add-ons (Optional)</h3>
          <div className="flex flex-wrap gap-3">
            {addons.map((addon) => {
              const isChecked = selectedAddonIds.includes(addon.id);
              const addonPrice = isVip && addon.vip_price ? addon.vip_price : addon.regular_price;
              const addonRegularPrice = addon.regular_price;
              const addonHasSavings = isVip && addon.vip_price && addon.vip_price < addon.regular_price;

              return (
                <label
                  key={addon.id}
                  className={`
                    inline-flex items-center gap-2 px-3 py-2 rounded-md border transition-all cursor-pointer
                    ${
                      isChecked
                        ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent))]/5'
                        : 'border-border hover:bg-muted/30'
                    }
                  `}
                >
                  <Checkbox 
                    checked={isChecked}
                    onCheckedChange={() => onAddonToggle(addon.id)}
                  />
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">{addon.name}</span>
                    <span className="font-semibold text-[hsl(var(--accent))]">
                      +${addonPrice}
                    </span>
                    {addonHasSavings && (
                      <span className="line-through text-xs text-muted-foreground/60">
                        ${addonRegularPrice}
                      </span>
                    )}
                    <span className="text-muted-foreground">• +{addon.duration_minutes} min</span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
