import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Database, Sparkles } from "lucide-react";

interface WizardStep6DataSetupProps {
  onNext: (loadDemoData: boolean) => void;
  onBack: () => void;
}

export const WizardStep6DataSetup = ({ onNext, onBack }: WizardStep6DataSetupProps) => {
  const [selection, setSelection] = useState<'demo' | 'fresh' | null>(null);

  const handleContinue = () => {
    if (selection) {
      onNext(selection === 'demo');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-4xl mx-auto"
    >
      <div className="text-center mb-8">
        <div className="inline-flex p-3 rounded-full bg-primary/10 mb-4">
          <Database className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Initial Data Setup</h2>
        <p className="text-muted-foreground">
          Choose how you'd like to start. You can always change or remove data later.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card
          className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
            selection === 'demo'
              ? 'ring-2 ring-primary border-primary'
              : 'hover:border-primary/50'
          }`}
          onClick={() => setSelection('demo')}
        >
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Load Demo Data</h3>
              <p className="text-sm text-muted-foreground">
                Perfect for testing and seeing how it works
              </p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <p className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              3 sample staff members
            </p>
            <p className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Sample appointments
            </p>
            <p className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Example gallery images
            </p>
            <p className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Sample blog posts
            </p>
          </div>

          <div className="mt-4 p-3 bg-muted/50 rounded">
            <p className="text-xs text-muted-foreground">
              All demo data can be easily deleted from the admin dashboard
            </p>
          </div>
        </Card>

        <Card
          className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
            selection === 'fresh'
              ? 'ring-2 ring-primary border-primary'
              : 'hover:border-primary/50'
          }`}
          onClick={() => setSelection('fresh')}
        >
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Database className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Start Fresh</h3>
              <p className="text-sm text-muted-foreground">
                I want to add everything myself
              </p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <p className="flex items-center gap-2">
              <span className="text-blue-500">•</span>
              Empty staff list
            </p>
            <p className="flex items-center gap-2">
              <span className="text-blue-500">•</span>
              No appointments
            </p>
            <p className="flex items-center gap-2">
              <span className="text-blue-500">•</span>
              Empty gallery
            </p>
            <p className="flex items-center gap-2">
              <span className="text-blue-500">•</span>
              No blog posts
            </p>
          </div>

          <div className="mt-4 p-3 bg-muted/50 rounded">
            <p className="text-xs text-muted-foreground">
              Build your booking system exactly the way you want it
            </p>
          </div>
        </Card>
      </div>

      {selection && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-primary/10 border border-primary/20 rounded-lg mb-6"
        >
          <p className="text-sm">
            <strong>Selected:</strong>{' '}
            {selection === 'demo' ? 'Load Demo Data' : 'Start Fresh'}
          </p>
        </motion.div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button
          onClick={handleContinue}
          disabled={!selection}
          className="flex-1"
        >
          Continue
        </Button>
      </div>
    </motion.div>
  );
};
