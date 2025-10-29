import { VipPricingPanel } from '@/components/admin/VipPricingPanel';
import { ServiceVipPricesTable } from '@/components/admin/ServiceVipPricesTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, DollarSign } from 'lucide-react';

const VipPricing = () => {
  return (
    <div className="min-h-screen bg-background p-4 md:p-6 overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">VIP Pricing</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage VIP pricing settings and service-specific VIP prices
          </p>
        </div>

        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-auto">
            <TabsTrigger value="settings" className="text-xs sm:text-sm py-2 sm:py-3">
              <Settings className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">VIP Settings</span>
              <span className="sm:hidden">Settings</span>
            </TabsTrigger>
            <TabsTrigger value="prices" className="text-xs sm:text-sm py-2 sm:py-3">
              <DollarSign className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Service VIP Prices</span>
              <span className="sm:hidden">Prices</span>
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
