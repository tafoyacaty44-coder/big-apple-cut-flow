import { VipPricingPanel } from '@/components/admin/VipPricingPanel';
import { ServiceVipPricesTable } from '@/components/admin/ServiceVipPricesTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, DollarSign } from 'lucide-react';

const VipPricing = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">VIP Pricing</h1>
          <p className="text-muted-foreground">
            Manage VIP pricing settings and service-specific VIP prices
          </p>
        </div>

        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="settings">
              <Settings className="mr-2 h-4 w-4" />
              VIP Settings
            </TabsTrigger>
            <TabsTrigger value="prices">
              <DollarSign className="mr-2 h-4 w-4" />
              Service VIP Prices
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="mt-6">
            <VipPricingPanel />
          </TabsContent>

          <TabsContent value="prices" className="mt-6">
            <ServiceVipPricesTable />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VipPricing;
