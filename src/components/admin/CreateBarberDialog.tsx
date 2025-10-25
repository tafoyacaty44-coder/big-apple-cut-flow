import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createBarberAccount } from '@/lib/api/admin';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { UserPlus } from 'lucide-react';

export const CreateBarberDialog = () => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    bio: '',
    specialties: '',
    yearsExperience: '',
  });

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: () =>
      createBarberAccount({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        bio: formData.bio || undefined,
        specialties: formData.specialties
          ? formData.specialties.split(',').map(s => s.trim())
          : undefined,
        yearsExperience: formData.yearsExperience
          ? parseInt(formData.yearsExperience)
          : undefined,
      }),
    onSuccess: () => {
      toast.success('Barber account created successfully');
      queryClient.invalidateQueries({ queryKey: ['barbers'] });
      setOpen(false);
      setFormData({
        email: '',
        password: '',
        fullName: '',
        bio: '',
        specialties: '',
        yearsExperience: '',
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create barber account');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password || !formData.fullName) {
      toast.error('Email, password, and full name are required');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    createMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Barber
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Barber Account</DialogTitle>
          <DialogDescription>
            Create a new barber account with login credentials and profile
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
            <Label htmlFor="email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="barber@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              Password <span className="text-destructive">*</span>
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="Minimum 6 characters"
              required
              minLength={6}
            />
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

          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Barber'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
