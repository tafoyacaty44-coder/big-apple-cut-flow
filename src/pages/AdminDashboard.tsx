import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Calendar, Users, Scissors, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AppointmentsTable } from '@/components/admin/AppointmentsTable';
import { UsersTable } from '@/components/admin/UsersTable';
import { BarbersTable } from '@/components/admin/BarbersTable';

const AdminDashboard = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo />
            <div>
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Big Apple Barbershop</p>
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
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-2">Welcome back!</h2>
            <p className="text-muted-foreground">Manage your barbershop operations</p>
          </div>

          <div className="mb-4 flex gap-4">
            <Link to="/admin/vip-pricing">
              <Button variant="outline">VIP Pricing</Button>
            </Link>
            <Link to="/admin/breaks">
              <Button variant="outline">Break Times</Button>
            </Link>
            <Link to="/admin/clients">
              <Button variant="outline">Clients</Button>
            </Link>
            <Link to="/admin/rewards">
              <Button variant="outline">
                <Gift className="mr-2 h-4 w-4" />
                Rewards
              </Button>
            </Link>
          </div>

          <Tabs defaultValue="appointments" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="appointments">
                <Calendar className="mr-2 h-4 w-4" />
                Appointments
              </TabsTrigger>
              <TabsTrigger value="users">
                <Users className="mr-2 h-4 w-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="barbers">
                <Scissors className="mr-2 h-4 w-4" />
                Barbers
              </TabsTrigger>
            </TabsList>

            <TabsContent value="appointments">
              <AppointmentsTable />
            </TabsContent>

            <TabsContent value="users">
              <UsersTable />
            </TabsContent>

            <TabsContent value="barbers">
              <BarbersTable />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
