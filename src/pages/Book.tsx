import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SectionHeading from '@/components/ui/section-heading';
import { Card } from '@/components/ui/card';
import { GoldButton } from '@/components/ui/gold-button';
import { Check } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getServices } from '@/lib/api/services';

import haircutImg from '@/assets/services/haircut.jpg';
import seniorImg from '@/assets/services/senior-haircut.jpg';
import washImg from '@/assets/services/haircut-wash.jpg';
import shaveImg from '@/assets/services/royal-shave.jpg';
import maskImg from '@/assets/services/black-mask.jpg';
import beardImg from '@/assets/services/beard-trim.jpg';
import wisemanImg from '@/assets/services/wiseman-special.jpg';
import comboImg from '@/assets/services/haircut-beard-combo.jpg';

const serviceImages: Record<string, string> = {
  'Haircut': haircutImg,
  'Senior Haircut': seniorImg,
  'Haircut and Wash': washImg,
  'Royal Shave': shaveImg,
  'Black Mask Facial': maskImg,
  'Beard Trim': beardImg,
  'Wiseman Special': wisemanImg,
  'Haircut and Beard Trim': comboImg,
};

const Book = () => {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: getServices,
  });

  const handleServiceSelect = (serviceId: string) => {
    setSelectedServiceId(serviceId);
  };

  const handleNext = () => {
    if (selectedServiceId && currentStep === 1) {
      setCurrentStep(2);
    }
  };

  const selectedService = services.find(s => s.id === selectedServiceId);

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <SectionHeading 
            title="Book Your Appointment"
            subtitle="Select your service to get started"
          />

          {/* Progress Indicator */}
          <div className="max-w-3xl mx-auto mb-12">
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((step) => (
                <div key={step} className="flex items-center">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                      step <= currentStep 
                        ? 'bg-[hsl(var(--accent))] text-black' 
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {step < currentStep ? <Check className="h-5 w-5" /> : step}
                  </div>
                  {step < 5 && (
                    <div className={`w-12 h-1 ${step < currentStep ? 'bg-[hsl(var(--accent))]' : 'bg-muted'}`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs mt-2 text-muted-foreground max-w-3xl mx-auto px-2">
              <span>Service</span>
              <span>Barber</span>
              <span>Date</span>
              <span>Info</span>
              <span>Confirm</span>
            </div>
          </div>

          {/* Step 1: Service Selection */}
          {currentStep === 1 && (
            <div className="max-w-6xl mx-auto">
              {selectedService && (
                <Card className="mb-8 p-4 bg-[hsl(var(--accent))]/10 border-[hsl(var(--accent))]">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg">Selected: {selectedService.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        ${selectedService.regular_price} • {selectedService.duration_minutes} min
                      </p>
                    </div>
                    <Check className="h-6 w-6 text-[hsl(var(--accent))]" />
                  </div>
                </Card>
              )}

              {isLoading ? (
                <div className="text-center py-12">Loading services...</div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {services.map((service) => (
                    <Card
                      key={service.id}
                      onClick={() => handleServiceSelect(service.id)}
                      className={`cursor-pointer transition-all duration-300 overflow-hidden ${
                        selectedServiceId === service.id
                          ? 'border-[hsl(var(--accent))] border-2 shadow-[0_0_20px_rgba(212,175,55,0.3)]'
                          : 'border-border border-2 hover:border-[hsl(var(--accent))]/50'
                      }`}
                    >
                      <div className="aspect-[4/3] overflow-hidden relative">
                        <img 
                          src={serviceImages[service.name]}
                          alt={service.name}
                          className="w-full h-full object-cover"
                        />
                        {selectedServiceId === service.id && (
                          <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-[hsl(var(--accent))] flex items-center justify-center">
                            <Check className="h-5 w-5 text-black" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-lg mb-2">{service.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{service.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold">${service.regular_price}</span>
                          <span className="text-sm text-muted-foreground">{service.duration_minutes} min</span>
                        </div>
                        <div className="mt-2 text-xs text-[hsl(var(--accent))]">
                          VIP: ${service.vip_price}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              <div className="text-center">
                <GoldButton 
                  size="lg" 
                  onClick={handleNext}
                  disabled={!selectedServiceId}
                >
                  Continue to Barber Selection
                </GoldButton>
              </div>
            </div>
          )}

          {/* Step 2: Barber Selection - Placeholder */}
          {currentStep === 2 && (
            <div className="max-w-4xl mx-auto text-center py-12">
              <h3 className="text-2xl font-bold mb-4">Select Your Barber</h3>
              <p className="text-muted-foreground mb-8">
                This step will be completed in the next sprint
              </p>
              <div className="flex gap-4 justify-center">
                <GoldButton variant="outline" onClick={() => setCurrentStep(1)}>
                  Back to Services
                </GoldButton>
                <GoldButton onClick={() => setCurrentStep(3)}>
                  Continue (Development)
                </GoldButton>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Book;
