import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Crown, Tag } from 'lucide-react';
import { validatePromoCode } from '@/lib/api/promo-codes';

const customerInfoSchema = z.object({
  full_name: z.string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: z.string()
    .trim()
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),
  phone: z.string()
    .trim()
    .refine(
      (val) => val.replace(/\D/g, '').length === 10,
      'Please enter a valid 10-digit phone number'
    ),
  notes: z.string()
    .max(500, 'Notes must be less than 500 characters')
    .optional(),
});

type CustomerInfoFormData = z.infer<typeof customerInfoSchema>;

interface CustomerInfoFormProps {
  onSubmit: (data: CustomerInfoFormData) => void;
  initialData?: CustomerInfoFormData | null;
  onVipCodeChange?: (code: string, isValid: boolean) => void;
  onPromoCodeChange?: (code: string, discount: number, campaignId?: string) => void;
  selectedServiceId?: string;
  promoDiscount?: number;
}

const CustomerInfoForm = ({ onSubmit, initialData, onVipCodeChange, onPromoCodeChange, selectedServiceId, promoDiscount = 0 }: CustomerInfoFormProps) => {
  const { user } = useAuth();
  const [vipCode, setVipCode] = useState('');
  const [vipCodeValid, setVipCodeValid] = useState(false);
  const [vipCodeChecking, setVipCodeChecking] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoCodeValid, setPromoCodeValid] = useState(false);
  const [promoCodeChecking, setPromoCodeChecking] = useState(false);
  const [promoError, setPromoError] = useState('');

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CustomerInfoFormData>({
    resolver: zodResolver(customerInfoSchema),
    defaultValues: initialData || undefined,
  });

  useEffect(() => {
    if (user && profile) {
      setValue('full_name', profile.full_name || '');
      setValue('email', user.email || '');
      setValue('phone', profile.phone || '');
    } else if (initialData) {
      setValue('full_name', initialData.full_name);
      setValue('email', initialData.email);
      setValue('phone', initialData.phone);
      setValue('notes', initialData.notes || '');
    }
  }, [user, profile, initialData, setValue]);

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };

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
      <h2 className="text-2xl font-bold mb-6">Your Information</h2>
      
      {user && (
        <div className="mb-4 p-3 bg-[hsl(var(--accent))]/10 border border-[hsl(var(--accent))]/30 rounded-md">
          <p className="text-sm">
            ✓ Logged in as <span className="font-semibold">{user.email}</span>
          </p>
        </div>
      )}

      <form id="customer-info-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="full_name">Full Name *</Label>
          <Input
            id="full_name"
            {...register('full_name')}
            placeholder="John Doe"
            className={errors.full_name ? 'border-destructive' : ''}
          />
          {errors.full_name && (
            <p className="text-sm text-destructive">{errors.full_name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="john@example.com"
            disabled={!!user}
            className={errors.email ? 'border-destructive' : ''}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            type="tel"
            {...register('phone')}
            placeholder="(555) 123-4567"
            onChange={(e) => {
              const formatted = formatPhoneNumber(e.target.value);
              e.target.value = formatted;
            }}
            className={errors.phone ? 'border-destructive' : ''}
          />
          {errors.phone && (
            <p className="text-sm text-destructive">{errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Special Requests (Optional)</Label>
          <Textarea
            id="notes"
            {...register('notes')}
            placeholder="Any special requests or notes for your barber..."
            rows={4}
            className={errors.notes ? 'border-destructive' : ''}
          />
          {errors.notes && (
            <p className="text-sm text-destructive">{errors.notes.message}</p>
          )}
        </div>

        {/* VIP Code Section */}
        <div className="mt-6 p-4 border-2 border-dashed border-[hsl(var(--accent))]/30 rounded-lg bg-[hsl(var(--accent))]/5">
          <div className="flex items-center gap-2 mb-3">
            <Crown className="h-5 w-5 text-[hsl(var(--accent))]" />
            <Label htmlFor="vip-code" className="text-base font-semibold">VIP Code (Optional)</Label>
          </div>
          <div className="flex gap-2">
            <Input
              id="vip-code"
              placeholder="Enter VIP code"
              value={vipCode}
              onChange={(e) => {
                setVipCode(e.target.value);
                setVipCodeValid(false);
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
          {vipCode.trim() && !vipCodeValid && !vipCodeChecking && (
            <p className="text-sm text-destructive mt-2">Invalid VIP code</p>
          )}
        </div>

        {/* Promo Code Section */}
        <div className="mt-4 p-4 border-2 border-dashed border-primary/30 rounded-lg bg-primary/5">
          <div className="flex items-center gap-2 mb-3">
            <Tag className="h-5 w-5 text-primary" />
            <Label htmlFor="promo-code" className="text-base font-semibold">Promo Code (Optional)</Label>
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

        <button type="submit" className="hidden">Submit</button>
      </form>
    </Card>
  );
};

export default CustomerInfoForm;
