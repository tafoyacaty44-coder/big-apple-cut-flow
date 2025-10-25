import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBarberAvailability, updateBarberAvailability } from '@/lib/api/admin';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface Barber {
  id: string;
  full_name: string;
}

interface BarberAvailabilityDialogProps {
  barber: Barber;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface DayAvailability {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
  status_message?: string;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const BarberAvailabilityDialog = ({
  barber,
  open,
  onOpenChange,
}: BarberAvailabilityDialogProps) => {
  const [availability, setAvailability] = useState<DayAvailability[]>([]);

  const queryClient = useQueryClient();

  const { data: existingAvailability } = useQuery({
    queryKey: ['barber-availability', barber.id],
    queryFn: () => getBarberAvailability(barber.id),
    enabled: open,
  });

  useEffect(() => {
    if (existingAvailability) {
      const availMap = new Map(
        existingAvailability.map(a => [a.day_of_week, a])
      );
      
      const fullWeek: DayAvailability[] = [0, 1, 2, 3, 4, 5, 6].map(day => {
        const existing = availMap.get(day);
        return existing || {
          day_of_week: day,
          start_time: '09:00',
          end_time: '18:00',
          is_available: false,
        };
      });

      setAvailability(fullWeek);
    }
  }, [existingAvailability]);

  const updateMutation = useMutation({
    mutationFn: () => updateBarberAvailability(barber.id, availability),
    onSuccess: () => {
      toast.success('Availability updated successfully');
      queryClient.invalidateQueries({ queryKey: ['barber-availability'] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update availability');
    },
  });

  const handleToggleDay = (dayIndex: number) => {
    setAvailability(prev =>
      prev.map((day, idx) =>
        idx === dayIndex ? { ...day, is_available: !day.is_available } : day
      )
    );
  };

  const handleTimeChange = (dayIndex: number, field: 'start_time' | 'end_time', value: string) => {
    setAvailability(prev =>
      prev.map((day, idx) =>
        idx === dayIndex ? { ...day, [field]: value } : day
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Availability - {barber.full_name}</DialogTitle>
          <DialogDescription>
            Set weekly schedule and working hours
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {availability.map((day, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-4 border rounded-lg"
            >
              <div className="flex items-center gap-3 w-32">
                <Switch
                  checked={day.is_available}
                  onCheckedChange={() => handleToggleDay(index)}
                />
                <Label className="font-medium">{DAYS[day.day_of_week]}</Label>
              </div>

              {day.is_available ? (
                <div className="flex gap-3 flex-1">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Start</Label>
                    <Input
                      type="time"
                      value={day.start_time}
                      onChange={(e) =>
                        handleTimeChange(index, 'start_time', e.target.value)
                      }
                      className="w-32"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">End</Label>
                    <Input
                      type="time"
                      value={day.end_time}
                      onChange={(e) =>
                        handleTimeChange(index, 'end_time', e.target.value)
                      }
                      className="w-32"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex-1 text-sm text-muted-foreground">
                  Not available
                </div>
              )}
            </div>
          ))}

          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving...' : 'Save Schedule'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
