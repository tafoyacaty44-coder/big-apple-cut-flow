import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Scissors } from "lucide-react";

interface WizardStep5CustomizationProps {
  onNext: () => void;
  onBack: () => void;
  selectedTemplate: any;
}

export const WizardStep5Customization = ({
  onNext,
  onBack,
  selectedTemplate,
}: WizardStep5CustomizationProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-4xl mx-auto"
    >
      <div className="text-center mb-8">
        <div className="inline-flex p-3 rounded-full bg-primary/10 mb-4">
          <Scissors className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Customize Services</h2>
        <p className="text-muted-foreground">
          Your selected template includes pre-configured services. You can customize them now or after setup.
        </p>
      </div>

      <div className="bg-card border rounded-lg p-6 mb-6">
        <h3 className="font-semibold mb-4">Template Services Preview</h3>
        <div className="space-y-2">
          {selectedTemplate?.config_json?.services?.map((service: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded">
              <div>
                <p className="font-medium">{service.name}</p>
                <p className="text-sm text-muted-foreground">{service.duration || 30} min</p>
              </div>
              <p className="font-semibold">${service.price || 0}</p>
            </div>
          )) || (
            <p className="text-muted-foreground text-center py-4">
              No services in this template. You'll add them manually after setup.
            </p>
          )}
        </div>
      </div>

      <div className="p-4 bg-muted/50 rounded-lg mb-6">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">Note:</strong> You can edit, add, or remove services anytime from the admin dashboard after completing setup.
        </p>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button onClick={onNext} className="flex-1">
          Use Template As-Is
        </Button>
      </div>
    </motion.div>
  );
};
