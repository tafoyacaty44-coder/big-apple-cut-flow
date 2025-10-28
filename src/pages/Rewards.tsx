import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { getRewardsBalance, getRewardsTransactions, getRewardActions, getReferralCode } from '@/lib/api/rewards';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { GoldButton } from '@/components/ui/gold-button';
import { Badge } from '@/components/ui/badge';
import { Gift, Trophy, Users, Share2, Clock, Award, Copy, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import Logo from '@/components/Logo';

const Rewards = () => {
  const { user, signOut } = useAuth();
  const [copiedCode, setCopiedCode] = useState(false);

  const { data: balance, isLoading: balanceLoading } = useQuery({
    queryKey: ['rewards-balance', user?.id],
    queryFn: () => getRewardsBalance(user!.id),
    enabled: !!user
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['rewards-transactions', user?.id],
    queryFn: () => getRewardsTransactions(user!.id, 20),
    enabled: !!user
  });

  const { data: actions } = useQuery({
    queryKey: ['reward-actions'],
    queryFn: getRewardActions
  });

  const { data: referralCode } = useQuery({
    queryKey: ['referral-code', user?.id],
    queryFn: () => getReferralCode(user!.id),
    enabled: !!user
  });

  const handleCopyCode = () => {
    if (referralCode?.code) {
      navigator.clipboard.writeText(referralCode.code);
      setCopiedCode(true);
      toast.success('Referral code copied!');
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleShareWhatsApp = () => {
    const message = encodeURIComponent(
      `Check out Big Apple Barbers! Use my referral code ${referralCode?.code} when you book your first appointment and we both get rewards! 💈✨`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b-2 border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Logo size="md" />
              <div>
                <h1 className="text-2xl font-bold">Rewards Program</h1>
                <p className="text-sm text-muted-foreground">Big Apple Barbers</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/dashboard">
                <GoldButton variant="outline">Dashboard</GoldButton>
              </Link>
              <GoldButton onClick={signOut} variant="outline">
                Sign Out
              </GoldButton>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Points Balance Card */}
        <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-2 border-accent/20 p-8 mb-8">
          <div className="text-center">
            <Gift className="w-16 h-16 text-accent mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-2">Your Rewards Balance</h2>
            {balanceLoading ? (
              <div className="text-5xl font-bold text-accent animate-pulse">...</div>
            ) : (
              <>
                <div className="text-6xl font-bold text-accent mb-4">
                  {balance?.total_points || 0}
                  <span className="text-2xl ml-2">points</span>
                </div>
                {balance?.current_tier && (
                  <Badge className="text-lg px-4 py-1 bg-accent/20 text-accent border-accent">
                    <Trophy className="w-4 h-4 mr-2" />
                    {balance.current_tier.name}
                  </Badge>
                )}
              </>
            )}
          </div>

          {/* Progress to Next Tier */}
          {balance?.next_tier && (
            <div className="mt-8">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Progress to {balance.next_tier.name}</span>
                <span className="text-muted-foreground">
                  {balance.next_tier.min_points - balance.total_points} points to go
                </span>
              </div>
              <Progress value={balance.progress_percent} className="h-3" />
            </div>
          )}
        </Card>

        {/* Current Tier Benefits */}
        {balance?.current_tier && (
          <Card className="p-6 mb-8">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Award className="w-6 h-6 text-accent" />
              Your Current Benefits
            </h3>
            <div className="grid gap-3">
              <div className="flex items-center gap-3 p-3 bg-accent/5 rounded-lg">
                <div className="text-3xl font-bold text-accent">
                  {balance.current_tier.discount_percent}%
                </div>
                <div>
                  <div className="font-semibold">Discount on All Services</div>
                  <div className="text-sm text-muted-foreground">
                    Applied automatically at checkout
                  </div>
                </div>
              </div>
              {balance.current_tier.benefits?.map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-accent" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* How to Earn Points */}
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">How to Earn Points</h3>
            <div className="space-y-4">
              {actions?.map((action) => (
                <div key={action.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-semibold">{action.description}</div>
                    <div className="text-sm text-muted-foreground">{action.code.replace(/_/g, ' ')}</div>
                  </div>
                  <Badge variant="secondary" className="ml-3">
                    +{action.points} pts
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Referral Program */}
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Users className="w-6 h-6 text-accent" />
              Refer Friends & Family
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Share your unique referral code and earn 50 points when someone books their first appointment!
            </p>
            
            <div className="bg-muted/50 p-4 rounded-lg mb-4">
              <div className="text-sm text-muted-foreground mb-2">Your Referral Code</div>
              <div className="flex items-center gap-2">
                <div className="text-3xl font-bold font-mono tracking-wider flex-1">
                  {referralCode?.code || '...'}
                </div>
                <GoldButton
                  size="icon"
                  variant="outline"
                  onClick={handleCopyCode}
                  className="shrink-0"
                >
                  {copiedCode ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </GoldButton>
              </div>
              {referralCode && referralCode.times_used > 0 && (
                <div className="text-sm text-accent mt-2">
                  Used {referralCode.times_used} time{referralCode.times_used !== 1 ? 's' : ''}
                </div>
              )}
            </div>

            <GoldButton className="w-full" onClick={handleShareWhatsApp}>
              <Share2 className="w-4 h-4 mr-2" />
              Share via WhatsApp
            </GoldButton>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Clock className="w-6 h-6" />
            Recent Activity
          </h3>
          {transactionsLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : transactions && transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 border-b border-border last:border-b-0"
                >
                  <div className="flex-1">
                    <div className="font-medium">
                      {tx.description || tx.action_type}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(tx.created_at), 'MMM d, yyyy • h:mm a')}
                    </div>
                  </div>
                  <div className={`font-bold ${tx.points_earned > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.points_earned > 0 ? '+' : '-'}
                    {tx.points_earned || tx.points_redeemed} pts
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No activity yet. Book an appointment to start earning!</p>
            </div>
          )}
        </Card>

        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-accent">
            ← Back to Main Site
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Rewards;
