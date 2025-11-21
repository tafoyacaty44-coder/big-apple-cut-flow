import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getAllScheduleRequests } from '@/lib/api/availability';
import { checkMasterAdminExists, bootstrapMasterAdmin } from '@/lib/api/developer';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { LogOut, Calendar, Users, Scissors, Gift, CalendarClock, Database, Image, Settings, FileText, Send, Clock, Search, Shield, AlertTriangle } from 'lucide-react';
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

  const { data: isMasterAdmin } = useQuery({
    queryKey: ['is-master-admin', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'master_admin')
        .single();
      return !!data;
    },
    enabled: !!user?.id
  });

  const { data: pendingCount } = useQuery({
    queryKey: ['schedule-requests', 'pending-count'],
    queryFn: async () => {
      const requests = await getAllScheduleRequests('pending');
      return requests.length;
    },
    refetchInterval: 30000,
  });

  const { data: masterAdminExists, isLoading: checkingMasterAdmin } = useQuery({
    queryKey: ['master-admin-exists'],
    queryFn: checkMasterAdminExists,
    staleTime: 30000,
  });

  const bootstrapMutation = useMutation({
    mutationFn: bootstrapMasterAdmin,
    onSuccess: () => {
      toast({
        title: "Master Admin Role Claimed!",
        description: "You now have full system access. The page will reload.",
      });
      setTimeout(() => window.location.href = '/admin', 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Bootstrap Failed",
        description: error.message || "Failed to claim master admin role",
        variant: "destructive",
      });
    },
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

          {!masterAdminExists && !isMasterAdmin && !checkingMasterAdmin && (
            <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
              <Shield className="h-5 w-5 text-yellow-600" />
              <AlertTitle className="text-yellow-800 dark:text-yellow-400 font-semibold">
                No Master Admin Found
              </AlertTitle>
              <AlertDescription className="space-y-3">
                <p className="text-yellow-700 dark:text-yellow-300">
                  This project doesn't have a master admin yet. As an admin, you can claim this role to access:
                </p>
                <ul className="list-disc list-inside text-yellow-700 dark:text-yellow-300 text-sm space-y-1">
                  <li>Developer Panel & Branding Management</li>
                  <li>User Role Management</li>
                  <li>Database & System Tools</li>
                  <li>Ability to promote other admins to master admin</li>
                </ul>
                <div className="flex items-center gap-2 pt-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <p className="text-xs text-yellow-600 dark:text-yellow-400">
                    This action can only be performed once per project
                  </p>
                </div>
                <Button
                  onClick={() => bootstrapMutation.mutate()}
                  disabled={bootstrapMutation.isPending}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  {bootstrapMutation.isPending ? "Claiming..." : "Claim Master Admin Role"}
                </Button>
              </AlertDescription>
            </Alert>
          )}

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
              <Link to="/admin/manual-schedule" className="w-full">
                <Button variant="outline" className="w-full justify-start">
                  <CalendarClock className="mr-2 h-4 w-4" />
                  Manual Schedule Editor
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
              {isMasterAdmin && (
                <Link to="/admin/developer" className="w-full">
                  <Button variant="outline" className="w-full justify-start border-yellow-500 text-yellow-600 hover:bg-yellow-50">
                    <Settings className="mr-2 h-4 w-4" />
                    Developer Tools
                  </Button>
                </Link>
              )}
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
