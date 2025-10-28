import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
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
      <RewardsBanner />
      <Services />
      <Hours />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;
