import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Check } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface BarberDetailsDialogProps {
  barber: {
    id: string;
    full_name: string;
    profile_image_url?: string;
    years_experience: number;
    specialties?: string[];
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BarberDetailsDialog = ({
  barber,
  open,
  onOpenChange,
}: BarberDetailsDialogProps) => {
  const isMobile = useIsMobile();

  if (!barber) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const content = (
    <div className="space-y-6">
      {/* Avatar */}
      <div className="flex justify-center">
        <div className="w-32 h-32 rounded-full bg-[hsl(var(--accent))]/20 border-4 border-[hsl(var(--accent))] flex items-center justify-center text-4xl font-bold text-[hsl(var(--accent))] overflow-hidden">
          {barber.profile_image_url ? (
            <img
              src={barber.profile_image_url}
              alt={barber.full_name}
              className="w-full h-full object-cover"
            />
          ) : (
            getInitials(barber.full_name)
          )}
        </div>
      </div>

      {/* Name and Experience */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-[hsl(var(--accent))]">
          {barber.full_name}
        </h2>
        <p className="text-sm text-muted-foreground">
          {barber.years_experience} years of experience
        </p>
      </div>

      {/* Specialties */}
      {barber.specialties && barber.specialties.length > 0 && (
        <div className="space-y-3">
          <div className="relative">
            <h3 className="text-lg font-semibold text-foreground inline-block">
              Specialities
            </h3>
            <div className="h-0.5 w-16 bg-[hsl(var(--accent))] mt-1"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {barber.specialties.map((specialty, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-sm"
              >
                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="text-foreground">{specialty}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="max-h-[85vh]">
          <SheetHeader>
            <SheetTitle className="sr-only">Barber Details</SheetTitle>
          </SheetHeader>
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="sr-only">Barber Details</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
};
