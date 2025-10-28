import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { createScheduleRequest, getMyScheduleRequests } from '@/lib/api/availability';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Clock, Calendar, Coffee } from 'lucide-react';
import { format } from 'date-fns';

const MySchedule = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [openDialog, setOpenDialog] = useState<'working_hours' | 'breaks' | 'day_off' | null>(null);

  // Get barber ID
  const { data: barber } = useQuery({
    queryKey: ['my-barber-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('barbers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Get working hours
  const { data: workingHours } = useQuery({
    queryKey: ['working-hours', barber?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('working_hours')
        .select('*')
        .eq('barber_id', barber?.id)
        .order('weekday');
      if (error) throw error;
      return data;
    },
    enabled: !!barber?.id,
  });

  // Get breaks
  const { data: breaks } = useQuery({
    queryKey: ['breaks', barber?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('breaks')
        .select('*')
        .eq('barber_id', barber?.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!barber?.id,
  });

  // Get days off
  const { data: daysOff } = useQuery({
    queryKey: ['days-off', barber?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('days_off')
        .select('*')
        .eq('barber_id', barber?.id)
        .order('date');
      if (error) throw error;
      return data;
    },
    enabled: !!barber?.id,
  });

  // Get schedule requests
  const { data: requests } = useQuery({
    queryKey: ['schedule-requests', barber?.id],
    queryFn: () => getMyScheduleRequests(barber!.id),
    enabled: !!barber?.id,
    refetchInterval: 30000,
  });

  // Create request mutation
  const createRequest = useMutation({
    mutationFn: createScheduleRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-requests'] });
      toast({ title: 'Request submitted successfully' });
      setOpenDialog(null);
    },
    onError: (error: Error) => {
      toast({ 
        title: 'Error submitting request', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Schedule</h1>

      <Tabs defaultValue="working-hours" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="working-hours">Working Hours</TabsTrigger>
          <TabsTrigger value="breaks">Breaks</TabsTrigger>
          <TabsTrigger value="days-off">Days Off</TabsTrigger>
          <TabsTrigger value="requests">My Requests</TabsTrigger>
        </TabsList>

        {/* Working Hours Tab */}
        <TabsContent value="working-hours">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Current Working Hours
                </span>
                <WorkingHoursDialog 
                  open={openDialog === 'working_hours'}
                  onOpenChange={(open) => setOpenDialog(open ? 'working_hours' : null)}
                  onSubmit={(data) => createRequest.mutate({ kind: 'working_hours', ...data })}
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {workingHours?.map((wh) => (
                  <div key={wh.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">{weekdays[wh.weekday]}</span>
                    <span>{wh.start_time} - {wh.end_time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Breaks Tab */}
        <TabsContent value="breaks">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Coffee className="h-5 w-5" />
                  Current Breaks
                </span>
                <BreaksDialog 
                  open={openDialog === 'breaks'}
                  onOpenChange={(open) => setOpenDialog(open ? 'breaks' : null)}
                  onSubmit={(data) => createRequest.mutate({ kind: 'breaks', ...data })}
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {breaks?.map((br) => (
                  <div key={br.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <div>
                      <Badge variant="outline" className="mb-1">{br.type}</Badge>
                      {br.type === 'custom' && <p className="text-sm">{br.date}</p>}
                      {br.type === 'weekly' && <p className="text-sm">{weekdays[br.weekday!]}</p>}
                      {br.note && <p className="text-xs text-muted-foreground mt-1">{br.note}</p>}
                    </div>
                    <span className="font-mono">{br.start_time} - {br.end_time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Days Off Tab */}
        <TabsContent value="days-off">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Scheduled Days Off
                </span>
                <DayOffDialog 
                  open={openDialog === 'day_off'}
                  onOpenChange={(open) => setOpenDialog(open ? 'day_off' : null)}
                  onSubmit={(data) => createRequest.mutate({ kind: 'day_off', ...data })}
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {daysOff?.map((day) => (
                  <div key={day.id} className="p-3 bg-muted rounded-lg text-center">
                    {format(new Date(day.date), 'EEE, MMM d, yyyy')}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Requests Tab */}
        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>My Schedule Change Requests</CardTitle>
              <CardDescription>Track the status of your submitted requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requests?.map((req) => (
                  <div key={req.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <Badge variant="outline">{req.kind.replace('_', ' ')}</Badge>
                        {getStatusBadge(req.status)}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(req.created_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <p className="text-sm mt-2">{req.note || 'No additional notes'}</p>
                    {req.status === 'rejected' && req.reviewed_at && (
                      <p className="text-sm text-destructive mt-2">
                        Reviewed on {format(new Date(req.reviewed_at), 'MMM d, yyyy')}
                      </p>
                    )}
                  </div>
                ))}
                {(!requests || requests.length === 0) && (
                  <p className="text-center text-muted-foreground py-8">
                    No schedule requests yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Dialog Components
const WorkingHoursDialog = ({ open, onOpenChange, onSubmit }: any) => {
  const [weekday, setWeekday] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = () => {
    onSubmit({ weekday: parseInt(weekday), start_time: startTime, end_time: endTime, note });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>Request Change</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Working Hours Change</DialogTitle>
          <DialogDescription>
            Submit a request to modify your working hours
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Weekday</Label>
            <Select value={weekday} onValueChange={setWeekday}>
              <SelectTrigger>
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent>
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, idx) => (
                  <SelectItem key={idx} value={idx.toString()}>{day}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Time</Label>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div>
              <Label>End Time</Label>
              <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Note (optional)</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Submit Request</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const BreaksDialog = ({ open, onOpenChange, onSubmit }: any) => {
  const [breakKind, setBreakKind] = useState('custom');
  const [date, setDate] = useState('');
  const [weekday, setWeekday] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = () => {
    onSubmit({ 
      break_kind: breakKind, 
      date: breakKind === 'custom' ? date : undefined,
      break_weekday: breakKind !== 'custom' ? parseInt(weekday) : undefined,
      break_start: startTime, 
      break_end: endTime, 
      note 
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>Request Break</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Break</DialogTitle>
          <DialogDescription>
            Submit a request to add a break to your schedule
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Break Type</Label>
            <Select value={breakKind} onValueChange={setBreakKind}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">One-time (specific date)</SelectItem>
                <SelectItem value="weekly">Weekly (every week)</SelectItem>
                <SelectItem value="everyday">Everyday</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {breakKind === 'custom' && (
            <div>
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          )}
          {(breakKind === 'weekly' || breakKind === 'everyday') && (
            <div>
              <Label>Weekday</Label>
              <Select value={weekday} onValueChange={setWeekday}>
                <SelectTrigger>
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, idx) => (
                    <SelectItem key={idx} value={idx.toString()}>{day}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Time</Label>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div>
              <Label>End Time</Label>
              <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Note (optional)</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Submit Request</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const DayOffDialog = ({ open, onOpenChange, onSubmit }: any) => {
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = () => {
    onSubmit({ day_off_date: date, note });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>Request Day Off</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Day Off</DialogTitle>
          <DialogDescription>
            Submit a request for a day off
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <Label>Reason (optional)</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Submit Request</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MySchedule;