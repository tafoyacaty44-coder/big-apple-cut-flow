import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllScheduleRequests, reviewScheduleRequest, createAvailabilityOverride, getAllOverrides, deleteOverride } from '@/lib/api/availability';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { CheckCircle, XCircle, ArrowLeft, LogOut } from 'lucide-react';
import Logo from '@/components/Logo';

const ScheduleManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: requests, isLoading } = useQuery({
    queryKey: ['admin-schedule-requests'],
    queryFn: () => getAllScheduleRequests(),
    refetchInterval: 30000,
  });

  const reviewMutation = useMutation({
    mutationFn: ({ requestId, approve, note }: any) => reviewScheduleRequest(requestId, approve, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-schedule-requests'] });
      queryClient.invalidateQueries({ queryKey: ['availability'] });
      toast({ title: 'Request reviewed successfully' });
    },
  });

  const pendingRequests = requests?.filter(r => r.status === 'pending') || [];

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
                <h1 className="text-xl font-bold">Schedule Management</h1>
                <p className="text-sm text-muted-foreground">Review and manage schedule requests</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => window.location.href = '/admin'}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Pending Schedule Requests ({pendingRequests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingRequests.map((req: any) => (
              <div key={req.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{req.kind.replace('_', ' ')}</Badge>
                      <span className="font-medium">{req.barbers?.full_name}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Submitted: {format(new Date(req.created_at), 'MMM d, yyyy')}
                    </p>
                    {req.note && <p className="text-sm mt-2">{req.note}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => reviewMutation.mutate({ requestId: req.id, approve: true })}
                      disabled={reviewMutation.isPending}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => reviewMutation.mutate({ requestId: req.id, approve: false })}
                      disabled={reviewMutation.isPending}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {pendingRequests.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No pending requests</p>
            )}
          </div>
        </CardContent>
      </Card>
      </main>
    </div>
  );
};

export default ScheduleManagement;