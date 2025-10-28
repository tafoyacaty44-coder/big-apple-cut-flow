import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GoldButton } from '@/components/ui/gold-button';
import { format } from 'date-fns';
import { Loader2, Tag } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface BookingConfirmationProps {
  serviceName: string;
  servicePrice: number;
  serviceDuration: number;
  barberName: string;
  date: Date;
  time: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  onConfirm: (vipCode?: string) => void;
  isSubmitting: boolean;
  vipPrice?: number;
  vipCodeApplied?: boolean;
}

const BookingConfirmation = ({
  serviceName,
  servicePrice,
  serviceDuration,
  barberName,
  date,
  time,
  customerInfo,
  onConfirm,
  isSubmitting,
  vipPrice,
  vipCodeApplied = false,
}: BookingConfirmationProps) => {
  const [vipCode, setVipCode] = useState('');
  const [showVipInput, setShowVipInput] = useState(!vipCodeApplied);
  const { user } = useAuth();

  const displayPrice = vipCodeApplied && vipPrice ? vipPrice : servicePrice;
  const discount = vipCodeApplied && vipPrice ? servicePrice - vipPrice : 0;

  const handleConfirm = () => {
    onConfirm(vipCode || undefined);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">Confirm Your Appointment</h2>
        
        <div className="space-y-6">
          {/* Service Details */}
          <div className="border-b border-border pb-4">
            <h3 className="font-semibold text-lg mb-3">Service Details</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Service</p>
                <p className="font-semibold">{serviceName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-semibold">{serviceDuration} minutes</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground mb-2">Price</p>
                {vipCodeApplied && vipPrice ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground line-through">${servicePrice}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[hsl(var(--accent))]/20 text-[hsl(var(--accent))] font-semibold">
                        VIP
                      </span>
                    </div>
                    <p className="font-bold text-2xl text-green-600 dark:text-green-400">${displayPrice}</p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      ✓ You save ${discount.toFixed(2)}
                    </p>
                  </div>
                ) : (
                  <p className="font-semibold text-xl">${displayPrice}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Barber</p>
                <p className="font-semibold">{barberName}</p>
              </div>
            </div>
          </div>

          {/* Appointment Date & Time */}
          <div className="border-b border-border pb-4">
            <h3 className="font-semibold text-lg mb-3">Date & Time</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-semibold">{format(date, 'EEEE, MMMM d, yyyy')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Time</p>
                <p className="font-semibold">{time}</p>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="border-b border-border pb-4">
            <h3 className="font-semibold text-lg mb-3">Your Information</h3>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-semibold">{customerInfo.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-semibold">{customerInfo.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-semibold">{customerInfo.phone}</p>
              </div>
            </div>
            {user && (
              <div className="mt-3 p-2 bg-[hsl(var(--accent))]/10 border border-[hsl(var(--accent))]/30 rounded text-sm">
                ✓ Booking as registered user
              </div>
            )}
          </div>

          {/* VIP Code Section */}
          {!vipCodeApplied && (
            <div>
              {!showVipInput ? (
                <button
                  onClick={() => setShowVipInput(true)}
                  className="text-[hsl(var(--accent))] hover:underline text-sm font-medium flex items-center gap-2"
                >
                  <Tag className="h-4 w-4" />
                  Have a VIP code?
                </button>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="vipCode" className="text-[hsl(var(--accent))]">
                    VIP Code (Optional)
                  </Label>
                  <Input
                    id="vipCode"
                    value={vipCode}
                    onChange={(e) => setVipCode(e.target.value.toUpperCase())}
                    placeholder="Enter your VIP code"
                    className="max-w-xs"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter your VIP code to receive discounted pricing
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Confirmation Button */}
      <div className="flex justify-center">
        <GoldButton
          size="lg"
          onClick={handleConfirm}
          disabled={isSubmitting}
          className="min-w-[200px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Confirming...
            </>
          ) : (
            'Confirm Booking'
          )}
        </GoldButton>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        By confirming, you agree to our terms and conditions
      </p>
    </div>
  );
};

export default BookingConfirmation;
