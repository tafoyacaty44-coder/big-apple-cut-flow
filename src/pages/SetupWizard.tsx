import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { WizardStep1Welcome } from "@/components/setup/WizardStep1Welcome";
import { WizardStep2AdminAccount } from "@/components/setup/WizardStep2AdminAccount";
import { WizardStep3TemplateSelection } from "@/components/setup/WizardStep3TemplateSelection";
import { WizardStep4BusinessInfo } from "@/components/setup/WizardStep4BusinessInfo";
import { WizardStep5Customization } from "@/components/setup/WizardStep5Customization";
import { WizardStep6DataSetup } from "@/components/setup/WizardStep6DataSetup";
import { WizardStep7Complete } from "@/components/setup/WizardStep7Complete";
import { getBusinessTemplates, completeSetupWizard, skipSetup, SetupWizardData, checkSetupNeeded } from "@/lib/api/setup";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

export default function SetupWizard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userRole } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);

  // Check if setup is allowed
  useEffect(() => {
    const checkAccess = async () => {
      const setupNeeded = await checkSetupNeeded(userRole || undefined);
      
      if (!setupNeeded) {
        // Setup already complete or user doesn't have access
        navigate('/', { replace: true });
      } else {
        setIsCheckingAccess(false);
      }
    };
    
    checkAccess();
  }, [userRole, navigate]);

  // Form data
  const [adminData, setAdminData] = useState<{ fullName: string; email: string; password: string } | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [businessData, setBusinessData] = useState<any>(null);
  const [loadDemoData, setLoadDemoData] = useState(false);

  const { data: templates = [] } = useQuery({
    queryKey: ['business-templates'],
    queryFn: getBusinessTemplates,
  });

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  const totalSteps = 7;
  const progress = (currentStep / totalSteps) * 100;

  const handleSkip = () => {
    skipSetup();
    navigate('/');
  };

  const handleAdminDataSubmit = (data: { fullName: string; email: string; password: string }) => {
    setAdminData(data);
    setCurrentStep(3);
  };

  const handleTemplateSelect = () => {
    setCurrentStep(4);
  };

  const handleBusinessInfoSubmit = (data: any) => {
    setBusinessData(data);
    if (selectedTemplateId && selectedTemplateId !== 'blank') {
      setCurrentStep(5);
    } else {
      setCurrentStep(6);
    }
  };

  const handleCustomizationComplete = () => {
    setCurrentStep(6);
  };

  const handleDataSetupComplete = async (loadDemo: boolean) => {
    setLoadDemoData(loadDemo);
    setIsProcessing(true);

    try {
      if (!adminData || !businessData) {
        throw new Error('Missing required data');
      }

      const setupData: SetupWizardData = {
        adminData,
        businessData,
        templateId: selectedTemplateId !== 'blank' ? selectedTemplateId || undefined : undefined,
        loadDemoData: loadDemo,
      };

      const result = await completeSetupWizard(setupData);

      // Sign in the newly created admin
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: adminData.email,
        password: adminData.password,
      });

      if (signInError) throw signInError;

      toast({
        title: "Setup Complete!",
        description: "Your booking system is ready to use.",
      });

      setCurrentStep(7);
    } catch (error: any) {
      console.error('Setup error:', error);
      toast({
        title: "Setup Failed",
        description: error.message || "Failed to complete setup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isCheckingAccess || isProcessing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <h2 className="text-xl font-semibold">
            {isCheckingAccess ? 'Checking access...' : 'Setting up your booking system...'}
          </h2>
          <p className="text-muted-foreground">
            {isCheckingAccess ? 'Please wait' : 'This may take a moment'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Progress Bar */}
      {currentStep < 7 && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">
                Step {currentStep} of {totalSteps}
              </p>
              <p className="text-sm text-muted-foreground">
                {Math.round(progress)}% Complete
              </p>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`container mx-auto px-4 ${currentStep < 7 ? 'pt-24' : 'pt-12'} pb-12`}>
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <WizardStep1Welcome
              key="step1"
              onNext={() => setCurrentStep(2)}
              onSkip={handleSkip}
            />
          )}

          {currentStep === 2 && (
            <WizardStep2AdminAccount
              key="step2"
              onNext={handleAdminDataSubmit}
              onBack={() => setCurrentStep(1)}
              initialData={adminData || undefined}
            />
          )}

          {currentStep === 3 && (
            <WizardStep3TemplateSelection
              key="step3"
              templates={templates}
              selectedTemplateId={selectedTemplateId}
              onSelect={setSelectedTemplateId}
              onNext={handleTemplateSelect}
              onBack={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 4 && (
            <WizardStep4BusinessInfo
              key="step4"
              onNext={handleBusinessInfoSubmit}
              onBack={() => setCurrentStep(3)}
              initialData={businessData}
              selectedTemplate={selectedTemplate}
            />
          )}

          {currentStep === 5 && (
            <WizardStep5Customization
              key="step5"
              onNext={handleCustomizationComplete}
              onBack={() => setCurrentStep(4)}
              selectedTemplate={selectedTemplate}
            />
          )}

          {currentStep === 6 && (
            <WizardStep6DataSetup
              key="step6"
              onNext={handleDataSetupComplete}
              onBack={() => selectedTemplateId === 'blank' ? setCurrentStep(4) : setCurrentStep(5)}
            />
          )}

          {currentStep === 7 && (
            <WizardStep7Complete
              key="step7"
              businessName={businessData?.business_name || "Your Business"}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
