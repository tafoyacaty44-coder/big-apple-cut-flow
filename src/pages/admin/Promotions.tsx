import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Send, Users, BarChart3, Calendar, ArrowLeft, LogOut } from "lucide-react";
import { getCampaigns } from "@/lib/api/promotions";
import { PromotionalCampaignForm } from "@/components/admin/PromotionalCampaignForm";
import { CampaignsTable } from "@/components/admin/CampaignsTable";
import { CampaignDetailsDialog } from "@/components/admin/CampaignDetailsDialog";
import Logo from "@/components/Logo";

export default function Promotions() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | undefined>();
  const [detailsCampaignId, setDetailsCampaignId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { data: allCampaigns = [], isLoading } = useQuery({
    queryKey: ['promotional-campaigns'],
    queryFn: () => getCampaigns(),
  });

  const draftCampaigns = allCampaigns.filter(c => c.status === 'draft');
  const scheduledCampaigns = allCampaigns.filter(c => c.status === 'scheduled');
  const sentCampaigns = allCampaigns.filter(c => c.status === 'sent');

  const totalSent = sentCampaigns.reduce((sum, c) => sum + c.sent_count, 0);
  const avgClickRate = sentCampaigns.length > 0
    ? sentCampaigns.reduce((sum, c) => sum + (c.click_through_count / (c.sent_count || 1)), 0) / sentCampaigns.length * 100
    : 0;

  const handleEdit = (id: string) => {
    setSelectedCampaignId(id);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setSelectedCampaignId(undefined);
    setIsFormOpen(true);
  };

  const handleQuickSend = (template: 'all' | 'email' | 'sms') => {
    setSelectedCampaignId(undefined);
    setIsFormOpen(true);
    // The form will handle pre-filling based on template type
  };

  const handleViewDetails = (id: string) => {
    setDetailsCampaignId(id);
    setIsDetailsOpen(true);
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
                <h1 className="text-xl font-bold">Promotional Campaigns</h1>
                <p className="text-sm text-muted-foreground">Send targeted email and SMS campaigns to your customers</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Create Campaign
              </Button>
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

        {/* Quick Action Templates */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
          <Card 
            className="cursor-pointer hover:border-[hsl(var(--accent))] hover:shadow-lg transition-all"
            onClick={() => handleQuickSend('all')}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-[hsl(var(--accent))]/10">
                  <Send className="h-6 w-6 text-[hsl(var(--accent))]" />
                </div>
                <div>
                  <CardTitle className="text-lg">Blast All Customers</CardTitle>
                  <CardDescription>Email + SMS to everyone</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card 
            className="cursor-pointer hover:border-blue-500 hover:shadow-lg transition-all"
            onClick={() => handleQuickSend('email')}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <Send className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">Email Everyone</CardTitle>
                  <CardDescription>Send email to all customers</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card 
            className="cursor-pointer hover:border-green-500 hover:shadow-lg transition-all"
            onClick={() => handleQuickSend('sms')}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <Send className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">Text Everyone</CardTitle>
                  <CardDescription>Send SMS to all customers</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allCampaigns.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {sentCampaigns.length} sent
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSent.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Messages sent
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg Click Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgClickRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                Promo code usage
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{scheduledCampaigns.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Upcoming sends
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Campaigns Table with Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Campaigns</CardTitle>
            <CardDescription>
              Manage your promotional campaigns
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <Tabs defaultValue="all">
              <div className="overflow-x-auto -mx-4 md:mx-0">
                <TabsList className="inline-flex w-full sm:w-auto min-w-max">
                  <TabsTrigger value="all" className="text-xs sm:text-sm whitespace-nowrap">All ({allCampaigns.length})</TabsTrigger>
                  <TabsTrigger value="draft" className="text-xs sm:text-sm whitespace-nowrap">Drafts ({draftCampaigns.length})</TabsTrigger>
                  <TabsTrigger value="scheduled" className="text-xs sm:text-sm whitespace-nowrap">Scheduled ({scheduledCampaigns.length})</TabsTrigger>
                  <TabsTrigger value="sent" className="text-xs sm:text-sm whitespace-nowrap">Sent ({sentCampaigns.length})</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="all" className="mt-6">
                <CampaignsTable 
                  campaigns={allCampaigns} 
                  isLoading={isLoading}
                  onEdit={handleEdit}
                  onViewDetails={handleViewDetails}
                />
              </TabsContent>

              <TabsContent value="draft" className="mt-6">
                <CampaignsTable 
                  campaigns={draftCampaigns} 
                  isLoading={isLoading}
                  onEdit={handleEdit}
                  onViewDetails={handleViewDetails}
                />
              </TabsContent>

              <TabsContent value="scheduled" className="mt-6">
                <CampaignsTable 
                  campaigns={scheduledCampaigns} 
                  isLoading={isLoading}
                  onEdit={handleEdit}
                  onViewDetails={handleViewDetails}
                />
              </TabsContent>

              <TabsContent value="sent" className="mt-6">
                <CampaignsTable 
                  campaigns={sentCampaigns} 
                  isLoading={isLoading}
                  onEdit={handleEdit}
                  onViewDetails={handleViewDetails}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        </div>
      </main>

      <PromotionalCampaignForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        campaignId={selectedCampaignId}
      />

      <CampaignDetailsDialog
        campaignId={detailsCampaignId}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
    </div>
  );
}
