import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { GoldButton } from '@/components/ui/gold-button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';

interface RewardAction {
  id: string;
  code: string;
  description: string | null;
  points: number;
  is_active: boolean;
}

export const RewardActionsTable = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<RewardAction | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    points: 10,
    is_active: true
  });

  const { data: actions, isLoading } = useQuery({
    queryKey: ['reward-actions-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reward_actions')
        .select('*')
        .order('points', { ascending: false });
      if (error) throw error;
      return data as RewardAction[];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('reward_actions')
        .insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reward-actions-admin'] });
      toast.success('Reward action created');
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create reward action');
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from('reward_actions')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reward-actions-admin'] });
      toast.success('Reward action updated');
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update reward action');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('reward_actions')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reward-actions-admin'] });
      toast.success('Reward action deleted');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete reward action');
    }
  });

  const handleOpenDialog = (action?: RewardAction) => {
    if (action) {
      setEditingAction(action);
      setFormData({
        code: action.code,
        description: action.description || '',
        points: action.points,
        is_active: action.is_active
      });
    } else {
      setEditingAction(null);
      setFormData({
        code: '',
        description: '',
        points: 10,
        is_active: true
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingAction(null);
  };

  const handleSubmit = () => {
    if (editingAction) {
      updateMutation.mutate({ id: editingAction.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this reward action?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Reward Actions</h3>
        <GoldButton onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Action
        </GoldButton>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Points</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {actions && actions.length > 0 ? (
            actions.map((action) => (
              <TableRow key={action.id}>
                <TableCell className="font-mono text-sm">{action.code}</TableCell>
                <TableCell>{action.description}</TableCell>
                <TableCell>
                  <Badge variant="secondary">+{action.points} pts</Badge>
                </TableCell>
                <TableCell>
                  {action.is_active ? (
                    <Badge variant="default">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <GoldButton
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenDialog(action)}
                  >
                    <Edit className="w-4 h-4" />
                  </GoldButton>
                  <GoldButton
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(action.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </GoldButton>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No reward actions found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAction ? 'Edit Reward Action' : 'Create Reward Action'}
            </DialogTitle>
            <DialogDescription>
              Define how customers can earn points
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                placeholder="HAIRCUT_COMPLETED"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/ /g, '_') })}
                disabled={!!editingAction}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="What earns these points?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="points">Points</Label>
              <Input
                id="points"
                type="number"
                min="1"
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">Active</Label>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <GoldButton variant="outline" onClick={handleCloseDialog}>
              Cancel
            </GoldButton>
            <GoldButton onClick={handleSubmit}>
              {editingAction ? 'Update' : 'Create'}
            </GoldButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
