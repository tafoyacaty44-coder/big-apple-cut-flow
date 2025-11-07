import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { getAllScheduleRequests } from '@/lib/api/availability';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { LogOut, Calendar, Users, Scissors, Gift, CalendarClock, Database, Image, Settings, FileText, Send, Clock, Search } from 'lucide-react';
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
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-full mx-auto px-4 py-3 md:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
              <Logo variant="dark" />
              <div className="min-w-0">
                <h1 className="text-lg md:text-xl font-bold truncate">Admin Dashboard</h1>
                <p className="text-xs md:text-sm text-muted-foreground truncate">Big Apple Barbershop</p>
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
        <div className="space-y-6 md:space-y-8">
          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-2">Welcome back!</h2>
            <p className="text-sm md:text-base text-muted-foreground">Manage your barbershop operations</p>
          </div>

          <DashboardStats />

          <div>
            <h3 className="text-base md:text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
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
              <Link to="/admin/blacklist" className="w-full">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Blacklist
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
              <Link to="/admin/seo" className="w-full">
                <Button variant="outline" className="w-full justify-start">
                  <Search className="mr-2 h-4 w-4" />
                  SEO Management
                </Button>
              </Link>
              <Link to="/admin/breaks" className="w-full">
                <Button variant="outline" className="w-full justify-start">
                  <CalendarClock className="mr-2 h-4 w-4" />
                  Break Times
                </Button>
              </Link>
              <Link to="/admin/break-requests" className="w-full">
                <Button variant="outline" className="w-full justify-start">
                  <Clock className="mr-2 h-4 w-4" />
                  Break Requests
                </Button>
              </Link>
              <Link to="/admin/schedule" className="w-full">
                <Button variant="outline" className="w-full justify-between">
                  <span className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule Requests
                  </span>
                  {pendingCount !== null && pendingCount > 0 && (
                    <Badge className="bg-red-500 text-white">
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
            <TabsList className="grid w-full grid-cols-3 h-auto">
              <TabsTrigger value="appointments" className="text-xs sm:text-sm py-2 sm:py-3">
                <Calendar className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Appointments</span>
                <span className="sm:hidden">Appts</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="text-xs sm:text-sm py-2 sm:py-3">
                <Users className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Users</span>
                <span className="sm:hidden">Users</span>
              </TabsTrigger>
              <TabsTrigger value="barbers" className="text-xs sm:text-sm py-2 sm:py-3">
                <Scissors className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Barbers</span>
                <span className="sm:hidden">Barbers</span>
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
