import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

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
}

const CustomerInfoForm = ({ onSubmit, initialData }: CustomerInfoFormProps) => {
  const { user } = useAuth();

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


  return (
    <Card className="max-w-2xl mx-auto p-4">      
      {user && (
        <div className="mb-3 p-2 bg-[hsl(var(--accent))]/10 border border-[hsl(var(--accent))]/30 rounded-md">
          <p className="text-xs">
            ✓ Logged in as <span className="font-semibold">{user.email}</span>
          </p>
        </div>
      )}

      <form id="customer-info-form" onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="full_name" className="text-sm">Full Name *</Label>
            <Input
              id="full_name"
              {...register('full_name')}
              placeholder="John Doe"
              className={errors.full_name ? 'border-destructive' : ''}
            />
            {errors.full_name && (
              <p className="text-xs text-destructive">{errors.full_name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-sm">Phone Number *</Label>
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
              <p className="text-xs text-destructive">{errors.phone.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm">Email *</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="john@example.com"
            disabled={!!user}
            className={errors.email ? 'border-destructive' : ''}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="notes" className="text-sm">Special Requests (Optional)</Label>
          <Textarea
            id="notes"
            {...register('notes')}
            placeholder="Any special requests or notes for your barber..."
            rows={3}
            className={errors.notes ? 'border-destructive' : ''}
          />
          {errors.notes && (
            <p className="text-xs text-destructive">{errors.notes.message}</p>
          )}
        </div>

        <button type="submit" className="hidden">Submit</button>
      </form>
    </Card>
  );
};

export default CustomerInfoForm;
