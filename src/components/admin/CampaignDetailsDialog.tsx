import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { getCampaign, getCampaignRecipients } from "@/lib/api/promotions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { CheckCircle2, XCircle, Clock, MousePointerClick } from "lucide-react";

interface CampaignDetailsDialogProps {
  campaignId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CampaignDetailsDialog = ({ campaignId, open, onOpenChange }: CampaignDetailsDialogProps) => {
  const { data: campaign, isLoading: loadingCampaign } = useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: () => getCampaign(campaignId!),
    enabled: !!campaignId && open,
  });

  const { data: recipients = [], isLoading: loadingRecipients } = useQuery({
    queryKey: ['campaign-recipients', campaignId],
    queryFn: () => getCampaignRecipients(campaignId!),
    enabled: !!campaignId && open,
  });

  if (!campaignId) return null;

  const successRate = campaign?.total_recipients 
    ? ((campaign.sent_count / campaign.total_recipients) * 100).toFixed(1)
    : '0';

  const clickThroughRate = campaign?.sent_count
    ? ((campaign.click_through_count / campaign.sent_count) * 100).toFixed(1)
    : '0';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Campaign Analytics</DialogTitle>
        </DialogHeader>

        {loadingCampaign ? (
          <div className="space-y-4">
            <div className="h-32 bg-muted animate-pulse rounded" />
            <div className="h-64 bg-muted animate-pulse rounded" />
          </div>
        ) : campaign ? (
          <div className="space-y-6">
            {/* Campaign Info */}
            <Card>
              <CardHeader>
                <CardTitle>{campaign.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Type:</span>
                  <Badge>{campaign.type}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Channel:</span>
                  <Badge variant="outline">{campaign.channel}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge variant={campaign.status === 'sent' ? 'default' : 'secondary'}>
                    {campaign.status}
                  </Badge>
                </div>
                {campaign.sent_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Sent:</span>
                    <span className="text-sm">{format(new Date(campaign.sent_at), 'PPp')}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Recipients</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{campaign.total_recipients}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Sent</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{campaign.sent_count}</div>
                  <p className="text-xs text-muted-foreground">{successRate}% success</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Failed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{campaign.failed_count}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Click-Through</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{campaign.click_through_count}</div>
                  <p className="text-xs text-muted-foreground">{clickThroughRate}% CTR</p>
                </CardContent>
              </Card>
            </div>

            {/* Recipients Table */}
            {loadingRecipients ? (
              <div className="h-64 bg-muted animate-pulse rounded" />
            ) : recipients.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Recipients</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Channel</TableHead>
                        <TableHead>Sent At</TableHead>
                        <TableHead>Clicked</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recipients.slice(0, 50).map((recipient) => (
                        <TableRow key={recipient.id}>
                          <TableCell>
                            {recipient.status === 'sent' && (
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                <span className="text-sm">Sent</span>
                              </div>
                            )}
                            {recipient.status === 'failed' && (
                              <div className="flex items-center gap-2">
                                <XCircle className="h-4 w-4 text-red-600" />
                                <span className="text-sm">Failed</span>
                              </div>
                            )}
                            {recipient.status === 'queued' && (
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-yellow-600" />
                                <span className="text-sm">Queued</span>
                              </div>
                            )}
                            {recipient.status === 'clicked' && (
                              <div className="flex items-center gap-2">
                                <MousePointerClick className="h-4 w-4 text-blue-600" />
                                <span className="text-sm">Clicked</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{recipient.channel}</Badge>
                          </TableCell>
                          <TableCell>
                            {recipient.sent_at 
                              ? format(new Date(recipient.sent_at), 'PPp')
                              : '-'
                            }
                          </TableCell>
                          <TableCell>
                            {recipient.clicked_at 
                              ? format(new Date(recipient.clicked_at), 'PPp')
                              : '-'
                            }
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {recipients.length > 50 && (
                    <p className="text-sm text-muted-foreground mt-4 text-center">
                      Showing first 50 of {recipients.length} recipients
                    </p>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No recipient data available
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            Campaign not found
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
