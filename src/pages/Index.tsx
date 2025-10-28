import Navigation from "@/components/Navigation";
import QuickActionsHub from "@/components/home/QuickActionsHub";
import LiveAvailabilityBoard from "@/components/home/LiveAvailabilityBoard";
import CompactServicesGrid from "@/components/home/CompactServicesGrid";
import RewardsTierShowcase from "@/components/home/RewardsTierShowcase";
import Hours from "@/components/Hours";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <QuickActionsHub />
      <LiveAvailabilityBoard />
      <CompactServicesGrid />
      <RewardsTierShowcase />
      <Hours />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;
