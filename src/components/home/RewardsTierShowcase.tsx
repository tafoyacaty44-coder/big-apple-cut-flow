import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { getCurrentUserRewards } from '@/lib/api/rewards';
import { Award, Star, Crown } from 'lucide-react';

const tiers = [
  {
    name: 'Bronze',
    discount: 5,
    minPoints: 0,
    icon: Award,
    color: 'from-amber-700 to-amber-500',
    benefits: ['5% discount', 'Birthday bonus', 'Early booking access']
  },
  {
    name: 'Silver',
    discount: 10,
    minPoints: 500,
    icon: Star,
    color: 'from-slate-400 to-slate-200',
    benefits: ['10% discount', 'Priority scheduling', 'Free product samples']
  },
  {
    name: 'Gold',
    discount: 15,
    minPoints: 1000,
    icon: Crown,
    color: 'from-yellow-600 to-yellow-400',
    benefits: ['15% discount', 'VIP events', 'Exclusive services']
  }
];

const RewardsTierShowcase = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: rewardsData } = useQuery({
    queryKey: ['user-rewards'],
    queryFn: getCurrentUserRewards,
    enabled: !!user,
  });

  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Rewards Program
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Earn points with every visit and unlock exclusive benefits
          </p>
        </div>

        {user && rewardsData && (
          <div className="max-w-2xl mx-auto mb-12">
            <Card className="border-[hsl(var(--accent))]/30 bg-gradient-to-br from-[hsl(var(--accent))]/5 to-transparent">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-xl">Your Progress</h3>
                    <p className="text-sm text-muted-foreground">
                      Current Tier: <span className="font-semibold text-foreground">{rewardsData.tier}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[hsl(var(--accent))]">
                      {rewardsData.points}
                    </p>
                    <p className="text-xs text-muted-foreground">points</p>
                  </div>
                </div>
                {rewardsData.pointsToNextTier > 0 && (
                  <div className="space-y-2">
                    <Progress value={(rewardsData.points / (rewardsData.points + rewardsData.pointsToNextTier)) * 100} />
                    <p className="text-xs text-muted-foreground text-center">
                      {rewardsData.pointsToNextTier} points to next tier
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {tiers.map((tier, index) => {
            const Icon = tier.icon;
            const isCurrentTier = user && rewardsData?.tier.toLowerCase() === tier.name.toLowerCase();

            return (
              <Card 
                key={tier.name}
                className={`overflow-hidden transition-all hover:scale-105 hover:shadow-xl ${
                  isCurrentTier ? 'border-[hsl(var(--accent))] border-2 shadow-lg' : ''
                }`}
              >
                <div className={`h-24 bg-gradient-to-br ${tier.color} flex items-center justify-center`}>
                  <Icon className="h-12 w-12 text-white" />
                </div>
                <CardContent className="p-6 space-y-4">
                  <div className="text-center">
                    <h3 className="font-bold text-2xl mb-1">{tier.name}</h3>
                    <p className="text-3xl font-bold text-[hsl(var(--accent))]">
                      {tier.discount}% OFF
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {tier.minPoints === 0 ? 'Starting tier' : `${tier.minPoints}+ points`}
                    </p>
                  </div>
                  <ul className="space-y-2 text-sm">
                    {tier.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[hsl(var(--accent))] mt-0.5">✓</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  {isCurrentTier && (
                    <div className="text-center pt-2">
                      <span className="inline-block px-3 py-1 rounded-full bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))] text-xs font-semibold">
                        Current Tier
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-12">
          {user ? (
            <Button
              onClick={() => navigate('/rewards')}
              className="bg-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))]/90"
            >
              View My Rewards
            </Button>
          ) : (
            <Button
              onClick={() => navigate('/signup')}
              className="bg-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))]/90"
            >
              Join Free Today
            </Button>
          )}
        </div>
      </div>
    </section>
  );
};

export default RewardsTierShowcase;
