import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Home, Settings, Users, Scissors, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface WizardStep7CompleteProps {
  businessName: string;
}

export const WizardStep7Complete = ({ businessName }: WizardStep7CompleteProps) => {
  const navigate = useNavigate();

  const quickActions = [
    {
      icon: Home,
      title: "Visit Homepage",
      description: "See your booking system live",
      action: () => navigate('/'),
    },
    {
      icon: Settings,
      title: "Admin Dashboard",
      description: "Manage your business",
      action: () => navigate('/admin'),
    },
    {
      icon: Users,
      title: "Add Staff Members",
      description: "Configure your team",
      action: () => navigate('/admin'),
    },
    {
      icon: Scissors,
      title: "Configure Services",
      description: "Customize your offerings",
      action: () => navigate('/admin/services'),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-3xl mx-auto text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
        className="mb-6"
      >
        <div className="inline-flex p-4 rounded-full bg-green-500/10 mb-4">
          <CheckCircle2 className="w-16 h-16 text-green-500" />
        </div>
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-primary animate-pulse" />
          <h1 className="text-3xl font-bold">Setup Complete!</h1>
          <Sparkles className="w-6 h-6 text-primary animate-pulse" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8"
      >
        <h2 className="text-xl font-semibold mb-2">
          {businessName} is ready to accept bookings!
        </h2>
        <p className="text-muted-foreground">
          Your booking system is fully configured and ready to use. Here's what you can do next:
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
      >
        {quickActions.map((action, index) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 + index * 0.1 }}
          >
            <Card
              className="p-4 text-left cursor-pointer hover:shadow-lg transition-all hover:border-primary/50"
              onClick={action.action}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <action.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{action.title}</h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="space-y-4"
      >
        <Button size="lg" onClick={() => navigate('/admin')} className="w-full md:w-auto">
          Go to Admin Dashboard
        </Button>

        <div className="p-4 bg-muted/50 rounded-lg text-sm text-left">
          <p className="text-muted-foreground">
            <strong className="text-foreground">💡 Pro Tip:</strong> You can always change these settings later in Admin → Business Settings. Explore the admin dashboard to customize your booking flow, add team members, and configure notifications.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};
