import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mail, MessageSquare, RefreshCw, Clock, CheckCircle, XCircle, ArrowLeft, LogOut } from "lucide-react";
import { getNotifications, getNotificationJobs, retryNotificationJob } from "@/lib/api/notifications";
import { toast } from "sonner";
import { format } from "date-fns";
import Logo from "@/components/Logo";

export default function Notifications() {
  const [refreshing, setRefreshing] = useState<string | null>(null);

  const { data: notifications, isLoading: notificationsLoading, refetch: refetchNotifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
  });

  const { data: jobs, isLoading: jobsLoading, refetch: refetchJobs } = useQuery({
    queryKey: ["notification-jobs"],
    queryFn: getNotificationJobs,
  });

  const handleRetry = async (jobId: string) => {
    try {
      setRefreshing(jobId);
      await retryNotificationJob(jobId);
      toast.success("Job queued for retry");
      refetchJobs();
    } catch (error) {
      console.error("Error retrying job:", error);
      toast.error("Failed to retry job");
    } finally {
      setRefreshing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Sent</Badge>;
      case 'queued':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Queued</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      case 'canceled':
        return <Badge variant="outline">Canceled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getChannelIcon = (channel: string) => {
    return channel === 'email' ? (
      <Mail className="h-4 w-4 text-muted-foreground" />
    ) : (
      <MessageSquare className="h-4 w-4 text-muted-foreground" />
    );
  };

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
                <h1 className="text-xl font-bold">Notification Management</h1>
                <p className="text-sm text-muted-foreground">Monitor notification delivery and manage scheduled messages</p>
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
          <CardTitle>Notification Management</CardTitle>
          <CardDescription>
            Monitor notification delivery and manage scheduled messages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="logs">
            <TabsList>
              <TabsTrigger value="logs">Delivery Logs</TabsTrigger>
              <TabsTrigger value="queue">Job Queue</TabsTrigger>
            </TabsList>

            <TabsContent value="logs" className="space-y-4">
              {notificationsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
               ) : (
                <div className="border rounded-lg overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Channel</TableHead>
                        <TableHead>Template</TableHead>
                        <TableHead>Sent At</TableHead>
                        <TableHead>Provider ID</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {notifications?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                            No notifications sent yet
                          </TableCell>
                        </TableRow>
                      ) : (
                        notifications?.map((notification) => (
                          <TableRow key={notification.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getChannelIcon(notification.channel)}
                                <span className="capitalize">{notification.channel}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <code className="text-xs bg-muted px-2 py-1 rounded">
                                {notification.template}
                              </code>
                            </TableCell>
                            <TableCell>
                              {notification.sent_at 
                                ? format(new Date(notification.sent_at), 'MMM d, yyyy HH:mm')
                                : '-'}
                            </TableCell>
                            <TableCell>
                              <span className="text-xs text-muted-foreground">
                                {notification.provider_message_id || '-'}
                              </span>
                            </TableCell>
                            <TableCell>
                              {notification.error ? (
                                <div className="flex flex-col gap-1">
                                  <Badge variant="destructive">Error</Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {notification.error}
                                  </span>
                                </div>
                              ) : (
                                <Badge className="bg-green-500">Success</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="queue" className="space-y-4">
              {jobsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
               ) : (
                <div className="border rounded-lg overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Channel</TableHead>
                        <TableHead>Template</TableHead>
                        <TableHead>Scheduled For</TableHead>
                        <TableHead>Attempts</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {jobs?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground">
                            No jobs in queue
                          </TableCell>
                        </TableRow>
                      ) : (
                        jobs?.map((job) => (
                          <TableRow key={job.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getChannelIcon(job.channel)}
                                <span className="capitalize">{job.channel}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <code className="text-xs bg-muted px-2 py-1 rounded">
                                {job.template}
                              </code>
                            </TableCell>
                            <TableCell>
                              {format(new Date(job.scheduled_for), 'MMM d, yyyy HH:mm')}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{job.attempts}/5</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                {getStatusBadge(job.status)}
                                {job.last_error && (
                                  <span className="text-xs text-muted-foreground">
                                    {job.last_error}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {job.status === 'failed' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRetry(job.id)}
                                  disabled={refreshing === job.id}
                                >
                                  {refreshing === job.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <>
                                      <RefreshCw className="h-4 w-4 mr-1" />
                                      Retry
                                    </>
                                  )}
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      </main>
    </div>
  );
}
