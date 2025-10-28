import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Award, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { getNextAvailableSlot } from '@/lib/api/availability';
import { Skeleton } from '@/components/ui/skeleton';

const QuickActionsHub = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: nextSlot, isLoading } = useQuery({
    queryKey: ['next-available-slot'],
    queryFn: getNextAvailableSlot,
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Quick Actions
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Book Appointment Card */}
          <Card 
            className="cursor-pointer hover:scale-105 transition-all hover:shadow-xl border-[hsl(var(--accent))]/30 hover:border-[hsl(var(--accent))]"
            onClick={() => navigate('/book')}
          >
            <CardContent className="p-6 text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-[hsl(var(--accent))]/10 flex items-center justify-center mx-auto">
                <Calendar className="h-8 w-8 text-[hsl(var(--accent))]" />
              </div>
              <div>
                <h3 className="font-bold text-xl mb-2">Book Now</h3>
                {isLoading ? (
                  <Skeleton className="h-4 w-32 mx-auto" />
                ) : nextSlot ? (
                  <p className="text-sm text-muted-foreground">
                    Next available: <br />
                    <span className="font-semibold text-foreground">
                      {nextSlot.date} at {nextSlot.time}
                    </span>
                  </p>
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
            className="cursor-pointer hover:scale-105 transition-all hover:shadow-xl border-[hsl(var(--accent))]/30 hover:border-[hsl(var(--accent))]"
            onClick={() => navigate(user ? '/rewards' : '/rewards-program')}
          >
            <CardContent className="p-6 text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-[hsl(var(--accent))]/10 flex items-center justify-center mx-auto">
                <Award className="h-8 w-8 text-[hsl(var(--accent))]" />
              </div>
              <div>
                <h3 className="font-bold text-xl mb-2">Rewards</h3>
                <p className="text-sm text-muted-foreground">
                  {user ? 'View your points' : 'Join free today'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Account Card */}
          <Card 
            className="cursor-pointer hover:scale-105 transition-all hover:shadow-xl border-[hsl(var(--accent))]/30 hover:border-[hsl(var(--accent))]"
            onClick={() => navigate(user ? '/customer' : '/signup')}
          >
            <CardContent className="p-6 text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-[hsl(var(--accent))]/10 flex items-center justify-center mx-auto">
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
