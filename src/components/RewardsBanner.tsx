import { Gift, Trophy, Users } from "lucide-react";
import { GoldButton } from "./ui/gold-button";
import { Link } from "react-router-dom";
import { Card } from "./ui/card";

const RewardsBanner = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-accent/5 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-accent/10 px-4 py-2 rounded-full mb-4">
            <Gift className="w-5 h-5 text-accent" />
            <span className="text-sm font-semibold text-accent uppercase tracking-wider">
              Rewards Program
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Get Rewarded for Looking Sharp
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Earn points with every visit, unlock exclusive perks, and refer friends for bonus rewards
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
          {/* Earn Points */}
          <Card className="p-6 text-center border-2 hover:border-accent/50 transition-colors">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-xl font-bold mb-2">Earn Points</h3>
            <p className="text-sm text-muted-foreground">
              Get 10 points with every haircut, plus bonus points for first visits and special occasions
            </p>
          </Card>

          {/* Unlock Rewards */}
          <Card className="p-6 text-center border-2 hover:border-accent/50 transition-colors">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-xl font-bold mb-2">Unlock Rewards</h3>
            <p className="text-sm text-muted-foreground">
              Bronze tier at 100 pts (10% off), Silver at 250 pts (20% off), Gold at 500 pts (free cut!)
            </p>
          </Card>

          {/* Refer Friends */}
          <Card className="p-6 text-center border-2 hover:border-accent/50 transition-colors">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-xl font-bold mb-2">Refer Friends</h3>
            <p className="text-sm text-muted-foreground">
              Share your referral code and earn 50 points when friends book their first appointment
            </p>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/signup">
            <GoldButton size="lg" className="w-full sm:w-auto">
              Join Rewards Program
            </GoldButton>
          </Link>
          <Link to="/rewards-program">
            <GoldButton size="lg" variant="outline" className="w-full sm:w-auto">
              Learn More
            </GoldButton>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default RewardsBanner;
