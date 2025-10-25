import { useQuery } from '@tanstack/react-query';
import { getMyAvailability } from '@/lib/api/barber';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { format } from 'date-fns';

interface MyAvailabilityProps {
  barberId: string;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const MyAvailability = ({ barberId }: MyAvailabilityProps) => {
  const { data: availability, isLoading } = useQuery({
    queryKey: ['my-availability', barberId],
    queryFn: () => getMyAvailability(barberId),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const availMap = new Map(
    availability?.map(a => [a.day_of_week, a]) || []
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          My Schedule
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
            const dayAvail = availMap.get(dayIndex);
            const isAvailable = dayAvail?.is_available;

            return (
              <div
                key={dayIndex}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-24 font-medium">{DAYS[dayIndex]}</div>
                  {isAvailable ? (
                    <Badge variant="default">Available</Badge>
                  ) : (
                    <Badge variant="secondary">Day Off</Badge>
                  )}
                </div>
                {isAvailable && dayAvail && (
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(`2000-01-01T${dayAvail.start_time}`), 'h:mm a')}
                    {' - '}
                    {format(new Date(`2000-01-01T${dayAvail.end_time}`), 'h:mm a')}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-4 p-3 bg-muted rounded-lg text-sm text-muted-foreground">
          <p>💡 Contact an admin to update your schedule</p>
        </div>
      </CardContent>
    </Card>
  );
};
