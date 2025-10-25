import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllBarbers } from '@/lib/api/admin';
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
import { Calendar, Edit, User } from 'lucide-react';
import { CreateBarberDialog } from './CreateBarberDialog';
import { EditBarberDialog } from './EditBarberDialog';
import { BarberAvailabilityDialog } from './BarberAvailabilityDialog';

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

  const { data: barbers, isLoading } = useQuery({
    queryKey: ['barbers'],
    queryFn: getAllBarbers,
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Barber Management</h2>
          <p className="text-sm text-muted-foreground">
            Manage barber profiles and schedules
          </p>
        </div>
        <CreateBarberDialog />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead>Specialties</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {barbers?.map((barber) => (
              <TableRow key={barber.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {barber.profile_image_url ? (
                      <img
                        src={barber.profile_image_url}
                        alt={barber.full_name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{barber.full_name}</div>
                      {barber.bio && (
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {barber.bio}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {barber.years_experience
                    ? `${barber.years_experience} years`
                    : 'New'}
                </TableCell>
                <TableCell>
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
                <TableCell>
                  <Badge variant={barber.is_active ? 'default' : 'secondary'}>
                    {barber.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingBarber(barber)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAvailabilityBarber(barber)}
                    >
                      <Calendar className="h-4 w-4" />
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
    </div>
  );
};
