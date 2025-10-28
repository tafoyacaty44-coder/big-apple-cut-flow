import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getServices } from '@/lib/api/services';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const ServiceVipPricesTable = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editedPrices, setEditedPrices] = useState<Record<string, number>>({});

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['services-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('display_order');
      if (error) throw error;
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: { id: string; vip_price: number }[]) => {
      const results = await Promise.all(
        updates.map(({ id, vip_price }) =>
          supabase
            .from('services')
            .update({ vip_price })
            .eq('id', id)
        )
      );

      const errors = results.filter(r => r.error);
      if (errors.length > 0) {
        throw new Error(`Failed to update ${errors.length} service(s)`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services-all'] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
      setEditedPrices({});
      toast({
        title: 'Success',
        description: 'VIP prices updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handlePriceChange = (serviceId: string, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      setEditedPrices(prev => ({ ...prev, [serviceId]: numValue }));
    }
  };

  const getDisplayPrice = (serviceId: string, originalPrice: number) => {
    return editedPrices[serviceId] ?? originalPrice;
  };

  const calculateDiscount = (regularPrice: number, vipPrice: number) => {
    return (((regularPrice - vipPrice) / regularPrice) * 100).toFixed(1);
  };

  const hasChanges = Object.keys(editedPrices).length > 0;

  const handleSaveAll = () => {
    const updates = Object.entries(editedPrices).map(([id, vip_price]) => ({
      id,
      vip_price,
    }));
    updateMutation.mutate(updates);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading services...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service VIP Pricing</CardTitle>
        <CardDescription>
          Set VIP prices for each service. VIP prices should typically be 10-30% lower than regular prices.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Duration</TableHead>
                <TableHead className="text-right">Regular Price</TableHead>
                <TableHead className="text-right">VIP Price</TableHead>
                <TableHead className="text-right">Discount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => {
                const vipPrice = getDisplayPrice(service.id, service.vip_price);
                const discount = calculateDiscount(service.regular_price, vipPrice);
                const isEdited = service.id in editedPrices;
                const isInvalid = vipPrice > service.regular_price;

                return (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{service.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{service.duration_minutes} min</TableCell>
                    <TableCell className="text-right font-semibold">
                      ${service.regular_price}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-sm">$</span>
                        <Input
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={vipPrice}
                          onChange={(e) => handlePriceChange(service.id, e.target.value)}
                          className={`w-24 text-right ${isEdited ? 'border-[hsl(var(--accent))]' : ''} ${isInvalid ? 'border-amber-500' : ''}`}
                        />
                        {isEdited && <Check className="h-4 w-4 text-[hsl(var(--accent))]" />}
                        {isInvalid && <AlertCircle className="h-4 w-4 text-amber-500" />}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge 
                        variant={isInvalid ? "destructive" : "secondary"}
                        className={isInvalid ? '' : 'bg-green-500/10 text-green-700 dark:text-green-400'}
                      >
                        {isInvalid ? 'Invalid' : `${discount}%`}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {hasChanges && (
          <div className="mt-6 flex items-center justify-between p-4 bg-[hsl(var(--accent))]/10 border border-[hsl(var(--accent))]/30 rounded-lg">
            <div>
              <p className="font-semibold">Unsaved Changes</p>
              <p className="text-sm text-muted-foreground">
                {Object.keys(editedPrices).length} service(s) modified
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setEditedPrices({})}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveAll}
                disabled={updateMutation.isPending}
                className="bg-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))]/90 text-black"
              >
                {updateMutation.isPending ? 'Saving...' : 'Save All Changes'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
