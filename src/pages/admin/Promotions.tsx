import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Send, Users, BarChart3, Calendar } from "lucide-react";
import { getCampaigns } from "@/lib/api/promotions";
import { PromotionalCampaignForm } from "@/components/admin/PromotionalCampaignForm";
import { CampaignsTable } from "@/components/admin/CampaignsTable";

export default function Promotions() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | undefined>();

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

  return (
    <div className="min-h-screen bg-background pt-20">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">Promotional Campaigns</h1>
            <p className="text-muted-foreground mt-2">
              Send targeted email and SMS campaigns to your customers
            </p>
          </div>
          <Button onClick={handleCreate} size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Create Campaign
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
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
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">All ({allCampaigns.length})</TabsTrigger>
                <TabsTrigger value="draft">Drafts ({draftCampaigns.length})</TabsTrigger>
                <TabsTrigger value="scheduled">Scheduled ({scheduledCampaigns.length})</TabsTrigger>
                <TabsTrigger value="sent">Sent ({sentCampaigns.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6">
                <CampaignsTable 
                  campaigns={allCampaigns} 
                  isLoading={isLoading}
                  onEdit={handleEdit}
                />
              </TabsContent>

              <TabsContent value="draft" className="mt-6">
                <CampaignsTable 
                  campaigns={draftCampaigns} 
                  isLoading={isLoading}
                  onEdit={handleEdit}
                />
              </TabsContent>

              <TabsContent value="scheduled" className="mt-6">
                <CampaignsTable 
                  campaigns={scheduledCampaigns} 
                  isLoading={isLoading}
                  onEdit={handleEdit}
                />
              </TabsContent>

              <TabsContent value="sent" className="mt-6">
                <CampaignsTable 
                  campaigns={sentCampaigns} 
                  isLoading={isLoading}
                  onEdit={handleEdit}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <PromotionalCampaignForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        campaignId={selectedCampaignId}
      />
    </div>
  );
}
