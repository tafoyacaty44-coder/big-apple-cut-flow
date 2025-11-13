import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Crown, Tag } from 'lucide-react';
import { validatePromoCode } from '@/lib/api/promo-codes';

interface DiscountCodesFormProps {
  onVipCodeChange?: (code: string, isValid: boolean) => void;
  onPromoCodeChange?: (code: string, discount: number, campaignId?: string) => void;
  selectedServiceId?: string;
  promoDiscount?: number;
}

const DiscountCodesForm = ({ 
  onVipCodeChange, 
  onPromoCodeChange, 
  selectedServiceId, 
  promoDiscount = 0 
}: DiscountCodesFormProps) => {
  const [vipCode, setVipCode] = useState('');
  const [vipCodeValid, setVipCodeValid] = useState(false);
  const [vipCodeChecking, setVipCodeChecking] = useState(false);
  const [vipCodeAttempted, setVipCodeAttempted] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoCodeValid, setPromoCodeValid] = useState(false);
  const [promoCodeChecking, setPromoCodeChecking] = useState(false);
  const [promoError, setPromoError] = useState('');

  const { data: serviceData } = useQuery({
    queryKey: ['service', selectedServiceId],
    queryFn: async () => {
      if (!selectedServiceId) return null;
      const { data, error } = await supabase
        .from('services')
        .select('regular_price, vip_price')
        .eq('id', selectedServiceId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!selectedServiceId,
  });

  const handleValidateVipCode = async () => {
    if (!vipCode.trim()) return;
    
    setVipCodeChecking(true);
    setVipCodeAttempted(true);
    try {
      const { data: settings, error } = await supabase
        .from('vip_settings')
        .select('enabled, vip_code')
        .eq('id', 1)
        .single();

      if (error) throw error;

      const isValid = settings?.enabled && settings.vip_code === vipCode.trim();
      setVipCodeValid(isValid);
      
      if (onVipCodeChange) {
        onVipCodeChange(vipCode.trim(), isValid);
      }
    } catch (error) {
      setVipCodeValid(false);
      if (onVipCodeChange) {
        onVipCodeChange('', false);
      }
    } finally {
      setVipCodeChecking(false);
    }
  };

  const handleValidatePromoCode = async () => {
    if (!promoCode.trim()) return;
    
    setPromoCodeChecking(true);
    setPromoError('');
    try {
      const result = await validatePromoCode(promoCode.trim());
      
      if (result.valid) {
        setPromoCodeValid(true);
        if (onPromoCodeChange) {
          onPromoCodeChange(promoCode.trim(), result.discount, result.campaign_id);
        }
      } else {
        setPromoCodeValid(false);
        setPromoError(result.error || 'Invalid promo code');
        if (onPromoCodeChange) {
          onPromoCodeChange('', 0);
        }
      }
    } catch (error) {
      setPromoCodeValid(false);
      setPromoError('Failed to validate code');
      if (onPromoCodeChange) {
        onPromoCodeChange('', 0);
      }
    } finally {
      setPromoCodeChecking(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-2">Optional Discount Codes</h2>
      <p className="text-muted-foreground mb-6">Have a VIP or promo code? Apply it here for savings!</p>
      
      <div className="space-y-4">
        {/* VIP Code Section */}
        <div className="p-4 border-2 border-dashed border-[hsl(var(--accent))]/30 rounded-lg bg-[hsl(var(--accent))]/5">
          <div className="flex items-center gap-2 mb-3">
            <Crown className="h-5 w-5 text-[hsl(var(--accent))]" />
            <Label htmlFor="vip-code" className="text-base font-semibold">VIP Code</Label>
          </div>
          <div className="flex gap-2">
            <Input
              id="vip-code"
              placeholder="Enter VIP code"
              value={vipCode}
              onChange={(e) => {
                setVipCode(e.target.value);
                setVipCodeValid(false);
                setVipCodeAttempted(false);
                if (onVipCodeChange) {
                  onVipCodeChange('', false);
                }
              }}
              className="flex-1"
            />
            <Button 
              type="button"
              onClick={handleValidateVipCode}
              disabled={!vipCode.trim() || vipCodeChecking}
              className="bg-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))]/90 text-black"
            >
              {vipCodeChecking ? 'Checking...' : 'Apply'}
            </Button>
          </div>
          {vipCodeValid && serviceData && (
            <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-md">
              <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                ✓ VIP pricing applied! Save ${(serviceData.regular_price - serviceData.vip_price).toFixed(2)}
              </p>
            </div>
          )}
          {vipCode.trim() && !vipCodeValid && vipCodeAttempted && !vipCodeChecking && (
            <p className="text-sm text-destructive mt-2">Invalid VIP code</p>
          )}
        </div>

        {/* Promo Code Section */}
        <div className="p-4 border-2 border-dashed border-primary/30 rounded-lg bg-primary/5">
          <div className="flex items-center gap-2 mb-3">
            <Tag className="h-5 w-5 text-primary" />
            <Label htmlFor="promo-code" className="text-base font-semibold">Promo Code</Label>
          </div>
          <div className="flex gap-2">
            <Input
              id="promo-code"
              placeholder="Enter promo code"
              value={promoCode}
              onChange={(e) => {
                setPromoCode(e.target.value.toUpperCase());
                setPromoCodeValid(false);
                setPromoError('');
                if (onPromoCodeChange) {
                  onPromoCodeChange('', 0);
                }
              }}
              className="flex-1"
            />
            <Button 
              type="button"
              onClick={handleValidatePromoCode}
              disabled={!promoCode.trim() || promoCodeChecking}
              variant="outline"
            >
              {promoCodeChecking ? 'Checking...' : 'Apply'}
            </Button>
          </div>
          {promoCodeValid && serviceData && (
            <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-md">
              <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                ✓ Promo code applied! Save {promoDiscount}% (${((serviceData.regular_price * promoDiscount) / 100).toFixed(2)} off)
              </p>
            </div>
          )}
          {promoError && (
            <p className="text-sm text-destructive mt-2">{promoError}</p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default DiscountCodesForm;
