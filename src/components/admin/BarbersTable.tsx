import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBarbers } from '@/lib/api/barbers';
import { deleteBarber } from '@/lib/api/admin';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Edit, User, Trash2 } from 'lucide-react';
import { CreateBarberDialog } from './CreateBarberDialog';
import { EditBarberDialog } from './EditBarberDialog';
import { BarberAvailabilityDialog } from './BarberAvailabilityDialog';
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
import { toast } from 'sonner';

interface Barber {
  id: string;
  user_id: string | null;
  full_name: string;
  bio: string | null;
  specialties: string[];
  years_experience: number | null;
  profile_image_url: string | null;
  is_active: boolean;
  created_at: string;
}

export const BarbersTable = () => {
  const [editingBarber, setEditingBarber] = useState<Barber | null>(null);
  const [availabilityBarber, setAvailabilityBarber] = useState<Barber | null>(null);
  const [deletingBarber, setDeletingBarber] = useState<Barber | null>(null);
  const queryClient = useQueryClient();

  const { data: barbers, isLoading } = useQuery({
    queryKey: ['barbers'],
    queryFn: getBarbers,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBarber,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barbers'] });
      toast.success('Barber deleted successfully');
      setDeletingBarber(null);
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete barber: ${error.message}`);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">Barber Management</h2>
          <p className="text-xs md:text-sm text-muted-foreground">
            Manage barber profiles and schedules
          </p>
        </div>
        <CreateBarberDialog />
      </div>

      <div className="border rounded-lg overflow-x-auto -mx-4 md:mx-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Name</TableHead>
              <TableHead className="hidden md:table-cell whitespace-nowrap">Experience</TableHead>
              <TableHead className="hidden lg:table-cell whitespace-nowrap">Specialties</TableHead>
              <TableHead className="whitespace-nowrap">Status</TableHead>
              <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {barbers?.map((barber) => (
              <TableRow key={barber.id}>
                <TableCell className="whitespace-nowrap">
                  <div className="flex items-center gap-2 md:gap-3">
                    {barber.profile_image_url ? (
                      <img
                        src={barber.profile_image_url}
                        alt={barber.full_name}
                        className="h-8 w-8 md:h-10 md:w-10 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="font-medium truncate">{barber.full_name}</div>
                      {barber.bio && (
                        <div className="text-xs md:text-sm text-muted-foreground line-clamp-1 hidden sm:block">
                          {barber.bio}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell whitespace-nowrap">
                  {barber.years_experience
                    ? `${barber.years_experience} years`
                    : 'New'}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {barber.specialties?.slice(0, 2).map((specialty, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                    {barber.specialties?.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{barber.specialties.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <Badge variant={barber.is_active ? 'default' : 'secondary'}>
                    {barber.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  <div className="flex gap-1 md:gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingBarber(barber)}
                      className="touch-target"
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAvailabilityBarber(barber)}
                      className="touch-target"
                    >
                      <Calendar className="h-4 w-4" />
                      <span className="sr-only">Schedule</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingBarber(barber)}
                      className="touch-target text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editingBarber && (
        <EditBarberDialog
          barber={editingBarber}
          open={!!editingBarber}
          onOpenChange={(open) => !open && setEditingBarber(null)}
        />
      )}

      {availabilityBarber && (
        <BarberAvailabilityDialog
          barber={availabilityBarber}
          open={!!availabilityBarber}
          onOpenChange={(open) => !open && setAvailabilityBarber(null)}
        />
      )}

      <AlertDialog open={!!deletingBarber} onOpenChange={(open) => !open && setDeletingBarber(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Barber</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deletingBarber?.full_name}? They will be deactivated and removed from the booking system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingBarber && deleteMutation.mutate(deletingBarber.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
