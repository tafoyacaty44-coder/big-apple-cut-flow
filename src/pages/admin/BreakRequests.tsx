import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllScheduleRequests } from '@/lib/api/availability';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Check, X, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import Navigation from '@/components/Navigation';

const BreakRequests = () => {
  const [reviewingRequest, setReviewingRequest] = useState<any>(null);
  const [reviewNote, setReviewNote] = useState('');
  const queryClient = useQueryClient();

  const { data: requests, isLoading } = useQuery({
    queryKey: ['schedule-requests', 'breaks'],
    queryFn: async () => {
      const allRequests = await getAllScheduleRequests();
      return allRequests.filter((req: any) => req.kind === 'breaks');
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ requestId, approved }: { requestId: string; approved: boolean }) => {
      const { error } = await supabase.functions.invoke('review-schedule-change', {
        body: {
          request_id: requestId,
          approved,
          admin_note: reviewNote || undefined,
        },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-requests'] });
      toast.success('Break request reviewed');
      setReviewingRequest(null);
      setReviewNote('');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to review request');
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const formatBreakType = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto p-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  const pendingRequests = requests?.filter((r: any) => r.status === 'pending') || [];
  const reviewedRequests = requests?.filter((r: any) => r.status !== 'pending') || [];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto p-4 md:p-8">
        <div className="mb-6">
          <Link to="/admin">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Break Requests</h1>
            <p className="text-muted-foreground">Review and approve barber break requests</p>
          </div>

          {/* Pending Requests */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Pending Requests ({pendingRequests.length})</h2>
            {pendingRequests.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No pending break requests
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {pendingRequests.map((request: any) => (
                  <Card key={request.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            {request.barbers?.full_name}
                          </CardTitle>
                          <CardDescription>
                            {formatBreakType(request.break_kind)} - {request.date || `Every ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][request.break_weekday]}`}
                          </CardDescription>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Time:</span> {formatTime(request.break_start)} - {formatTime(request.break_end)}
                        </div>
                        <div>
                          <span className="font-medium">Type:</span> {formatBreakType(request.break_kind)}
                        </div>
                      </div>
                      
                      {request.note && (
                        <div className="text-sm">
                          <span className="font-medium">Note:</span> {request.note}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => setReviewingRequest({ ...request, action: 'approve' })}
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setReviewingRequest({ ...request, action: 'reject' })}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Reviewed Requests */}
          {reviewedRequests.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Recently Reviewed</h2>
              <div className="grid gap-4">
                {reviewedRequests.slice(0, 5).map((request: any) => (
                  <Card key={request.id} className="opacity-75">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">
                            {request.barbers?.full_name}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            {formatBreakType(request.break_kind)} - {request.date || `Every ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][request.break_weekday]}`}
                          </CardDescription>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Review Dialog */}
      <Dialog open={!!reviewingRequest} onOpenChange={(open) => !open && setReviewingRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewingRequest?.action === 'approve' ? 'Approve' : 'Reject'} Break Request
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {reviewingRequest?.action === 'approve'
                ? 'This will create the break in the schedule.'
                : 'This will reject the break request and notify the barber.'}
            </p>
            
            <div className="space-y-2">
              <Label htmlFor="review-note">Note (Optional)</Label>
              <Textarea
                id="review-note"
                placeholder="Add a note for the barber..."
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setReviewingRequest(null)}>
                Cancel
              </Button>
              <Button
                variant={reviewingRequest?.action === 'approve' ? 'default' : 'destructive'}
                onClick={() => {
                  if (reviewingRequest) {
                    reviewMutation.mutate({
                      requestId: reviewingRequest.id,
                      approved: reviewingRequest.action === 'approve',
                    });
                  }
                }}
                disabled={reviewMutation.isPending}
              >
                {reviewMutation.isPending ? 'Processing...' : 'Confirm'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BreakRequests;
