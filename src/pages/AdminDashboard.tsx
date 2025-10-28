import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { getAllScheduleRequests } from '@/lib/api/availability';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { LogOut, Calendar, Users, Scissors, Gift, CalendarClock, Database, Image, Settings, FileText, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AppointmentsTable } from '@/components/admin/AppointmentsTable';
import { UsersTable } from '@/components/admin/UsersTable';
import { BarbersTable } from '@/components/admin/BarbersTable';
import { DashboardStats } from '@/components/admin/DashboardStats';

const AdminDashboard = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [isSeedingData, setIsSeedingData] = useState(false);

  const { data: pendingCount } = useQuery({
    queryKey: ['schedule-requests', 'pending-count'],
    queryFn: async () => {
      const requests = await getAllScheduleRequests('pending');
      return requests.length;
    },
    refetchInterval: 30000,
  });

  const handleSeedDemoData = async () => {
    setIsSeedingData(true);
    try {
      const { data, error } = await supabase.functions.invoke('seed-demo-data');
      if (error) throw error;
      
      toast({
        title: 'Demo Data Seeded',
        description: data?.message || 'Successfully created demo data',
      });
      
      // Refresh all data
      window.location.reload();
    } catch (error: any) {
      toast({
        title: 'Seed Failed',
        description: error.message || 'Failed to seed demo data',
        variant: 'destructive',
      });
    } finally {
      setIsSeedingData(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo variant="dark" />
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

          <DashboardStats />

          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <Link to="/admin/services" className="w-full">
                <Button variant="outline" className="w-full justify-start">
                  <Scissors className="mr-2 h-4 w-4" />
                  Services
                </Button>
              </Link>
              <Link to="/admin/gallery" className="w-full">
                <Button variant="outline" className="w-full justify-start">
                  <Image className="mr-2 h-4 w-4" />
                  Gallery
                </Button>
              </Link>
              <Link to="/admin/blog" className="w-full">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Blog
                </Button>
              </Link>
              <Link to="/admin/promotions" className="w-full">
                <Button variant="outline" className="w-full justify-start">
                  <Send className="mr-2 h-4 w-4" />
                  Promotions
                </Button>
              </Link>
              <Link to="/admin/clients" className="w-full">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Clients
                </Button>
              </Link>
              <Link to="/admin/rewards" className="w-full">
                <Button variant="outline" className="w-full justify-start">
                  <Gift className="mr-2 h-4 w-4" />
                  Rewards
                </Button>
              </Link>
              <Link to="/admin/vip-pricing" className="w-full">
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="mr-2 h-4 w-4" />
                  VIP Pricing
                </Button>
              </Link>
              <Link to="/admin/breaks" className="w-full">
                <Button variant="outline" className="w-full justify-start">
                  <CalendarClock className="mr-2 h-4 w-4" />
                  Break Times
                </Button>
              </Link>
              <Link to="/admin/schedule" className="w-full">
                <Button variant="outline" className="w-full justify-start relative">
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Requests
                  {pendingCount && pendingCount > 0 && (
                    <Badge className="ml-auto bg-red-500 text-white">
                      {pendingCount}
                    </Badge>
                  )}
                </Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={handleSeedDemoData}
                disabled={isSeedingData}
                className="w-full justify-start"
              >
                <Database className="mr-2 h-4 w-4" />
                {isSeedingData ? 'Seeding...' : 'Seed Demo Data'}
              </Button>
            </div>
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
