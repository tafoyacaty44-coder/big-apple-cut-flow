import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getBarberAppointments } from '@/lib/api/barber';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, User, Scissors, Image, Camera } from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ClientPicturesView } from './ClientPicturesView';
import { ClientPhotoManager } from './ClientPhotoManager';

interface AppointmentsListProps {
  barberId: string;
}

export const AppointmentsList = ({ barberId }: AppointmentsListProps) => {
  const today = new Date().toISOString().split('T')[0];
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['barber-appointments', barberId, today],
    queryFn: () => getBarberAppointments(barberId, today, today),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'completed':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Today's Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Today's Appointments
          <Badge variant="secondary" className="ml-auto">
            {appointments?.length || 0}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!appointments || appointments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No appointments scheduled for today
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((apt: any) => (
              <div
                key={apt.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{apt.customer_name}</div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Scissors className="h-3 w-3" />
                      {apt.services?.name}
                      <span className="text-xs">•</span>
                      <span>{apt.services?.duration_minutes} min</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {apt.client_id && (
                    <ClientPhotoManager
                      clientId={apt.client_id}
                      barberId={barberId}
                      appointmentId={apt.id}
                    />
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedAppointmentId(apt.id)}
                    className="text-primary hover:text-primary/80"
                  >
                    <Image className="h-4 w-4" />
                    <span className="sr-only">View client photos</span>
                  </Button>
                  <div className="text-right">
                    <div className="font-semibold">
                      {format(new Date(`2000-01-01T${apt.appointment_time}`), 'h:mm a')}
                    </div>
                    <Badge variant={getStatusColor(apt.status)} className="text-xs">
                      {apt.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={!!selectedAppointmentId} onOpenChange={(open) => !open && setSelectedAppointmentId(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Client Reference Photos</DialogTitle>
          </DialogHeader>
          {selectedAppointmentId && (
            <ClientPicturesView appointmentId={selectedAppointmentId} />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};
