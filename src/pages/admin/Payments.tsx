import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllPendingPayments, PaymentWithDetails } from '@/lib/api/payments';
import { Card } from '@/components/ui/card';
import { GoldButton } from '@/components/ui/gold-button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import PaymentVerificationDialog from '@/components/admin/PaymentVerificationDialog';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';

const Payments = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPayment, setSelectedPayment] = useState<PaymentWithDetails | null>(null);

  const { data: payments, isLoading } = useQuery({
    queryKey: ['pending-payments'],
    queryFn: getAllPendingPayments,
  });

  const handleVerificationComplete = () => {
    queryClient.invalidateQueries({ queryKey: ['pending-payments'] });
    setSelectedPayment(null);
    toast({
      title: 'Success',
      description: 'Payment has been verified',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--accent))]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payment Verification Queue</h1>
          <p className="text-muted-foreground mt-1">
            Review and verify customer payment submissions
          </p>
        </div>
        <Badge variant="secondary" className="text-lg">
          <Clock className="h-4 w-4 mr-2" />
          {payments?.length || 0} Pending
        </Badge>
      </div>

      {!payments || payments.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 mx-auto text-[hsl(var(--accent))] mb-4" />
            <h3 className="text-xl font-semibold mb-2">All Caught Up!</h3>
            <p className="text-muted-foreground">
              No pending payments to verify at the moment.
            </p>
          </div>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Barber</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    <div className="font-medium">
                      {payment.appointments &&
                        format(
                          new Date(payment.appointments.appointment_date),
                          'MMM d, yyyy'
                        )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {payment.appointments?.appointment_time}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {payment.appointments?.clients?.full_name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {payment.appointments?.clients?.email}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {payment.appointments?.clients?.phone}
                    </div>
                  </TableCell>
                  <TableCell>
                    {payment.appointments?.services?.name}
                  </TableCell>
                  <TableCell>
                    {payment.appointments?.barbers?.full_name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {payment.method.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-[hsl(var(--accent))]">
                    ${(payment.amount_cents / 100).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(payment.created_at), 'MMM d, h:mm a')}
                  </TableCell>
                  <TableCell>
                    <GoldButton
                      size="sm"
                      onClick={() => setSelectedPayment(payment)}
                    >
                      Review
                    </GoldButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {selectedPayment && (
        <PaymentVerificationDialog
          payment={selectedPayment}
          open={!!selectedPayment}
          onOpenChange={(open) => !open && setSelectedPayment(null)}
          onVerified={handleVerificationComplete}
        />
      )}
    </div>
  );
};

export default Payments;
