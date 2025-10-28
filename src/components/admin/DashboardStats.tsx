import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, DollarSign, Users, Scissors, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardStats() {
  const today = new Date().toISOString().split('T')[0];

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats', today],
    queryFn: async () => {
      // Today's appointments
      const { data: todayAppointments } = await supabase
        .from('appointments')
        .select('*, services(regular_price, vip_price)')
        .gte('appointment_date', today)
        .lte('appointment_date', today);

      // Total active customers
      const { data: customers } = await supabase
        .from('profiles')
        .select('id')
        .eq('first_time_customer', false);

      // Active barbers
      const { data: barbers } = await supabase
        .from('barbers')
        .select('id')
        .eq('is_active', true);

      // Calculate today's revenue
      const todayRevenue = todayAppointments?.reduce((sum, apt) => {
        const service = apt.services as any;
        const price = apt.vip_applied ? service?.vip_price : service?.regular_price;
        return sum + (Number(price) || 0);
      }, 0) || 0;

      // This month's appointments
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        .toISOString().split('T')[0];
      const { data: monthAppointments } = await supabase
        .from('appointments')
        .select('id')
        .gte('appointment_date', startOfMonth);

      return {
        todayAppointments: todayAppointments?.length || 0,
        todayRevenue,
        totalCustomers: customers?.length || 0,
        activeBarbers: barbers?.length || 0,
        monthAppointments: monthAppointments?.length || 0,
      };
    },
    refetchInterval: 60000, // Refresh every minute
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today's Bookings</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.todayAppointments}</div>
          <p className="text-xs text-muted-foreground">
            Appointments scheduled for today
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${stats?.todayRevenue.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            Expected from today's bookings
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalCustomers}</div>
          <p className="text-xs text-muted-foreground">
            Total returning customers
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Barbers</CardTitle>
          <Scissors className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.activeBarbers}</div>
          <p className="text-xs text-muted-foreground">
            Currently available
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Month</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.monthAppointments}</div>
          <p className="text-xs text-muted-foreground">
            Total appointments
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
