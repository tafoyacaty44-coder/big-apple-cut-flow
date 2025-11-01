import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { GoldButton } from '@/components/ui/gold-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { uploadPaymentProof, submitPayment } from '@/lib/api/payments';
import { useAuth } from '@/hooks/useAuth';
import { DollarSign, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PaymentRequiredProps {
  appointmentId: string;
  amountCents: number;
  serviceName: string;
  barberName: string;
  date: string;
  time: string;
  confirmationNumber: string;
}

const PaymentRequired = ({
  appointmentId,
  amountCents,
  serviceName,
  barberName,
  date,
  time,
  confirmationNumber,
}: PaymentRequiredProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedMethod, setSelectedMethod] = useState<'zelle' | 'apple_pay' | 'venmo' | 'cash_app' | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [reference, setReference] = useState('');
  const [uploading, setUploading] = useState(false);

  const amount = (amountCents / 100).toFixed(2);

  const paymentMethods = [
    { id: 'zelle' as const, name: 'Zelle', instructions: 'Send to info@bigapplebarbershop.com' },
    { id: 'apple_pay' as const, name: 'Apple Pay', instructions: 'Send to (555) 123-4567' },
    { id: 'venmo' as const, name: 'Venmo', instructions: 'Send to @BigAppleBarberShop' },
    { id: 'cash_app' as const, name: 'Cash App', instructions: 'Send to $BigAppleBarbers' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProofFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedMethod) {
      toast({
        title: 'Error',
        description: 'Please select a payment method',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      let proofUrl: string | undefined;

      if (proofFile && user) {
        proofUrl = await uploadPaymentProof(proofFile, user.id);
      }

      await submitPayment({
        appointmentId,
        method: selectedMethod,
        amountCents,
        reference: reference || undefined,
        proofUrl,
      });

      toast({
        title: 'Payment Submitted',
        description: 'Your payment proof has been submitted for verification. You will receive confirmation within 24 hours.',
      });

      // Navigate to success page
      setTimeout(() => {
        navigate(`/booking-success?confirmation=${confirmationNumber}&service=${serviceName}&barber=${barberName}&date=${date}&time=${time}`);
      }, 2000);
    } catch (error) {
      console.error('Payment submission error:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit payment proof. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-[hsl(var(--accent))]/20 rounded-full">
            <DollarSign className="h-6 w-6 text-[hsl(var(--accent))]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Payment Required</h2>
            <p className="text-muted-foreground">Complete payment to confirm your appointment</p>
          </div>
        </div>

        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your appointment is reserved but requires payment verification before confirmation.
          </AlertDescription>
        </Alert>

        {/* Appointment Summary */}
        <div className="mb-6 p-4 bg-muted/50 rounded-lg">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Service</p>
              <p className="font-semibold">{serviceName}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Barber</p>
              <p className="font-semibold">{barberName}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Date & Time</p>
              <p className="font-semibold">{date} at {time}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Amount Due</p>
              <p className="font-bold text-lg text-[hsl(var(--accent))]">${amount}</p>
            </div>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="mb-6">
          <Label className="text-base mb-3 block">Select Payment Method</Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  selectedMethod === method.id
                    ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent))]/10'
                    : 'border-border hover:border-[hsl(var(--accent))]/50'
                }`}
              >
                <p className="font-semibold mb-1">{method.name}</p>
                <p className="text-xs text-muted-foreground">{method.instructions}</p>
              </button>
            ))}
          </div>
        </div>

        {selectedMethod && (
          <>
            {/* Payment Instructions */}
            <Alert className="mb-6 bg-[hsl(var(--accent))]/10 border-[hsl(var(--accent))]/30">
              <CheckCircle className="h-4 w-4 text-[hsl(var(--accent))]" />
              <AlertDescription>
                <p className="font-semibold mb-2">Payment Instructions:</p>
                <ol className="list-decimal ml-4 space-y-1 text-sm">
                  <li>Send ${amount} via {paymentMethods.find(m => m.id === selectedMethod)?.name}</li>
                  <li>{paymentMethods.find(m => m.id === selectedMethod)?.instructions}</li>
                  <li>Upload a screenshot of your payment below</li>
                  <li>Wait for admin verification (usually within 24 hours)</li>
                </ol>
              </AlertDescription>
            </Alert>

            {/* Upload Proof */}
            <div className="space-y-4 mb-6">
              <div>
                <Label htmlFor="proof">Upload Payment Proof *</Label>
                <div className="mt-2">
                  <label htmlFor="proof" className="flex items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer hover:border-[hsl(var(--accent))] transition-colors">
                    <div className="text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">
                        {proofFile ? proofFile.name : 'Click to upload screenshot'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG up to 10MB
                      </p>
                    </div>
                    <input
                      id="proof"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <Label htmlFor="reference">Transaction ID / Last 4 Digits (Optional)</Label>
                <Input
                  id="reference"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g., 1234 or txn_xyz123"
                  className="mt-2"
                />
              </div>
            </div>

            {/* Account Creation Nudge */}
            {!user && (
              <Alert className="mb-6 bg-primary/10 border-primary/30">
                <AlertDescription>
                  <p className="font-semibold mb-2">💡 Create an account to earn rewards!</p>
                  <p className="text-sm mb-2">Registered customers earn points on every haircut. Sign up now to start earning!</p>
                  <GoldButton
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('/signup', '_blank')}
                  >
                    Create Account
                  </GoldButton>
                </AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <GoldButton
              onClick={handleSubmit}
              disabled={uploading || !proofFile}
              className="w-full"
            >
              {uploading ? 'Submitting...' : 'Submit Payment Proof'}
            </GoldButton>
          </>
        )}
      </Card>
    </div>
  );
};

export default PaymentRequired;
