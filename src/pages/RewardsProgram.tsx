import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Gift, Trophy, Users, Sparkles, Check } from "lucide-react";
import { GoldButton } from "@/components/ui/gold-button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const RewardsProgram = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-accent/10 to-background">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-accent/20 px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-5 h-5 text-accent" />
            <span className="text-sm font-semibold text-accent uppercase tracking-wider">
              Big Apple Rewards
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Your Loyalty Deserves Rewards
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Join our rewards program and earn points with every visit. Unlock exclusive discounts, 
            free services, and VIP perks as you level up through our reward tiers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <GoldButton size="lg">
                Create Account & Start Earning
              </GoldButton>
            </Link>
            <Link to="/login">
              <GoldButton size="lg" variant="outline">
                Already a Member? Sign In
              </GoldButton>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
            <div className="text-center">
              <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-accent">
                <span className="text-3xl font-bold text-accent">1</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Sign Up</h3>
              <p className="text-muted-foreground">
                Create your free account and get instant access to the rewards program
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-accent">
                <span className="text-3xl font-bold text-accent">2</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Earn Points</h3>
              <p className="text-muted-foreground">
                Collect points with every haircut, referral, and special promotion
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-accent">
                <span className="text-3xl font-bold text-accent">3</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Redeem Rewards</h3>
              <p className="text-muted-foreground">
                Use your points for discounts or unlock a free service when you reach Gold tier
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ways to Earn */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">Ways to Earn Points</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Multiple opportunities to rack up points and reach your next reward tier
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center shrink-0">
                  <Trophy className="w-6 h-6 text-accent" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold">Completed Haircut</h3>
                    <Badge className="bg-accent/20 text-accent border-accent">+10 pts</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Earn points automatically with every completed service
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold">Refer a Friend</h3>
                    <Badge className="bg-accent/20 text-accent border-accent">+50 pts</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Get bonus points when your referral books their first cut
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6 text-accent" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold">First Visit Bonus</h3>
                    <Badge className="bg-accent/20 text-accent border-accent">+20 pts</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Welcome gift for first-time customers who join
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center shrink-0">
                  <Gift className="w-6 h-6 text-accent" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold">Birthday Bonus</h3>
                    <Badge className="bg-accent/20 text-accent border-accent">+30 pts</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Celebrate your birthday month with bonus points
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold">Social Share</h3>
                    <Badge className="bg-accent/20 text-accent border-accent">+25 pts</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Share your experience on social media for bonus points
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-2 border-accent/50 relative overflow-hidden">
              <div className="absolute top-2 right-2">
                <Badge className="bg-accent text-primary">Coming Soon</Badge>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6 text-accent" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold">Special Promotions</h3>
                    <Badge className="bg-accent/20 text-accent border-accent">Varies</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Watch for seasonal promotions and bonus point events
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Reward Tiers */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">Reward Tiers</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Progress through three exclusive tiers and unlock bigger savings
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Bronze Tier */}
            <Card className="p-8 text-center border-2 hover:border-accent/50 transition-all hover:shadow-lg">
              <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-orange-500">
                <Trophy className="w-10 h-10 text-orange-500" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Bronze</h3>
              <p className="text-3xl font-bold text-accent mb-4">10% Off</p>
              <div className="text-sm text-muted-foreground mb-6">
                Reach <span className="font-bold text-foreground">100 points</span>
              </div>
              <div className="space-y-2 text-left">
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span className="text-sm">10% discount on all services</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span className="text-sm">Birthday bonus points</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span className="text-sm">Priority booking notifications</span>
                </div>
              </div>
            </Card>

            {/* Silver Tier */}
            <Card className="p-8 text-center border-2 border-accent hover:border-accent transition-all shadow-xl scale-105">
              <Badge className="mb-4 bg-accent text-primary">Most Popular</Badge>
              <div className="w-20 h-20 bg-slate-400/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-slate-400">
                <Trophy className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Silver</h3>
              <p className="text-3xl font-bold text-accent mb-4">20% Off</p>
              <div className="text-sm text-muted-foreground mb-6">
                Reach <span className="font-bold text-foreground">250 points</span>
              </div>
              <div className="space-y-2 text-left">
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span className="text-sm">20% discount on all services</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span className="text-sm">All Bronze benefits</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span className="text-sm">Exclusive monthly promotions</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span className="text-sm">Free styling consultation</span>
                </div>
              </div>
            </Card>

            {/* Gold Tier */}
            <Card className="p-8 text-center border-2 hover:border-accent/50 transition-all hover:shadow-lg">
              <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-accent">
                <Trophy className="w-10 h-10 text-accent" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Gold</h3>
              <p className="text-3xl font-bold text-accent mb-4">Free Haircut</p>
              <div className="text-sm text-muted-foreground mb-6">
                Reach <span className="font-bold text-foreground">500 points</span>
              </div>
              <div className="space-y-2 text-left">
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span className="text-sm">100% off - Complimentary service</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span className="text-sm">All Silver benefits</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span className="text-sm">VIP appointment priority</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span className="text-sm">Exclusive Gold member events</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-accent/10 to-background">
        <div className="container mx-auto px-4 text-center">
          <Gift className="w-16 h-16 text-accent mx-auto mb-6" />
          <h2 className="text-4xl font-bold mb-4">Ready to Start Earning?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Create your free account today and get your first 20 points as a welcome bonus
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <GoldButton size="lg">
                Sign Up Now
              </GoldButton>
            </Link>
            <Link to="/book">
              <GoldButton size="lg" variant="outline">
                Book Appointment
              </GoldButton>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default RewardsProgram;
