import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { GoldButton } from '@/components/ui/gold-button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface RewardTier {
  id: string;
  name: string;
  min_points: number;
  discount_percent: number;
  benefits: string[] | null;
  display_order: number;
}

export const RewardTiersTable = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<RewardTier | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    min_points: 100,
    discount_percent: 10,
    benefits: '',
    display_order: 1
  });

  const { data: tiers, isLoading } = useQuery({
    queryKey: ['reward-tiers-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reward_tiers')
        .select('*')
        .order('min_points', { ascending: true });
      if (error) throw error;
      return data as RewardTier[];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('reward_tiers')
        .insert([{
          ...data,
          benefits: data.benefits ? data.benefits.split('\n').filter((b: string) => b.trim()) : []
        }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reward-tiers-admin'] });
      toast.success('Reward tier created');
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create reward tier');
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from('reward_tiers')
        .update({
          ...data,
          benefits: data.benefits ? data.benefits.split('\n').filter((b: string) => b.trim()) : []
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reward-tiers-admin'] });
      toast.success('Reward tier updated');
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update reward tier');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('reward_tiers')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reward-tiers-admin'] });
      toast.success('Reward tier deleted');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete reward tier');
    }
  });

  const handleOpenDialog = (tier?: RewardTier) => {
    if (tier) {
      setEditingTier(tier);
      setFormData({
        name: tier.name,
        min_points: tier.min_points,
        discount_percent: tier.discount_percent,
        benefits: tier.benefits?.join('\n') || '',
        display_order: tier.display_order
      });
    } else {
      setEditingTier(null);
      setFormData({
        name: '',
        min_points: 100,
        discount_percent: 10,
        benefits: '',
        display_order: (tiers?.length || 0) + 1
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTier(null);
  };

  const handleSubmit = () => {
    if (editingTier) {
      updateMutation.mutate({ id: editingTier.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this reward tier?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Reward Tiers</h3>
        <GoldButton onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Tier
        </GoldButton>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tier Name</TableHead>
            <TableHead>Min Points</TableHead>
            <TableHead>Discount</TableHead>
            <TableHead>Benefits</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tiers && tiers.length > 0 ? (
            tiers.map((tier) => (
              <TableRow key={tier.id}>
                <TableCell className="font-semibold flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-accent" />
                  {tier.name}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{tier.min_points} pts</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="default">{tier.discount_percent}% off</Badge>
                </TableCell>
                <TableCell className="text-sm">
                  {tier.benefits && tier.benefits.length > 0 ? (
                    <ul className="list-disc list-inside">
                      {tier.benefits.slice(0, 2).map((benefit, idx) => (
                        <li key={idx}>{benefit}</li>
                      ))}
                      {tier.benefits.length > 2 && <li>+{tier.benefits.length - 2} more</li>}
                    </ul>
                  ) : (
                    <span className="text-muted-foreground">No benefits listed</span>
                  )}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <GoldButton
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenDialog(tier)}
                  >
                    <Edit className="w-4 h-4" />
                  </GoldButton>
                  <GoldButton
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(tier.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </GoldButton>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No reward tiers found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTier ? 'Edit Reward Tier' : 'Create Reward Tier'}
            </DialogTitle>
            <DialogDescription>
              Define tier levels and their benefits
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Tier Name</Label>
              <Input
                id="name"
                placeholder="Bronze Tier"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="min_points">Minimum Points</Label>
                <Input
                  id="min_points"
                  type="number"
                  min="0"
                  value={formData.min_points}
                  onChange={(e) => setFormData({ ...formData, min_points: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div>
                <Label htmlFor="discount_percent">Discount %</Label>
                <Input
                  id="discount_percent"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.discount_percent}
                  onChange={(e) => setFormData({ ...formData, discount_percent: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="benefits">Benefits (one per line)</Label>
              <Textarea
                id="benefits"
                placeholder="10% off all services&#10;Priority booking&#10;Birthday bonus"
                rows={4}
                value={formData.benefits}
                onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="display_order">Display Order</Label>
              <Input
                id="display_order"
                type="number"
                min="1"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>

          <DialogFooter>
            <GoldButton variant="outline" onClick={handleCloseDialog}>
              Cancel
            </GoldButton>
            <GoldButton onClick={handleSubmit}>
              {editingTier ? 'Update' : 'Create'}
            </GoldButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
