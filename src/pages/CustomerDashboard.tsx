import { useAuth } from '@/hooks/useAuth';
import { GoldButton } from '@/components/ui/gold-button';
import Logo from '@/components/Logo';
import { Calendar, Gift, Clock, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getCustomerAppointments } from '@/lib/api/appointments';
import { getRewardsBalance } from '@/lib/api/rewards';

const CustomerDashboard = () => {
  const { user, signOut } = useAuth();

  // Fetch user's appointments
  const { data: appointments = [] } = useQuery({
    queryKey: ['customer-appointments', user?.id],
    queryFn: () => getCustomerAppointments(user!.id),
    enabled: !!user
  });

  // Fetch rewards balance
  const { data: rewardsBalance } = useQuery({
    queryKey: ['rewards-balance', user?.id],
    queryFn: () => getRewardsBalance(user!.id),
    enabled: !!user
  });

  // Calculate stats
  const upcomingCount = appointments.filter(apt => 
    apt.status === 'confirmed' || apt.status === 'pending'
  ).length;
  
  const historyCount = appointments.filter(apt => 
    apt.status === 'completed'
  ).length;

  const nextAppointment = appointments
    .filter(apt => apt.status === 'confirmed' || apt.status === 'pending')
    .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())[0];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <header className="border-b-2 border-border bg-card">
        <div className="max-w-full mx-auto px-4 py-3 md:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
              <Logo size="md" variant="dark" />
              <div className="min-w-0">
                <h1 className="text-lg md:text-2xl font-bold truncate">My Dashboard</h1>
                <p className="text-xs md:text-sm text-muted-foreground truncate">Big Apple Barbers</p>
              </div>
            </div>
            <GoldButton onClick={signOut} variant="outline" className="w-full sm:w-auto touch-target">
              Sign Out
            </GoldButton>
          </div>
        </div>
      </header>

      <main className="max-w-full mx-auto px-4 py-4 md:py-8 overflow-x-hidden">
        <div className="mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Welcome Back!</h2>
          <p className="text-sm md:text-base text-muted-foreground">Manage your appointments and rewards</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-card border-2 border-border rounded-lg p-6 vintage-shadow">
            <Calendar className="w-12 h-12 text-accent mb-4" />
            <h3 className="text-xl font-bold mb-2">Upcoming</h3>
            <p className="text-3xl font-bold text-accent mb-2">{upcomingCount}</p>
            <p className="text-muted-foreground text-sm">Appointments</p>
          </div>

          <div className="bg-card border-2 border-border rounded-lg p-6 vintage-shadow">
            <Gift className="w-12 h-12 text-accent mb-4" />
            <h3 className="text-xl font-bold mb-2">Rewards</h3>
            <p className="text-3xl font-bold text-accent mb-2">{rewardsBalance?.total_points || 0}</p>
            <p className="text-muted-foreground text-sm">Points</p>
          </div>

          <div className="bg-card border-2 border-border rounded-lg p-6 vintage-shadow">
            <Clock className="w-12 h-12 text-accent mb-4" />
            <h3 className="text-xl font-bold mb-2">History</h3>
            <p className="text-3xl font-bold text-accent mb-2">{historyCount}</p>
            <p className="text-muted-foreground text-sm">Visits</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-card border-2 border-border rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">Your Next Appointment</h3>
            {nextAppointment ? (
              <div className="space-y-4">
                <div className="p-4 bg-accent/10 rounded-lg border-2 border-accent/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Date & Time</span>
                    <span className="font-bold">
                      {new Date(nextAppointment.appointment_date).toLocaleDateString()} at {nextAppointment.appointment_time}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <span className="font-semibold capitalize">{nextAppointment.status}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Confirmation</span>
                    <span className="font-mono text-sm">{nextAppointment.confirmation_number}</span>
                  </div>
                </div>
                <Link to="/book">
                  <GoldButton className="w-full" variant="outline">Book Another</GoldButton>
                </Link>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="mb-4">No upcoming appointments</p>
                <Link to="/book">
                  <GoldButton>Book Now</GoldButton>
                </Link>
              </div>
            )}
          </div>

          <div className="bg-card border-2 border-border rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link to="/book" className="block">
                <GoldButton className="w-full">Book Appointment</GoldButton>
              </Link>
              <GoldButton className="w-full" variant="outline">View History</GoldButton>
              <Link to="/rewards" className="block">
                <GoldButton className="w-full" variant="outline">Rewards & Offers</GoldButton>
              </Link>
              <Link to="/" className="block">
                <GoldButton className="w-full" variant="outline">Browse Services</GoldButton>
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-card border-2 border-border rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
          <div className="text-center py-8 text-muted-foreground">
            <p>No recent activity to display</p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-accent">
            ← Back to Main Site
          </Link>
        </div>
      </main>
    </div>
  );
};

export default CustomerDashboard;
