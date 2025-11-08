import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { getBarberProfile } from '@/lib/api/barber';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, LayoutDashboard, Calendar, Coffee, CalendarClock, Users } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { DashboardStats } from '@/components/barber/DashboardStats';
import { AppointmentsList } from '@/components/barber/AppointmentsList';
import { WeeklyCalendar } from '@/components/barber/WeeklyCalendar';
import { MyAvailability } from '@/components/barber/MyAvailability';

const BarberDashboard = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
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
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-full mx-auto px-4 py-3 md:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
              <Logo variant="dark" />
              <div className="min-w-0">
                <h1 className="text-lg md:text-xl font-bold truncate">Barber Dashboard</h1>
                <p className="text-xs md:text-sm text-muted-foreground truncate">
                  {barberProfile?.full_name || 'Loading...'}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={signOut} className="touch-target flex-shrink-0 w-full sm:w-auto">
              <LogOut className="mr-2 h-4 w-4" />
              <span className="sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-full mx-auto px-4 py-4 md:py-8 overflow-x-hidden">
        {!barberId ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your dashboard...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 md:space-y-8">
            <div>
              <h2 className="text-xl md:text-2xl font-bold mb-2">Welcome back, {barberProfile?.full_name}!</h2>
              <p className="text-sm md:text-base text-muted-foreground">Here's your dashboard overview</p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link to="/barber/my-schedule">
                <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Coffee className="h-5 w-5" />
                      Request Break Time
                    </CardTitle>
                    <CardDescription>
                      Submit a request for break times or time off
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link to="/barber/my-schedule">
                <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarClock className="h-5 w-5" />
                      View Schedule Requests
                    </CardTitle>
                    <CardDescription>
                      Check the status of your submitted requests
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </div>
            
            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 md:gap-3">
              <Link to="/barber">
                <Button variant={location.pathname === '/barber' ? 'default' : 'outline'}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <Link to="/barber/my-schedule">
                <Button variant={location.pathname === '/barber/my-schedule' ? 'default' : 'outline'}>
                  <Calendar className="mr-2 h-4 w-4" />
                  My Schedule
                </Button>
              </Link>
              <Link to="/barber/my-clients">
                <Button variant={location.pathname === '/barber/my-clients' ? 'default' : 'outline'}>
                  <Users className="mr-2 h-4 w-4" />
                  My Clients
                </Button>
              </Link>
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
