import { useAuth } from '@/hooks/useAuth';
import { GoldButton } from '@/components/ui/gold-button';
import Logo from '@/components/Logo';
import { Calendar, Clock, User, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const BarberDashboard = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b-2 border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Logo size="md" />
              <div>
                <h1 className="text-2xl font-bold">Barber Dashboard</h1>
                <p className="text-sm text-muted-foreground">Your Schedule & Appointments</p>
              </div>
            </div>
            <GoldButton onClick={signOut} variant="outline">
              Sign Out
            </GoldButton>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome Back!</h2>
          <p className="text-muted-foreground">Manage your appointments and availability</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card border-2 border-border rounded-lg p-6 vintage-shadow">
            <Calendar className="w-12 h-12 text-accent mb-4" />
            <h3 className="text-xl font-bold mb-2">Today</h3>
            <p className="text-3xl font-bold text-accent mb-2">0</p>
            <p className="text-muted-foreground text-sm">Appointments</p>
          </div>

          <div className="bg-card border-2 border-border rounded-lg p-6 vintage-shadow">
            <Clock className="w-12 h-12 text-accent mb-4" />
            <h3 className="text-xl font-bold mb-2">This Week</h3>
            <p className="text-3xl font-bold text-accent mb-2">0</p>
            <p className="text-muted-foreground text-sm">Appointments</p>
          </div>

          <div className="bg-card border-2 border-border rounded-lg p-6 vintage-shadow">
            <User className="w-12 h-12 text-accent mb-4" />
            <h3 className="text-xl font-bold mb-2">Total Clients</h3>
            <p className="text-3xl font-bold text-accent mb-2">0</p>
            <p className="text-muted-foreground text-sm">All Time</p>
          </div>

          <div className="bg-card border-2 border-border rounded-lg p-6 vintage-shadow">
            <TrendingUp className="w-12 h-12 text-accent mb-4" />
            <h3 className="text-xl font-bold mb-2">Rating</h3>
            <p className="text-3xl font-bold text-accent mb-2">5.0</p>
            <p className="text-muted-foreground text-sm">Average</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-card border-2 border-border rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">Today's Schedule</h3>
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No appointments scheduled for today</p>
            </div>
          </div>

          <div className="bg-card border-2 border-border rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">Availability Settings</h3>
            <div className="space-y-4">
              <GoldButton className="w-full">Update Working Hours</GoldButton>
              <GoldButton className="w-full" variant="outline">Block Time Off</GoldButton>
              <GoldButton className="w-full" variant="outline">View Full Calendar</GoldButton>
            </div>
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

export default BarberDashboard;
