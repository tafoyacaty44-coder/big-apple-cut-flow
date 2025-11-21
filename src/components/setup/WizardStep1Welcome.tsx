import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";
import Logo from "@/components/Logo";

interface WizardStep1WelcomeProps {
  onNext: () => void;
  onSkip: () => void;
}

export const WizardStep1Welcome = ({ onNext, onSkip }: WizardStep1WelcomeProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[500px] text-center px-4"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
        className="mb-8"
      >
        <Logo variant="dark" className="w-32 h-32 mx-auto" />
        <div className="flex items-center justify-center gap-2 mt-4">
          <Sparkles className="w-6 h-6 text-primary animate-pulse" />
          <h1 className="text-4xl font-bold">Welcome!</h1>
          <Sparkles className="w-6 h-6 text-primary animate-pulse" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="max-w-2xl space-y-4"
      >
        <h2 className="text-2xl font-semibold text-foreground">
          Let's set up your booking system
        </h2>
        <p className="text-lg text-muted-foreground">
          We noticed this is a fresh project. Let's get you up and running in under 5 minutes!
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 text-left">
          <div className="p-4 rounded-lg bg-card border">
            <div className="text-3xl mb-2">🎨</div>
            <h3 className="font-semibold mb-1">Choose Your Style</h3>
            <p className="text-sm text-muted-foreground">Pick a template that fits your business</p>
          </div>
          <div className="p-4 rounded-lg bg-card border">
            <div className="text-3xl mb-2">⚙️</div>
            <h3 className="font-semibold mb-1">Customize Everything</h3>
            <p className="text-sm text-muted-foreground">Brand it with your colors and info</p>
          </div>
          <div className="p-4 rounded-lg bg-card border">
            <div className="text-3xl mb-2">🚀</div>
            <h3 className="font-semibold mb-1">Launch Instantly</h3>
            <p className="text-sm text-muted-foreground">Go live with a fully functional site</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-12 flex flex-col sm:flex-row gap-4"
      >
        <Button size="lg" onClick={onNext} className="group">
          Start Setup
          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
        <Button size="lg" variant="ghost" onClick={onSkip}>
          Skip for now
        </Button>
      </motion.div>
    </motion.div>
  );
};
