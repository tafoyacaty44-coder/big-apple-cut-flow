import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateBarberProfile, deleteBarber } from '@/lib/api/admin';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { ImageUpload } from './ImageUpload';

interface Barber {
  id: string;
  full_name: string;
  bio: string | null;
  specialties: string[];
  years_experience: number | null;
  profile_image_url: string | null;
  is_active: boolean;
  status_message?: string | null;
}

interface EditBarberDialogProps {
  barber: Barber;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditBarberDialog = ({
  barber,
  open,
  onOpenChange,
}: EditBarberDialogProps) => {
  const [formData, setFormData] = useState({
    fullName: barber.full_name,
    bio: barber.bio || '',
    specialties: barber.specialties?.join(', ') || '',
    yearsExperience: barber.years_experience?.toString() || '',
    isActive: barber.is_active,
    profileImageUrl: barber.profile_image_url || '',
    statusMessage: barber.status_message || '',
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    setFormData({
      fullName: barber.full_name,
      bio: barber.bio || '',
      specialties: barber.specialties?.join(', ') || '',
      yearsExperience: barber.years_experience?.toString() || '',
      isActive: barber.is_active,
      profileImageUrl: barber.profile_image_url || '',
      statusMessage: barber.status_message || '',
    });
  }, [barber]);

  const updateMutation = useMutation({
    mutationFn: () =>
      updateBarberProfile(barber.id, {
        full_name: formData.fullName,
        bio: formData.bio || null,
        specialties: formData.specialties
          ? formData.specialties.split(',').map(s => s.trim())
          : [],
        years_experience: formData.yearsExperience
          ? parseInt(formData.yearsExperience)
          : null,
        is_active: formData.isActive,
        profile_image_url: formData.profileImageUrl || null,
        status_message: formData.statusMessage || null,
      }),
    onSuccess: () => {
      toast.success('Barber profile updated successfully');
      queryClient.invalidateQueries({ queryKey: ['barbers'] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update barber profile');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteBarber(barber.id),
    onSuccess: () => {
      toast.success('Barber deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['barbers'] });
      setShowDeleteDialog(false);
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete barber');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName) {
      toast.error('Full name is required');
      return;
    }

    updateMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Barber Profile</DialogTitle>
          <DialogDescription>
            Update barber information and status
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                placeholder="John Smith"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="yearsExperience">Years of Experience</Label>
              <Input
                id="yearsExperience"
                type="number"
                min="0"
                value={formData.yearsExperience}
                onChange={(e) =>
                  setFormData({ ...formData, yearsExperience: e.target.value })
                }
                placeholder="5"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              placeholder="Tell us about your experience and style..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialties">Specialties</Label>
            <Input
              id="specialties"
              value={formData.specialties}
              onChange={(e) =>
                setFormData({ ...formData, specialties: e.target.value })
              }
              placeholder="Fades, Beard Trimming, Classic Cuts (comma-separated)"
            />
            <p className="text-xs text-muted-foreground">
              Enter multiple specialties separated by commas
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="statusMessage">Status Message</Label>
            <Input
              id="statusMessage"
              value={formData.statusMessage}
              onChange={(e) =>
                setFormData({ ...formData, statusMessage: e.target.value })
              }
              placeholder="e.g., 'Working evenings this week', 'Back from vacation!'"
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground">
              Optional message displayed on barber's booking card (max 100 characters)
            </p>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="isActive">Active Status</Label>
              <p className="text-sm text-muted-foreground">
                Inactive barbers won't appear in booking
              </p>
            </div>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isActive: checked })
              }
            />
          </div>

          <ImageUpload
            currentImageUrl={formData.profileImageUrl}
            onImageUploaded={(url) => setFormData({ ...formData, profileImageUrl: url })}
            bucketName="avatars"
            folder="barbers/"
            label="Profile Picture"
          />

          <Separator className="my-6" />

          <div className="space-y-2 p-4 border border-destructive/30 rounded-lg bg-destructive/5">
            <div className="space-y-1">
              <Label className="text-destructive font-semibold">Danger Zone</Label>
              <p className="text-sm text-muted-foreground">
                This will deactivate the barber. They won't appear in bookings anymore.
              </p>
            </div>
            <Button
              type="button"
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              className="w-full"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Barber
            </Button>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Updating...' : 'Update Barber'}
            </Button>
          </div>
        </form>
      </DialogContent>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will deactivate <strong>{barber.full_name}</strong> and they will no longer appear in the booking system. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Barber'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};
