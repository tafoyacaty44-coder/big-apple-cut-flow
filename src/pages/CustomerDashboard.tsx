import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getCustomerAppointments } from '@/lib/api/appointments';
import { getRewardsBalance } from '@/lib/api/rewards';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { GoldButton } from '@/components/ui/gold-button';
import { Calendar, Award, History, BookOpen, Scissors, Gift, LogOut } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import Logo from '@/components/Logo';
import { AnimatedCard, AnimatedCardContainer } from '@/components/ui/animated-card';
import { motion } from 'framer-motion';
import { useAnimations } from '@/hooks/useAnimations';
import { usePullToRefresh } from '@/hooks/useGestures';

const CustomerDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { pageTransition, fade } = useAnimations();

  const { data: appointments = [], isLoading: isLoadingAppointments, refetch: refetchAppointments } = useQuery({
    queryKey: ['appointments', 'customer', user?.id],
    queryFn: () => getCustomerAppointments(user?.id || ''),
    enabled: !!user?.id,
  });

  const { data: rewardsData, isLoading: isLoadingRewards, refetch: refetchRewards } = useQuery({
    queryKey: ['rewards', 'balance', user?.id],
    queryFn: () => getRewardsBalance(user?.id || ''),
    enabled: !!user?.id,
  });

  // Pull to refresh
  const { pullDistance, isRefreshing } = usePullToRefresh(async () => {
    await Promise.all([refetchAppointments(), refetchRewards()]);
  });

  const upcomingCount = appointments.filter(apt => 
    apt.status === 'confirmed' || apt.status === 'pending'
  ).length;

  const historyCount = appointments.filter(apt => apt.status === 'completed').length;

  const nextAppointment = appointments
    .filter(apt => apt.status === 'confirmed' || apt.status === 'pending')
    .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())[0];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-b from-background to-background/95"
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Pull to refresh indicator */}
      {pullDistance > 0 && (
        <motion.div
          className="fixed top-0 left-1/2 -translate-x-1/2 z-50 bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] px-4 py-2 rounded-b-lg shadow-lg"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          style={{ y: pullDistance / 2 }}
        >
          {isRefreshing ? 'Refreshing...' : pullDistance >= 80 ? 'Release to refresh' : 'Pull to refresh'}
        </motion.div>
      )}

      {/* Header */}
      <div className="bg-card border-b sticky top-0 z-10 backdrop-blur-sm bg-card/95">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Logo />
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold hidden md:block">Customer Dashboard</h1>
              <GoldButton
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </GoldButton>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome Section */}
        <motion.div 
          className="text-center space-y-2"
          variants={fade}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-3xl md:text-4xl font-bold">
            Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'Guest'}!
          </h2>
          <p className="text-muted-foreground">
            Manage your appointments and track your rewards
          </p>
        </motion.div>

        {/* Summary Cards */}
        <AnimatedCardContainer className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AnimatedCard index={0} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Upcoming</p>
                  <p className="text-3xl font-bold text-[hsl(var(--accent))]">{upcomingCount}</p>
                </div>
                <Calendar className="h-12 w-12 text-[hsl(var(--accent))] opacity-20" />
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard index={1} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rewards Points</p>
                  <p className="text-3xl font-bold text-[hsl(var(--accent))]">
                    {isLoadingRewards ? '...' : rewardsData?.total_points || 0}
                  </p>
                </div>
                <Award className="h-12 w-12 text-[hsl(var(--accent))] opacity-20" />
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard index={2} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Visits</p>
                  <p className="text-3xl font-bold text-[hsl(var(--accent))]">{historyCount}</p>
                </div>
                <History className="h-12 w-12 text-[hsl(var(--accent))] opacity-20" />
              </div>
            </CardContent>
          </AnimatedCard>
        </AnimatedCardContainer>

        {/* Next Appointment */}
        <AnimatedCard index={3}>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[hsl(var(--accent))]" />
              Your Next Appointment
            </h3>
            {isLoadingAppointments ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : nextAppointment ? (
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium text-lg">{(nextAppointment as any).services?.name || 'Appointment'}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(`${nextAppointment.appointment_date}T${nextAppointment.appointment_time}`), 'EEEE, MMMM d, yyyy')} at {nextAppointment.appointment_time}
                    </p>
                  </div>
                  <GoldButton onClick={() => navigate('/book')} className="w-full md:w-auto">
                    Book Another
                  </GoldButton>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                className="text-center py-8"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <p className="text-muted-foreground mb-4">No upcoming appointments</p>
                <GoldButton onClick={() => navigate('/book')}>Book Now</GoldButton>
              </motion.div>
            )}
          </CardContent>
        </AnimatedCard>

        {/* Quick Actions */}
        <AnimatedCard index={4}>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link to="/book" className="block">
                <motion.div 
                  className="p-4 border rounded-lg hover:bg-muted/50 hover:border-[hsl(var(--accent))] transition-all cursor-pointer group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="h-8 w-8 text-[hsl(var(--accent))] group-hover:scale-110 transition-transform" />
                    <div>
                      <p className="font-medium">Book Appointment</p>
                      <p className="text-sm text-muted-foreground">Schedule your next visit</p>
                    </div>
                  </div>
                </motion.div>
              </Link>

              <motion.div 
                className="p-4 border rounded-lg hover:bg-muted/50 hover:border-[hsl(var(--accent))] transition-all cursor-pointer group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  <History className="h-8 w-8 text-[hsl(var(--accent))] group-hover:scale-110 transition-transform" />
                  <div>
                    <p className="font-medium">View History</p>
                    <p className="text-sm text-muted-foreground">{historyCount} completed visits</p>
                  </div>
                </div>
              </motion.div>

              <Link to="/rewards" className="block">
                <motion.div 
                  className="p-4 border rounded-lg hover:bg-muted/50 hover:border-[hsl(var(--accent))] transition-all cursor-pointer group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3">
                    <Gift className="h-8 w-8 text-[hsl(var(--accent))] group-hover:scale-110 transition-transform" />
                    <div>
                      <p className="font-medium">Rewards Program</p>
                      <p className="text-sm text-muted-foreground">Earn points & redeem</p>
                    </div>
                  </div>
                </motion.div>
              </Link>

              <Link to="/" className="block">
                <motion.div 
                  className="p-4 border rounded-lg hover:bg-muted/50 hover:border-[hsl(var(--accent))] transition-all cursor-pointer group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3">
                    <Scissors className="h-8 w-8 text-[hsl(var(--accent))] group-hover:scale-110 transition-transform" />
                    <div>
                      <p className="font-medium">Browse Services</p>
                      <p className="text-sm text-muted-foreground">View all offerings</p>
                    </div>
                  </div>
                </motion.div>
              </Link>
            </div>
          </CardContent>
        </AnimatedCard>

        {/* Recent Activity */}
        <AnimatedCard index={5}>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-[hsl(var(--accent))]" />
              Recent Activity
            </h3>
            <div className="text-center py-8 text-muted-foreground">
              No recent activity to display
            </div>
          </CardContent>
        </AnimatedCard>

        {/* Back to Main Site */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Link to="/" className="text-[hsl(var(--accent))] hover:underline">
            ← Back to Main Site
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CustomerDashboard;
