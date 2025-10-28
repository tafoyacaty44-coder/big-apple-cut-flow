import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Award, User, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { getNextAvailableSlot } from '@/lib/api/availability';
import { getCurrentUserRewards } from '@/lib/api/rewards';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';

const QuickActionsHub = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [lastBarberId, setLastBarberId] = useState<string | null>(null);
  const [lastBarberName, setLastBarberName] = useState<string | null>(null);

  const { data: nextSlot, isLoading } = useQuery({
    queryKey: ['next-available-slot'],
    queryFn: getNextAvailableSlot,
    refetchInterval: 5 * 60 * 1000,
  });

  const { data: rewards } = useQuery({
    queryKey: ['current-user-rewards', user?.id],
    queryFn: getCurrentUserRewards,
    enabled: !!user,
  });

  useEffect(() => {
    if (!user) return;

    const fetchUserData = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      if (profile?.full_name) {
        setDisplayName(profile.full_name.split(' ')[0]);
      }

      const { data: lastAppointment } = await supabase
        .from('appointments')
        .select('barber_id, barbers(full_name)')
        .eq('customer_id', user.id)
        .eq('status', 'completed')
        .order('appointment_date', { ascending: false })
        .limit(1)
        .single();

      if (lastAppointment) {
        setLastBarberId(lastAppointment.barber_id);
        setLastBarberName((lastAppointment as any).barbers?.full_name || null);
      }
    };

    fetchUserData();
  }, [user]);

  return (
    <section className="py-16 px-4 animate-fade-in">
      <div className="container mx-auto">
        {user && displayName && (
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Welcome back, {displayName}!
          </h2>
        )}
        <h3 className="text-xl md:text-2xl text-center mb-12 text-muted-foreground">
          {user ? 'What would you like to do?' : 'Get started today'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Book Appointment Card */}
          <Card 
            className="cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-xl border-[hsl(var(--accent))]/30 hover:border-[hsl(var(--accent))] animate-fade-in"
            onClick={() => navigate(lastBarberId && user ? `/barbers/${lastBarberId}` : '/book')}
            role="button"
            tabIndex={0}
            aria-label="Book an appointment"
            onKeyDown={(e) => e.key === 'Enter' && navigate('/book')}
          >
            <CardContent className="p-6 text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-[hsl(var(--accent))]/10 flex items-center justify-center mx-auto transition-transform duration-300 group-hover:scale-110">
                <Calendar className="h-8 w-8 text-[hsl(var(--accent))]" />
              </div>
              <div>
                <h3 className="font-bold text-xl mb-2">
                  {lastBarberName && user ? `Book with ${lastBarberName}` : 'Book Now'}
                </h3>
                {isLoading ? (
                  <Skeleton className="h-4 w-32 mx-auto" />
                ) : nextSlot ? (
                  <div className="text-sm text-muted-foreground">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Clock className="h-3 w-3" />
                      <span className="text-xs">Next available:</span>
                    </div>
                    <span className="font-semibold text-foreground">
                      {nextSlot.date} at {nextSlot.time}
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Check availability
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Rewards Card */}
          <Card 
            className="cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-xl border-[hsl(var(--accent))]/30 hover:border-[hsl(var(--accent))] animate-fade-in"
            style={{ animationDelay: '100ms' }}
            onClick={() => navigate(user ? '/rewards' : '/rewards-program')}
            role="button"
            tabIndex={0}
            aria-label="View rewards"
            onKeyDown={(e) => e.key === 'Enter' && navigate(user ? '/rewards' : '/rewards-program')}
          >
            <CardContent className="p-6 text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-[hsl(var(--accent))]/10 flex items-center justify-center mx-auto transition-transform duration-300 group-hover:scale-110">
                <Award className="h-8 w-8 text-[hsl(var(--accent))]" />
              </div>
              <div>
                <h3 className="font-bold text-xl mb-2">Rewards</h3>
                {user && rewards ? (
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-[hsl(var(--accent))]">
                      {rewards.points}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {rewards.tier} • {rewards.pointsToNextTier} to next tier
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {user ? 'View your points' : 'Join free today'}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Account Card */}
          <Card 
            className="cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-xl border-[hsl(var(--accent))]/30 hover:border-[hsl(var(--accent))] animate-fade-in"
            style={{ animationDelay: '200ms' }}
            onClick={() => navigate(user ? '/customer' : '/signup')}
            role="button"
            tabIndex={0}
            aria-label="View account"
            onKeyDown={(e) => e.key === 'Enter' && navigate(user ? '/customer' : '/signup')}
          >
            <CardContent className="p-6 text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-[hsl(var(--accent))]/10 flex items-center justify-center mx-auto transition-transform duration-300 group-hover:scale-110">
                <User className="h-8 w-8 text-[hsl(var(--accent))]" />
              </div>
              <div>
                <h3 className="font-bold text-xl mb-2">Account</h3>
                <p className="text-sm text-muted-foreground">
                  {user ? 'View dashboard' : 'Sign up free'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default QuickActionsHub;
