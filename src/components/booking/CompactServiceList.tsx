import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { AspectRatio } from '@/components/ui/aspect-ratio';

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
  return (
    <div className="space-y-3">
      {/* Main Services */}
      <RadioGroup value={selectedServiceId || ''} onValueChange={onServiceSelect}>
        <div className="space-y-2">
          {services.map((service) => {
            const isSelected = selectedServiceId === service.id;
            const price = isVip && service.vip_price ? service.vip_price : service.regular_price;
            const showVipSavings = isVip && service.vip_price && service.vip_price < service.regular_price;

            return (
              <div key={service.id}>
                <label
                  htmlFor={`service-${service.id}`}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all hover:bg-muted/50",
                    isSelected
                      ? "border-[hsl(var(--accent))] bg-[hsl(var(--accent))]/5"
                      : "border-border"
                  )}
                >
                  {/* Thumbnail Image */}
                  <div className="w-20 h-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
                    {serviceImages[service.name] ? (
                      <img
                        src={serviceImages[service.name]}
                        alt={service.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                        No image
                      </div>
                    )}
                  </div>

                  {/* Service Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base mb-0.5 truncate">
                          {service.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">
                            ${price.toFixed(2)}
                          </span>
                          <span>•</span>
                          <span>{service.duration_minutes} min</span>
                        </div>
                        {showVipSavings && (
                          <div className="text-xs text-[hsl(var(--accent))] mt-0.5">
                            VIP Save ${(service.regular_price - service.vip_price!).toFixed(2)}
                          </div>
                        )}
                      </div>

                      {/* Radio Button */}
                      <RadioGroupItem
                        value={service.id}
                        id={`service-${service.id}`}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </label>

                {/* Add-ons (show when service is selected) */}
                {isSelected && addons.length > 0 && (
                  <div className="ml-6 mt-2 space-y-2 pl-6 border-l-2 border-[hsl(var(--accent))]/30">
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Add-ons (optional)
                    </p>
                    {addons.map((addon) => {
                      const addonPrice = isVip && addon.vip_price ? addon.vip_price : addon.regular_price;
                      const showAddonVipSavings = isVip && addon.vip_price && addon.vip_price < addon.regular_price;

                      return (
                        <label
                          key={addon.id}
                          htmlFor={`addon-${addon.id}`}
                          className={cn(
                            "flex items-center gap-3 p-2 rounded-md border cursor-pointer transition-all hover:bg-muted/50",
                            selectedAddonIds.includes(addon.id)
                              ? "border-[hsl(var(--accent))]/50 bg-[hsl(var(--accent))]/5"
                              : "border-border/50"
                          )}
                        >
                          <Checkbox
                            id={`addon-${addon.id}`}
                            checked={selectedAddonIds.includes(addon.id)}
                            onCheckedChange={() => onAddonToggle(addon.id)}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-medium truncate">
                                {addon.name}
                              </span>
                              <div className="flex items-center gap-2 text-sm flex-shrink-0">
                                <span className="font-medium">
                                  +${addonPrice.toFixed(2)}
                                </span>
                                <span className="text-muted-foreground">
                                  +{addon.duration_minutes}min
                                </span>
                              </div>
                            </div>
                            {showAddonVipSavings && (
                              <div className="text-xs text-[hsl(var(--accent))] mt-0.5">
                                VIP Save ${(addon.regular_price - addon.vip_price!).toFixed(2)}
                              </div>
                            )}
                          </div>
                        </label>
                      );
                    })}
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
