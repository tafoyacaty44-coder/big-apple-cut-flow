import { VipPricingPanel } from '@/components/admin/VipPricingPanel';
import { ServiceVipPricesTable } from '@/components/admin/ServiceVipPricesTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Settings, DollarSign, ArrowLeft, LogOut } from 'lucide-react';
import Logo from '@/components/Logo';

const VipPricing = () => {
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
                <h1 className="text-xl font-bold">VIP Pricing</h1>
                <p className="text-sm text-muted-foreground">Manage VIP pricing settings and service-specific VIP prices</p>
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
        <div className="space-y-6">

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
      </main>
    </div>
  );
};

export default VipPricing;
