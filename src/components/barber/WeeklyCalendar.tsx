import { useQuery } from '@tanstack/react-query';
import { getBarberAppointments } from '@/lib/api/barber';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, startOfWeek, endOfWeek, addDays } from 'date-fns';
import { Calendar } from 'lucide-react';

interface WeeklyCalendarProps {
  barberId: string;
}

export const WeeklyCalendar = ({ barberId }: WeeklyCalendarProps) => {
  const today = new Date();
  const weekStart = startOfWeek(today);
  const weekEnd = endOfWeek(today);

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['barber-week-appointments', barberId, weekStart.toISOString()],
    queryFn: () =>
      getBarberAppointments(
        barberId,
        format(weekStart, 'yyyy-MM-dd'),
        format(weekEnd, 'yyyy-MM-dd')
      ),
    refetchInterval: 30000,
  });

  const getAppointmentsForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return appointments?.filter((apt: any) => apt.appointment_date === dateStr) || [];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'completed':
        return 'bg-blue-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weekly Schedule</CardTitle>
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
          <Calendar className="h-5 w-5" />
          Weekly Schedule
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {[0, 1, 2, 3, 4, 5, 6].map((dayOffset) => {
            const date = addDays(weekStart, dayOffset);
            const dayAppointments = getAppointmentsForDay(date);
            const isToday = format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');

            return (
              <div
                key={dayOffset}
                className={`border rounded-lg p-3 ${
                  isToday ? 'border-primary bg-primary/5' : ''
                }`}
              >
                <div className="text-center mb-2">
                  <div className="text-xs font-medium text-muted-foreground">
                    {format(date, 'EEE')}
                  </div>
                  <div className={`text-lg font-bold ${isToday ? 'text-primary' : ''}`}>
                    {format(date, 'd')}
                  </div>
                </div>
                <div className="space-y-1">
                  {dayAppointments.length === 0 ? (
                    <div className="text-xs text-center text-muted-foreground py-2">
                      No appointments
                    </div>
                  ) : (
                    dayAppointments.map((apt: any) => (
                      <div
                        key={apt.id}
                        className="text-xs p-2 border rounded bg-card"
                      >
                        <div className="flex items-center gap-1 mb-1">
                          <div className={`h-2 w-2 rounded-full ${getStatusColor(apt.status)}`} />
                          <span className="font-medium">
                            {format(new Date(`2000-01-01T${apt.appointment_time}`), 'h:mm a')}
                          </span>
                        </div>
                        <div className="text-muted-foreground truncate">
                          {apt.customer_name}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
