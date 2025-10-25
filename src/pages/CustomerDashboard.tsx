import { useAuth } from '@/hooks/useAuth';
import { GoldButton } from '@/components/ui/gold-button';
import Logo from '@/components/Logo';
import { Calendar, Gift, Clock, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const CustomerDashboard = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b-2 border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Logo size="md" />
              <div>
                <h1 className="text-2xl font-bold">My Dashboard</h1>
                <p className="text-sm text-muted-foreground">Big Apple Barbers</p>
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
          <p className="text-muted-foreground">Manage your appointments and rewards</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-card border-2 border-border rounded-lg p-6 vintage-shadow">
            <Calendar className="w-12 h-12 text-accent mb-4" />
            <h3 className="text-xl font-bold mb-2">Upcoming</h3>
            <p className="text-3xl font-bold text-accent mb-2">0</p>
            <p className="text-muted-foreground text-sm">Appointments</p>
          </div>

          <div className="bg-card border-2 border-border rounded-lg p-6 vintage-shadow">
            <Gift className="w-12 h-12 text-accent mb-4" />
            <h3 className="text-xl font-bold mb-2">Rewards</h3>
            <p className="text-3xl font-bold text-accent mb-2">0</p>
            <p className="text-muted-foreground text-sm">Points</p>
          </div>

          <div className="bg-card border-2 border-border rounded-lg p-6 vintage-shadow">
            <Clock className="w-12 h-12 text-accent mb-4" />
            <h3 className="text-xl font-bold mb-2">History</h3>
            <p className="text-3xl font-bold text-accent mb-2">0</p>
            <p className="text-muted-foreground text-sm">Visits</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-card border-2 border-border rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">Your Next Appointment</h3>
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="mb-4">No upcoming appointments</p>
              <Link to="/book">
                <GoldButton>Book Now</GoldButton>
              </Link>
            </div>
          </div>

          <div className="bg-card border-2 border-border rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link to="/book" className="block">
                <GoldButton className="w-full">Book Appointment</GoldButton>
              </Link>
              <GoldButton className="w-full" variant="outline">View History</GoldButton>
              <GoldButton className="w-full" variant="outline">Rewards & Offers</GoldButton>
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
