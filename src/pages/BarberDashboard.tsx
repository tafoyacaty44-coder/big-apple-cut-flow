import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { getBarberProfile } from '@/lib/api/barber';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { DashboardStats } from '@/components/barber/DashboardStats';
import { AppointmentsList } from '@/components/barber/AppointmentsList';
import { WeeklyCalendar } from '@/components/barber/WeeklyCalendar';
import { MyAvailability } from '@/components/barber/MyAvailability';

const BarberDashboard = () => {
  const { user, signOut } = useAuth();
  const [barberId, setBarberId] = useState<string | null>(null);

  const { data: barberProfile } = useQuery({
    queryKey: ['barber-profile', user?.id],
    queryFn: () => getBarberProfile(user!.id),
    enabled: !!user,
  });

  useEffect(() => {
    if (barberProfile) {
      setBarberId(barberProfile.id);
    }
  }, [barberProfile]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo />
            <div>
              <h1 className="text-xl font-bold">Barber Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                {barberProfile?.full_name || 'Loading...'}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {!barberId ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your dashboard...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome back!</h2>
              <p className="text-muted-foreground">Here's your schedule overview</p>
            </div>

            {/* Stats */}
            <DashboardStats barberId={barberId} />

            {/* Today's Appointments */}
            <AppointmentsList barberId={barberId} />

            {/* Weekly Calendar */}
            <WeeklyCalendar barberId={barberId} />

            {/* My Availability */}
            <MyAvailability barberId={barberId} />
          </div>
        )}
      </main>
    </div>
  );
};

export default BarberDashboard;
