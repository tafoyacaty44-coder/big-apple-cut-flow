import { useQuery } from '@tanstack/react-query';
import { BreakTimeDialog } from '@/components/admin/BreakTimeDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, ArrowLeft, LogOut } from 'lucide-react';
import { getBreaks, deleteBreak } from '@/lib/api/schedule';
import { getBarbers } from '@/lib/api/barbers';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Logo from '@/components/Logo';

const BreakTime = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: breaks, isLoading } = useQuery({
    queryKey: ['breaks'],
    queryFn: () => getBreaks(),
  });

  const { data: barbers } = useQuery({
    queryKey: ['barbers'],
    queryFn: getBarbers,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBreak,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['breaks'] });
      toast({
        title: 'Success',
        description: 'Break deleted successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete break',
        variant: 'destructive',
      });
    },
  });

  const groupedBreaks = breaks?.reduce((acc, breakItem) => {
    const barberName = barbers?.find(b => b.id === breakItem.barber_id)?.full_name || 'Unknown';
    if (!acc[barberName]) {
      acc[barberName] = [];
    }
    acc[barberName].push(breakItem);
    return acc;
  }, {} as Record<string, typeof breaks>);

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => window.location.href = '/admin'}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Logo variant="dark" />
              <div>
                <h1 className="text-xl font-bold">Break Time Settings</h1>
                <p className="text-sm text-muted-foreground">Manage break schedules for all barbers</p>
              </div>
            </div>
            <div className="flex gap-2">
              <BreakTimeDialog />
              <Button variant="outline" onClick={() => window.location.href = '/admin'}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-6">

        <div className="space-y-4">
          {Object.entries(groupedBreaks || {}).map(([barberName, barberBreaks]) => (
            <Card key={barberName}>
              <CardHeader>
                <CardTitle>{barberName}</CardTitle>
                <CardDescription>{barberBreaks.length} breaks configured</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {barberBreaks.map(breakItem => (
                    <div
                      key={breakItem.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="capitalize">
                          {breakItem.type}
                        </Badge>
                        <span className="text-sm">
                          {breakItem.start_time} - {breakItem.end_time}
                        </span>
                        {breakItem.date && (
                          <span className="text-sm text-muted-foreground">
                            {new Date(breakItem.date).toLocaleDateString()}
                          </span>
                        )}
                        {breakItem.note && (
                          <span className="text-sm text-muted-foreground">
                            {breakItem.note}
                          </span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMutation.mutate(breakItem.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {(!groupedBreaks || Object.keys(groupedBreaks).length === 0) && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  No breaks configured yet. Click "Create Break Time" to add one.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
        </div>
      </main>
    </div>
  );
};

export default BreakTime;
