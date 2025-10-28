import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { GoldButton } from '@/components/ui/gold-button';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';
import { getBarbers } from '@/lib/api/barbers';
import { createBreak } from '@/lib/api/schedule';

const timeSlots = [
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'
];

export const BreakTimeDialog = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const [barberId, setBarberId] = useState<string>('');
  const [breakType, setBreakType] = useState<'custom' | 'everyday' | 'weekly'>('weekly');
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [customDate, setCustomDate] = useState('');

  const { data: barbers } = useQuery({
    queryKey: ['barbers'],
    queryFn: getBarbers,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const promises = selectedSlots.map(slot => {
        const [hours, minutes] = slot.split(':');
        const startTime = `${hours}:${minutes}:00`;
        const endTime = `${hours}:${(parseInt(minutes) + 30).toString().padStart(2, '0')}:00`;
        
        return createBreak(
          barberId,
          breakType,
          startTime,
          endTime,
          breakType === 'custom' ? customDate : undefined,
          breakType === 'weekly' ? 1 : undefined, // Monday for weekly
          note || undefined
        );
      });
      
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['breaks'] });
      toast({
        title: 'Success',
        description: 'Break times created successfully',
      });
      setOpen(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create break times',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setBarberId('');
    setBreakType('weekly');
    setSelectedSlots([]);
    setNote('');
    setCustomDate('');
  };

  const toggleSlot = (slot: string) => {
    setSelectedSlots(prev =>
      prev.includes(slot)
        ? prev.filter(s => s !== slot)
        : [...prev, slot]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barberId || selectedSlots.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select a barber and at least one time slot',
        variant: 'destructive',
      });
      return;
    }
    if (breakType === 'custom' && !customDate) {
      toast({
        title: 'Error',
        description: 'Please select a date for custom break',
        variant: 'destructive',
      });
      return;
    }
    createMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">
          <Plus className="mr-2 h-4 w-4" />
          Create Break Time
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Break Time</DialogTitle>
          <DialogDescription>
            Set up break times for barbers
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Select Barber</Label>
            <Select value={barberId} onValueChange={setBarberId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a barber" />
              </SelectTrigger>
              <SelectContent>
                {barbers?.map(barber => (
                  <SelectItem key={barber.id} value={barber.id}>
                    {barber.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Break Type</Label>
            <Tabs value={breakType} onValueChange={(v) => setBreakType(v as typeof breakType)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="custom">Custom</TabsTrigger>
                <TabsTrigger value="everyday">Everyday</TabsTrigger>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {breakType === 'custom' && (
            <div className="space-y-2">
              <Label>Date</Label>
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Select Time Slots (30-minute intervals)</Label>
            <div className="grid grid-cols-3 gap-2">
              {timeSlots.map(slot => (
                <div key={slot} className="flex items-center space-x-2">
                  <Checkbox
                    id={slot}
                    checked={selectedSlots.includes(slot)}
                    onCheckedChange={() => toggleSlot(slot)}
                  />
                  <label htmlFor={slot} className="text-sm cursor-pointer">
                    {slot}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Note (Optional)</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note about this break"
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <GoldButton type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Submit Now'}
            </GoldButton>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
