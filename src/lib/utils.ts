import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime12h(time: string): string {
  const [hStr, mStr] = time.split(':');
  const h = Number(hStr);
  const m = Number(mStr || '0');
  const hour = ((h + 11) % 12) + 1;
  const suffix = h >= 12 ? 'PM' : 'AM';
  return `${hour}:${m.toString().padStart(2, '0')} ${suffix}`;
}

export interface BookingPriceCalculation {
  basePrice: number;
  baseRegularPrice: number;
  addonsTotal: number;
  addonsRegularTotal: number;
  subtotal: number;
  vipSavings: number;
}

export const calculateBookingTotal = (
  service: { regular_price: number; vip_price?: number | null } | null | undefined,
  addons: Array<{ regular_price: number; vip_price?: number | null }> = [],
  isVip: boolean = false
): BookingPriceCalculation => {
  if (!service) {
    return {
      basePrice: 0,
      baseRegularPrice: 0,
      addonsTotal: 0,
      addonsRegularTotal: 0,
      subtotal: 0,
      vipSavings: 0,
    };
  }

  const baseRegularPrice = service.regular_price;
  const basePrice = isVip && service.vip_price ? service.vip_price : service.regular_price;
  
  const addonsRegularTotal = addons.reduce((sum, addon) => sum + addon.regular_price, 0);
  const addonsTotal = addons.reduce((sum, addon) => {
    return sum + (isVip && addon.vip_price ? addon.vip_price : addon.regular_price);
  }, 0);
  
  const subtotal = basePrice + addonsTotal;
  const regularTotal = baseRegularPrice + addonsRegularTotal;
  const vipSavings = isVip ? regularTotal - subtotal : 0;
    
  return { 
    basePrice, 
    baseRegularPrice,
    addonsTotal, 
    addonsRegularTotal,
    subtotal, 
    vipSavings 
  };
};
