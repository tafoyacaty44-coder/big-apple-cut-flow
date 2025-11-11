import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AdminAppointment, updateAppointmentStatus, updatePaymentStatus } from '@/lib/api/admin';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Loader2, Phone, Mail, User, Calendar, Clock, Scissors, DollarSign } from 'lucide-react';

interface AppointmentDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: AdminAppointment;
  onSuccess: () => void;
}

export const AppointmentDetailsDialog = ({
  open,
  onOpenChange,
  appointment,
  onSuccess,
}: AppointmentDetailsDialogProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(appointment.status);
  const [currentPaymentStatus, setCurrentPaymentStatus] = useState(appointment.payment_status);

  // Sync local state when appointment prop changes (after refetch)
  useEffect(() => {
    setCurrentStatus(appointment.status);
    setCurrentPaymentStatus(appointment.payment_status);
  }, [appointment.status, appointment.payment_status]);

  const handleStatusUpdate = async (newStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show') => {
    setIsUpdating(true);
    try {
      await updateAppointmentStatus(appointment.id, newStatus);
      setCurrentStatus(newStatus);
      toast.success('Appointment status updated');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePaymentUpdate = async (newStatus: 'none' | 'deposit_paid' | 'fully_paid') => {
    setIsUpdating(true);
    try {
      await updatePaymentStatus(appointment.id, newStatus);
      setCurrentPaymentStatus(newStatus);
      toast.success('Payment status updated');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update payment status');
    } finally {
      setIsUpdating(false);
    }
  };

  const customerName = appointment.customer_name || appointment.guest_name || 'N/A';
  const customerEmail = appointment.guest_email || 'N/A';
  const customerPhone = appointment.guest_phone || 'N/A';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Appointment Details</DialogTitle>
          <DialogDescription>
            Confirmation #{appointment.confirmation_number}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Information */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Customer Information
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium">{customerName}</span>
                {appointment.customer_id && (
                  <Badge variant="secondary" className="text-xs">Registered</Badge>
                )}
                {!appointment.customer_id && (
                  <Badge variant="outline" className="text-xs">Guest</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Email:</span>
                <span>{customerEmail}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Phone:</span>
                <span>{customerPhone}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Appointment Details */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Appointment Details
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Barber:</span>
                <p className="font-medium">{appointment.barbers?.full_name || 'N/A'}</p>
              </div>
              <div>
                <span className="text-muted-foreground flex items-center gap-1">
                  <Scissors className="h-3 w-3" />
                  Service:
                </span>
                <p className="font-medium">{appointment.services?.name || 'N/A'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Date:</span>
                <p className="font-medium">
                  {format(new Date(appointment.appointment_date), 'MMMM dd, yyyy')}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Time:
                </span>
                <p className="font-medium">{appointment.appointment_time}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Payment Information */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Payment Information
            </h3>
            <div className="text-sm">
              <span className="text-muted-foreground">Amount:</span>
              <p className="font-medium text-lg">
                ${appointment.payment_amount?.toFixed(2) || appointment.services?.regular_price.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>

          {/* Notes */}
          {appointment.notes && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Notes</h3>
                <p className="text-sm text-muted-foreground">{appointment.notes}</p>
              </div>
            </>
          )}

          <Separator />

          {/* Status Management */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Appointment Status</label>
              <Select
                value={currentStatus}
                onValueChange={handleStatusUpdate}
                disabled={isUpdating}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="no_show">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Payment Status</label>
              <Select
                value={currentPaymentStatus}
                onValueChange={handlePaymentUpdate}
                disabled={isUpdating}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="deposit_paid">Deposit Paid</SelectItem>
                  <SelectItem value="fully_paid">Fully Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={() => onOpenChange(false)}
              disabled={isUpdating}
            >
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
