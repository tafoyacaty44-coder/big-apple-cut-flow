import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { GoldButton } from '@/components/ui/gold-button';
import { useToast } from '@/hooks/use-toast';
import { getVipSettings, updateVipSettings } from '@/lib/api/vip';

export const VipPricingPanel = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: vipSettings, isLoading } = useQuery({
    queryKey: ['vip-settings'],
    queryFn: getVipSettings,
  });

  const [enabled, setEnabled] = useState(vipSettings?.enabled || false);
  const [vipCode, setVipCode] = useState(vipSettings?.vip_code || '111');

  const updateMutation = useMutation({
    mutationFn: () => updateVipSettings(enabled, vipCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vip-settings'] });
      toast({
        title: 'Success',
        description: 'VIP settings updated successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update VIP settings',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate();
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>VIP Pricing</CardTitle>
        <CardDescription>Configure VIP pricing and code settings</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enable-vip">Enable VIP Price</Label>
              <p className="text-sm text-muted-foreground">
                Allow customers to use VIP pricing with a code
              </p>
            </div>
            <Switch
              id="enable-vip"
              checked={enabled}
              onCheckedChange={setEnabled}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vip-code">VIP Code</Label>
            <Input
              id="vip-code"
              type="text"
              value={vipCode}
              onChange={(e) => setVipCode(e.target.value)}
              placeholder="Enter VIP code"
              disabled={!enabled}
            />
            <p className="text-sm text-muted-foreground">
              Customers will enter this code during booking to get VIP prices
            </p>
          </div>

          <GoldButton type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Saving...' : 'Submit Now'}
          </GoldButton>
        </form>
      </CardContent>
    </Card>
  );
};
