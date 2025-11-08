import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBarbers } from '@/lib/api/barbers';
import {
  getWorkingHours,
  upsertWorkingHours,
  getBreaks,
  createBreak,
  deleteBreak,
  getDaysOff,
  createDayOff,
  deleteDayOff,
  WorkingHours,
  Break,
  DayOff,
} from '@/lib/api/schedule';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, RefreshCw, Save, Trash2, Plus, CalendarIcon, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const ManualScheduleEditor = () => {
  const [selectedBarberId, setSelectedBarberId] = useState<string>('');
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'break' | 'dayoff'; id: string } | null>(null);
  const [newDayOff, setNewDayOff] = useState<Date>();
  const [newBreak, setNewBreak] = useState({
    type: 'custom' as 'custom' | 'everyday' | 'weekly',
    date: undefined as Date | undefined,
    weekday: 0,
    startTime: '12:00',
    endTime: '13:00',
    note: '',
  });
  const [workingHoursEdits, setWorkingHoursEdits] = useState<Record<number, { start: string; end: string }>>({});
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch barbers
  const { data: barbers = [] } = useQuery({
    queryKey: ['barbers'],
    queryFn: getBarbers,
  });

  // Fetch working hours
  const { data: workingHours = [], isLoading: loadingHours, refetch: refetchHours } = useQuery({
    queryKey: ['working-hours', selectedBarberId],
    queryFn: () => getWorkingHours(selectedBarberId),
    enabled: !!selectedBarberId,
  });

  // Fetch breaks
  const { data: breaks = [], isLoading: loadingBreaks, refetch: refetchBreaks } = useQuery({
    queryKey: ['breaks', selectedBarberId],
    queryFn: () => getBreaks(selectedBarberId),
    enabled: !!selectedBarberId,
  });

  // Fetch days off
  const { data: daysOff = [], isLoading: loadingDaysOff, refetch: refetchDaysOff } = useQuery({
    queryKey: ['days-off', selectedBarberId],
    queryFn: () => getDaysOff(selectedBarberId),
    enabled: !!selectedBarberId,
  });

  // Mutations
  const updateWorkingHoursMutation = useMutation({
    mutationFn: ({ weekday, start, end }: { weekday: number; start: string; end: string }) =>
      upsertWorkingHours(selectedBarberId, weekday, start, end),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['working-hours', selectedBarberId] });
      toast({ title: 'Success', description: 'Working hours updated' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update working hours', variant: 'destructive' });
    },
  });

  const createBreakMutation = useMutation({
    mutationFn: () => createBreak(
      selectedBarberId,
      newBreak.type,
      newBreak.startTime,
      newBreak.endTime,
      newBreak.date ? format(newBreak.date, 'yyyy-MM-dd') : undefined,
      newBreak.weekday,
      newBreak.note || undefined
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['breaks', selectedBarberId] });
      toast({ title: 'Success', description: 'Break added' });
      setNewBreak({
        type: 'custom',
        date: undefined,
        weekday: 0,
        startTime: '12:00',
        endTime: '13:00',
        note: '',
      });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to add break', variant: 'destructive' });
    },
  });

  const deleteBreakMutation = useMutation({
    mutationFn: (id: string) => deleteBreak(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['breaks', selectedBarberId] });
      toast({ title: 'Success', description: 'Break deleted' });
      setDeleteTarget(null);
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete break', variant: 'destructive' });
    },
  });

  const createDayOffMutation = useMutation({
    mutationFn: (date: string) => createDayOff(selectedBarberId, date),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['days-off', selectedBarberId] });
      toast({ title: 'Success', description: 'Day off added' });
      setNewDayOff(undefined);
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to add day off', variant: 'destructive' });
    },
  });

  const deleteDayOffMutation = useMutation({
    mutationFn: (id: string) => deleteDayOff(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['days-off', selectedBarberId] });
      toast({ title: 'Success', description: 'Day off deleted' });
      setDeleteTarget(null);
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete day off', variant: 'destructive' });
    },
  });

  const handleRefresh = () => {
    refetchHours();
    refetchBreaks();
    refetchDaysOff();
  };

  const handleSaveWorkingHours = (weekday: number) => {
    const edit = workingHoursEdits[weekday];
    if (!edit) return;
    updateWorkingHoursMutation.mutate({ weekday, start: edit.start, end: edit.end });
    setWorkingHoursEdits((prev) => {
      const next = { ...prev };
      delete next[weekday];
      return next;
    });
  };

  const handleWorkingHourChange = (weekday: number, field: 'start' | 'end', value: string) => {
    setWorkingHoursEdits((prev) => ({
      ...prev,
      [weekday]: {
        start: field === 'start' ? value : prev[weekday]?.start || '',
        end: field === 'end' ? value : prev[weekday]?.end || '',
      },
    }));
  };

  const getWorkingHoursForDay = (weekday: number): WorkingHours | undefined => {
    return workingHours.find((wh) => wh.weekday === weekday);
  };

  const renderWorkingHoursTab = () => {
    if (loadingHours) return <div className="p-4">Loading working hours...</div>;
    
    return (
      <div className="space-y-4">
        {WEEKDAYS.map((day, weekday) => {
          const existing = getWorkingHoursForDay(weekday);
          const edit = workingHoursEdits[weekday];
          const startTime = edit?.start || existing?.start_time || '09:00';
          const endTime = edit?.end || existing?.end_time || '17:00';
          const hasChanges = !!edit;

          return (
            <Card key={weekday}>
              <CardHeader>
                <CardTitle className="text-lg">{day}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div>
                    <Label htmlFor={`start-${weekday}`}>Start Time</Label>
                    <Input
                      id={`start-${weekday}`}
                      type="time"
                      value={startTime}
                      onChange={(e) => handleWorkingHourChange(weekday, 'start', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`end-${weekday}`}>End Time</Label>
                    <Input
                      id={`end-${weekday}`}
                      type="time"
                      value={endTime}
                      onChange={(e) => handleWorkingHourChange(weekday, 'end', e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={() => handleSaveWorkingHours(weekday)}
                    disabled={!hasChanges || updateWorkingHoursMutation.isPending}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderDaysOffTab = () => {
    if (loadingDaysOff) return <div className="p-4">Loading days off...</div>;

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Add Day Off</CardTitle>
            <CardDescription>Select a date when the barber will be unavailable</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !newDayOff && 'text-muted-foreground')}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newDayOff ? format(newDayOff, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={newDayOff} onSelect={setNewDayOff} initialFocus className="pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
              <Button
                onClick={() => newDayOff && createDayOffMutation.mutate(format(newDayOff, 'yyyy-MM-dd'))}
                disabled={!newDayOff || createDayOffMutation.isPending}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scheduled Days Off</CardTitle>
          </CardHeader>
          <CardContent>
            {daysOff.length === 0 ? (
              <p className="text-muted-foreground text-sm">No days off scheduled</p>
            ) : (
              <div className="space-y-2">
                {daysOff.map((dayOff) => (
                  <div key={dayOff.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">{format(new Date(dayOff.date), 'PPPP')}</span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteTarget({ type: 'dayoff', id: dayOff.id })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderBreaksTab = () => {
    if (loadingBreaks) return <div className="p-4">Loading breaks...</div>;

    const groupedBreaks = {
      custom: breaks.filter((b) => b.type === 'custom'),
      weekly: breaks.filter((b) => b.type === 'weekly'),
      everyday: breaks.filter((b) => b.type === 'everyday'),
    };

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Add Break</CardTitle>
            <CardDescription>Create a new break period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Break Type</Label>
                <Select value={newBreak.type} onValueChange={(value: any) => setNewBreak({ ...newBreak, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Custom (specific date)</SelectItem>
                    <SelectItem value="weekly">Weekly (every week)</SelectItem>
                    <SelectItem value="everyday">Everyday</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newBreak.type === 'custom' && (
                <div>
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !newBreak.date && 'text-muted-foreground')}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newBreak.date ? format(newBreak.date, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={newBreak.date} onSelect={(date) => setNewBreak({ ...newBreak, date })} initialFocus className="pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              {newBreak.type === 'weekly' && (
                <div>
                  <Label>Day of Week</Label>
                  <Select value={newBreak.weekday.toString()} onValueChange={(value) => setNewBreak({ ...newBreak, weekday: parseInt(value) })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WEEKDAYS.map((day, idx) => (
                        <SelectItem key={idx} value={idx.toString()}>{day}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Time</Label>
                  <Input type="time" value={newBreak.startTime} onChange={(e) => setNewBreak({ ...newBreak, startTime: e.target.value })} />
                </div>
                <div>
                  <Label>End Time</Label>
                  <Input type="time" value={newBreak.endTime} onChange={(e) => setNewBreak({ ...newBreak, endTime: e.target.value })} />
                </div>
              </div>

              <div>
                <Label>Note (optional)</Label>
                <Input placeholder="e.g., Lunch break" value={newBreak.note} onChange={(e) => setNewBreak({ ...newBreak, note: e.target.value })} />
              </div>

              <Button onClick={() => createBreakMutation.mutate()} disabled={createBreakMutation.isPending} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Break
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Existing Breaks</CardTitle>
          </CardHeader>
          <CardContent>
            {breaks.length === 0 ? (
              <p className="text-muted-foreground text-sm">No breaks scheduled</p>
            ) : (
              <div className="space-y-4">
                {(['custom', 'weekly', 'everyday'] as const).map((type) => {
                  const typeBreaks = groupedBreaks[type];
                  if (typeBreaks.length === 0) return null;

                  return (
                    <div key={type}>
                      <h4 className="font-semibold mb-2 capitalize">{type} Breaks</h4>
                      <div className="space-y-2">
                        {typeBreaks.map((breakItem) => (
                          <div key={breakItem.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">
                                  {breakItem.start_time} - {breakItem.end_time}
                                </span>
                              </div>
                              {breakItem.type === 'custom' && breakItem.date && (
                                <p className="text-sm text-muted-foreground mt-1">{format(new Date(breakItem.date), 'PPP')}</p>
                              )}
                              {breakItem.type === 'weekly' && breakItem.weekday !== null && (
                                <p className="text-sm text-muted-foreground mt-1">Every {WEEKDAYS[breakItem.weekday]}</p>
                              )}
                              {breakItem.note && (
                                <p className="text-sm text-muted-foreground mt-1">{breakItem.note}</p>
                              )}
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setDeleteTarget({ type: 'break', id: breakItem.id })}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Logo variant="dark" />
              <div>
                <h1 className="text-xl font-bold">Manual Schedule Editor</h1>
                <p className="text-sm text-muted-foreground">Manage barber schedules directly</p>
              </div>
            </div>
            <Link to="/admin">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Barber</CardTitle>
              <CardDescription>Choose a barber to manage their schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Select value={selectedBarberId} onValueChange={setSelectedBarberId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a barber" />
                  </SelectTrigger>
                  <SelectContent>
                    {barbers.map((barber) => (
                      <SelectItem key={barber.id} value={barber.id}>
                        {barber.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={handleRefresh} disabled={!selectedBarberId}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {selectedBarberId && (
            <Tabs defaultValue="hours" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="hours">Working Hours</TabsTrigger>
                <TabsTrigger value="daysoff">Days Off</TabsTrigger>
                <TabsTrigger value="breaks">Breaks</TabsTrigger>
              </TabsList>

              <TabsContent value="hours">{renderWorkingHoursTab()}</TabsContent>
              <TabsContent value="daysoff">{renderDaysOffTab()}</TabsContent>
              <TabsContent value="breaks">{renderBreaksTab()}</TabsContent>
            </Tabs>
          )}
        </div>
      </main>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this {deleteTarget?.type === 'break' ? 'break' : 'day off'}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget?.type === 'break') {
                  deleteBreakMutation.mutate(deleteTarget.id);
                } else if (deleteTarget?.type === 'dayoff') {
                  deleteDayOffMutation.mutate(deleteTarget.id);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManualScheduleEditor;
