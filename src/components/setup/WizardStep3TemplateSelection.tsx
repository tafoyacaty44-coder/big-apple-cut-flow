import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Palette } from "lucide-react";
import { BusinessTemplate } from "@/lib/api/setup";

interface WizardStep3TemplateSelectionProps {
  templates: BusinessTemplate[];
  selectedTemplateId: string | null;
  onSelect: (templateId: string | null) => void;
  onNext: () => void;
  onBack: () => void;
}

export const WizardStep3TemplateSelection = ({
  templates,
  selectedTemplateId,
  onSelect,
  onNext,
  onBack,
}: WizardStep3TemplateSelectionProps) => {
  // Placeholder templates if none exist in database
  const displayTemplates = templates.length > 0 ? templates : [
    {
      id: 'blank',
      name: 'Start from Scratch',
      business_type: 'custom',
      description: 'Build your booking system from the ground up with complete control',
      config_json: {},
      preview_image_url: null,
      is_active: true,
      created_at: new Date().toISOString(),
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-5xl mx-auto"
    >
      <div className="text-center mb-8">
        <div className="inline-flex p-3 rounded-full bg-primary/10 mb-4">
          <Palette className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Choose Your Business Template</h2>
        <p className="text-muted-foreground">
          Select a template that matches your business type. You can customize everything later.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {displayTemplates.map((template, index) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                selectedTemplateId === template.id
                  ? 'ring-2 ring-primary border-primary'
                  : 'hover:border-primary/50'
              }`}
              onClick={() => onSelect(template.id)}
            >
              {template.preview_image_url ? (
                <div className="aspect-video bg-muted rounded-md mb-4 overflow-hidden">
                  <img
                    src={template.preview_image_url}
                    alt={template.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 rounded-md mb-4 flex items-center justify-center">
                  <Palette className="w-12 h-12 text-primary/40" />
                </div>
              )}

              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-lg">{template.name}</h3>
                {selectedTemplateId === template.id && (
                  <div className="bg-primary text-primary-foreground rounded-full p-1">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </div>

              <Badge variant="secondary" className="mb-2">
                {template.business_type.replace('_', ' ')}
              </Badge>

              <p className="text-sm text-muted-foreground line-clamp-2">
                {template.description || 'A professional booking system template'}
              </p>

              {template.config_json && template.config_json.features && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {template.config_json.features.slice(0, 3).map((feature: string, i: number) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      {selectedTemplateId && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-primary/10 border border-primary/20 rounded-lg mb-6"
        >
          <p className="text-sm">
            <strong>Selected:</strong>{' '}
            {displayTemplates.find(t => t.id === selectedTemplateId)?.name}
          </p>
        </motion.div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!selectedTemplateId}
          className="flex-1"
        >
          {selectedTemplateId === 'blank' ? 'Continue Without Template' : 'Continue with Template'}
        </Button>
      </div>
    </motion.div>
  );
};
