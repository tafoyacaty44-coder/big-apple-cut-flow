import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllAppointments, AdminAppointment } from '@/lib/api/admin';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Eye, Plus, Search } from 'lucide-react';
import { CreateAppointmentDialog } from './CreateAppointmentDialog';
import { AppointmentDetailsDialog } from './AppointmentDetailsDialog';
import { format } from 'date-fns';

export const AppointmentsTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AdminAppointment | null>(null);

  const { data: appointments, isLoading, refetch } = useQuery({
    queryKey: ['admin-appointments'],
    queryFn: getAllAppointments,
  });

  const filteredAppointments = appointments?.filter((apt) => {
    const matchesSearch =
      apt.confirmation_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (apt.guest_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (apt.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400',
      confirmed: 'bg-blue-500/20 text-blue-700 dark:text-blue-400',
      completed: 'bg-green-500/20 text-green-700 dark:text-green-400',
      cancelled: 'bg-red-500/20 text-red-700 dark:text-red-400',
    };

    return (
      <Badge className={variants[status] || ''}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPaymentBadge = (status: string) => {
    const variants: Record<string, string> = {
      none: 'bg-gray-500/20 text-gray-700 dark:text-gray-400',
      deposit_paid: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400',
      fully_paid: 'bg-green-500/20 text-green-700 dark:text-green-400',
    };

    const displayText = status === 'deposit_paid' ? 'Deposit Paid' : 
                       status === 'fully_paid' ? 'Fully Paid' : 
                       status.charAt(0).toUpperCase() + status.slice(1);

    return (
      <Badge className={variants[status] || ''}>
        {displayText}
      </Badge>
    );
  };

  const handleViewDetails = (appointment: AdminAppointment) => {
    setSelectedAppointment(appointment);
    setDetailsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Appointments</h2>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Appointment
            </Button>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by confirmation # or customer name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Confirmation #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Barber</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No appointments found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAppointments?.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell className="font-mono font-medium">
                        {appointment.confirmation_number}
                      </TableCell>
                      <TableCell>
                        {appointment.customer_name || appointment.guest_name || 'N/A'}
                      </TableCell>
                      <TableCell>{appointment.barbers?.full_name || 'N/A'}</TableCell>
                      <TableCell>{appointment.services?.name || 'N/A'}</TableCell>
                      <TableCell>
                        {format(new Date(appointment.appointment_date), 'MMM dd, yyyy')}
                        <br />
                        <span className="text-sm text-muted-foreground">
                          {appointment.appointment_time}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                      <TableCell>{getPaymentBadge(appointment.payment_status)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(appointment)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>

      <CreateAppointmentDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={refetch}
      />

      {selectedAppointment && (
        <AppointmentDetailsDialog
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
          appointment={selectedAppointment}
          onSuccess={refetch}
        />
      )}
    </>
  );
};
