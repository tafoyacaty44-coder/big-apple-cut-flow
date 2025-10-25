import { useAuth } from '@/hooks/useAuth';
import { GoldButton } from '@/components/ui/gold-button';
import Logo from '@/components/Logo';
import { Users, Scissors, Calendar, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b-2 border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Logo size="md" />
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">Big Apple Barbers Management</p>
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
          <h2 className="text-3xl font-bold mb-2">Welcome, Admin</h2>
          <p className="text-muted-foreground">Manage your barbershop operations</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card border-2 border-border rounded-lg p-6 vintage-shadow">
            <Users className="w-12 h-12 text-accent mb-4" />
            <h3 className="text-xl font-bold mb-2">Customers</h3>
            <p className="text-muted-foreground text-sm mb-4">View and manage customer profiles</p>
            <GoldButton variant="outline" size="sm" className="w-full">
              Manage
            </GoldButton>
          </div>

          <div className="bg-card border-2 border-border rounded-lg p-6 vintage-shadow">
            <Scissors className="w-12 h-12 text-accent mb-4" />
            <h3 className="text-xl font-bold mb-2">Barbers</h3>
            <p className="text-muted-foreground text-sm mb-4">Add and manage barber accounts</p>
            <GoldButton variant="outline" size="sm" className="w-full">
              Manage
            </GoldButton>
          </div>

          <div className="bg-card border-2 border-border rounded-lg p-6 vintage-shadow">
            <Calendar className="w-12 h-12 text-accent mb-4" />
            <h3 className="text-xl font-bold mb-2">Appointments</h3>
            <p className="text-muted-foreground text-sm mb-4">View all appointments and bookings</p>
            <GoldButton variant="outline" size="sm" className="w-full">
              Manage
            </GoldButton>
          </div>

          <div className="bg-card border-2 border-border rounded-lg p-6 vintage-shadow">
            <Settings className="w-12 h-12 text-accent mb-4" />
            <h3 className="text-xl font-bold mb-2">Settings</h3>
            <p className="text-muted-foreground text-sm mb-4">Configure services and availability</p>
            <GoldButton variant="outline" size="sm" className="w-full">
              Manage
            </GoldButton>
          </div>
        </div>

        <div className="bg-card border-2 border-border rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <GoldButton className="w-full">Add New Barber</GoldButton>
            <GoldButton className="w-full" variant="outline">View Today's Schedule</GoldButton>
            <GoldButton className="w-full" variant="outline">Generate Reports</GoldButton>
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

export default AdminDashboard;
