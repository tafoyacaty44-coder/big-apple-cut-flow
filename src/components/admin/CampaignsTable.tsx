import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Copy, Trash2, Pause, X, Mail, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { PromotionalCampaign, deleteCampaign, duplicateCampaign, pauseCampaign, cancelCampaign } from "@/lib/api/promotions";
import { format } from "date-fns";

interface Props {
  campaigns: PromotionalCampaign[];
  isLoading: boolean;
  onEdit: (id: string) => void;
}

export function CampaignsTable({ campaigns, isLoading, onEdit }: Props) {
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: deleteCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotional-campaigns'] });
      toast.success("Campaign deleted");
      setDeleteDialogOpen(false);
    },
    onError: () => {
      toast.error("Failed to delete campaign");
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: duplicateCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotional-campaigns'] });
      toast.success("Campaign duplicated");
    },
    onError: () => {
      toast.error("Failed to duplicate campaign");
    },
  });

  const pauseMutation = useMutation({
    mutationFn: pauseCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotional-campaigns'] });
      toast.success("Campaign paused");
    },
    onError: () => {
      toast.error("Failed to pause campaign");
    },
  });

  const cancelMutation = useMutation({
    mutationFn: cancelCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotional-campaigns'] });
      toast.success("Campaign canceled");
    },
    onError: () => {
      toast.error("Failed to cancel campaign");
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      draft: "secondary",
      scheduled: "outline",
      sending: "default",
      sent: "default",
      paused: "secondary",
      canceled: "destructive",
    };

    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const getChannelIcon = (channel: string) => {
    if (channel === 'email') return <Mail className="h-4 w-4" />;
    if (channel === 'sms') return <MessageSquare className="h-4 w-4" />;
    return (
      <div className="flex gap-1">
        <Mail className="h-4 w-4" />
        <MessageSquare className="h-4 w-4" />
      </div>
    );
  };

  const handleDelete = (id: string) => {
    setSelectedCampaignId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedCampaignId) {
      deleteMutation.mutate(selectedCampaignId);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading campaigns...</div>;
  }

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No campaigns found</p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Campaign</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Channel</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Recipients</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => (
            <TableRow key={campaign.id}>
              <TableCell>
                <div>
                  <p className="font-medium">{campaign.title}</p>
                  {campaign.promo_code && (
                    <p className="text-xs text-muted-foreground">
                      Code: {campaign.promo_code}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {campaign.type}
                </Badge>
              </TableCell>
              <TableCell>{getChannelIcon(campaign.channel)}</TableCell>
              <TableCell>{getStatusBadge(campaign.status)}</TableCell>
              <TableCell>
                <div className="text-sm">
                  {campaign.sent_count > 0 ? (
                    <>
                      <span className="font-medium">{campaign.sent_count}</span>
                      <span className="text-muted-foreground">/{campaign.total_recipients}</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">{campaign.total_recipients || 0}</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {campaign.sent_at ? (
                  <span className="text-sm">{format(new Date(campaign.sent_at), 'MMM d, yyyy')}</span>
                ) : campaign.scheduled_for ? (
                  <span className="text-sm">{format(new Date(campaign.scheduled_for), 'MMM d, yyyy')}</span>
                ) : (
                  <span className="text-sm text-muted-foreground">Draft</span>
                )}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {(campaign.status === 'draft' || campaign.status === 'scheduled') && (
                      <DropdownMenuItem onClick={() => onEdit(campaign.id)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => duplicateMutation.mutate(campaign.id)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    {campaign.status === 'sending' && (
                      <DropdownMenuItem onClick={() => pauseMutation.mutate(campaign.id)}>
                        <Pause className="mr-2 h-4 w-4" />
                        Pause
                      </DropdownMenuItem>
                    )}
                    {(campaign.status === 'scheduled' || campaign.status === 'sending') && (
                      <DropdownMenuItem onClick={() => cancelMutation.mutate(campaign.id)}>
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </DropdownMenuItem>
                    )}
                    {campaign.status === 'draft' && (
                      <DropdownMenuItem 
                        onClick={() => handleDelete(campaign.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this campaign? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
