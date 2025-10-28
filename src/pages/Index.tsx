import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import { TodayAvailability } from "@/components/TodayAvailability";
import RewardsBanner from "@/components/RewardsBanner";
import Services from "@/components/Services";
import Hours from "@/components/Hours";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <TodayAvailability />
      <RewardsBanner />
      <Services />
      <Hours />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;
