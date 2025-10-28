import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GoldButton } from '@/components/ui/gold-button';
import { Badge } from '@/components/ui/badge';
import { PaymentWithDetails, verifyPayment } from '@/lib/api/payments';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { CheckCircle, XCircle, DollarSign, Calendar, User, Phone, Mail } from 'lucide-react';

interface PaymentVerificationDialogProps {
  payment: PaymentWithDetails;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerified: () => void;
}

const PaymentVerificationDialog = ({
  payment,
  open,
  onOpenChange,
  onVerified,
}: PaymentVerificationDialogProps) => {
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);

  const handleVerify = async (status: 'verified' | 'rejected') => {
    setProcessing(true);

    try {
      await verifyPayment(payment.id, status);
      
      toast({
        title: status === 'verified' ? 'Payment Verified' : 'Payment Rejected',
        description: status === 'verified' 
          ? 'The appointment has been confirmed.' 
          : 'Customer will be notified to resubmit payment.',
      });

      onVerified();
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: 'Error',
        description: 'Failed to process payment verification',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Verify Payment</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Appointment Details */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-start gap-2">
              <Calendar className="h-5 w-5 text-[hsl(var(--accent))] mt-0.5" />
              <div>
                <p className="text-sm font-medium">Appointment</p>
                <p className="text-sm text-muted-foreground">
                  {payment.appointments &&
                    format(
                      new Date(payment.appointments.appointment_date),
                      'EEEE, MMM d, yyyy'
                    )}
                </p>
                <p className="text-sm text-muted-foreground">
                  {payment.appointments?.appointment_time}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <User className="h-5 w-5 text-[hsl(var(--accent))] mt-0.5" />
              <div>
                <p className="text-sm font-medium">Service & Barber</p>
                <p className="text-sm text-muted-foreground">
                  {payment.appointments?.services?.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  with {payment.appointments?.barbers?.full_name}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <User className="h-5 w-5 text-[hsl(var(--accent))] mt-0.5" />
              <div>
                <p className="text-sm font-medium">Customer</p>
                <p className="text-sm text-muted-foreground">
                  {payment.appointments?.clients?.full_name}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <DollarSign className="h-5 w-5 text-[hsl(var(--accent))] mt-0.5" />
              <div>
                <p className="text-sm font-medium">Amount</p>
                <p className="text-lg font-bold text-[hsl(var(--accent))]">
                  ${(payment.amount_cents / 100).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-2">
            <h3 className="font-semibold">Contact Information</h3>
            <div className="grid gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{payment.appointments?.clients?.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{payment.appointments?.clients?.phone}</span>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="space-y-2">
            <h3 className="font-semibold">Payment Details</h3>
            <div className="grid gap-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Method:</span>
                <Badge variant="outline" className="capitalize">
                  {payment.method.replace('_', ' ')}
                </Badge>
              </div>
              {payment.reference && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Reference:</span>
                  <span className="font-medium">{payment.reference}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Submitted:</span>
                <span>{format(new Date(payment.created_at), 'MMM d, yyyy h:mm a')}</span>
              </div>
            </div>
          </div>

          {/* Payment Proof */}
          {payment.proof_url && (
            <div className="space-y-2">
              <h3 className="font-semibold">Payment Proof</h3>
              <div className="border rounded-lg overflow-hidden">
                <img
                  src={payment.proof_url}
                  alt="Payment proof"
                  className="w-full h-auto"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <GoldButton
              onClick={() => handleVerify('verified')}
              disabled={processing}
              className="flex-1"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Verify Payment
            </GoldButton>
            <GoldButton
              variant="outline"
              onClick={() => handleVerify('rejected')}
              disabled={processing}
              className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject Payment
            </GoldButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentVerificationDialog;
