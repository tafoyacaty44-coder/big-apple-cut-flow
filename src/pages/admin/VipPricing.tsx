import { VipPricingPanel } from '@/components/admin/VipPricingPanel';

const VipPricing = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">VIP Pricing</h1>
          <p className="text-muted-foreground">
            Manage VIP pricing settings and codes
          </p>
        </div>

        <VipPricingPanel />
      </div>
    </div>
  );
};

export default VipPricing;
