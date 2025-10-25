import { useState, useRef } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SectionHeading from '@/components/ui/section-heading';
import { Card } from '@/components/ui/card';
import { GoldButton } from '@/components/ui/gold-button';
import { Check } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getServices } from '@/lib/api/services';
import { getBarbersWithAvailability } from '@/lib/api/barbers';
import { useBooking } from '@/contexts/BookingContext';
import BarberCard from '@/components/booking/BarberCard';
import DateTimePicker from '@/components/booking/DateTimePicker';
import CustomerInfoForm from '@/components/booking/CustomerInfoForm';
import { format } from 'date-fns';

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
  const [currentStep, setCurrentStep] = useState(1);
  const { booking, setSelectedService, setSelectedBarber, setSelectedDate, setSelectedTime, setCustomerInfo } = useBooking();
  const customerFormRef = useRef<HTMLFormElement>(null);

  const { data: services = [], isLoading: isLoadingServices } = useQuery({
    queryKey: ['services'],
    queryFn: getServices,
  });

  const { data: barbers = [], isLoading: isLoadingBarbers } = useQuery({
    queryKey: ['barbers'],
    queryFn: getBarbersWithAvailability,
    enabled: currentStep === 2,
  });

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
  };

  const handleBarberSelect = (barberId: string, barberName: string, availability: any[]) => {
    setSelectedBarber(barberId, barberName, availability);
  };

  const handleNextFromService = () => {
    if (booking.selectedServiceId && currentStep === 1) {
      setCurrentStep(2);
    }
  };

  const handleNextFromBarber = () => {
    if (booking.selectedBarberId && currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handleNextFromDateTime = () => {
    if (booking.selectedDate && booking.selectedTime && currentStep === 3) {
      setCurrentStep(4);
    }
  };

  const handleCustomerInfoSubmit = (data: { full_name: string; email: string; phone: string; notes?: string }) => {
    setCustomerInfo({
      name: data.full_name,
      email: data.email,
      phone: data.phone,
    });
    setCurrentStep(5);
  };

  const handleNextFromCustomerInfo = () => {
    // Trigger form submission programmatically
    if (customerFormRef.current) {
      const submitButton = customerFormRef.current.querySelector('button[type="submit"]') as HTMLButtonElement;
      submitButton?.click();
    }
  };

  const selectedService = services.find(s => s.id === booking.selectedServiceId);

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

              {isLoadingServices ? (
                <div className="text-center py-12">Loading services...</div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {services.map((service) => (
                    <Card
                      key={service.id}
                      onClick={() => handleServiceSelect(service.id)}
                      className={`cursor-pointer transition-all duration-300 overflow-hidden ${
                        booking.selectedServiceId === service.id
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
                        {booking.selectedServiceId === service.id && (
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
                  onClick={handleNextFromService}
                  disabled={!booking.selectedServiceId}
                >
                  Continue to Barber Selection
                </GoldButton>
              </div>
            </div>
          )}

          {/* Step 2: Barber Selection */}
          {currentStep === 2 && (
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
                  </div>
                </Card>
              )}

              {isLoadingBarbers ? (
                <div className="text-center py-12">Loading barbers...</div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {barbers.map((barber) => (
                    <BarberCard
                      key={barber.id}
                      barber={barber}
                      selectedServiceName={selectedService?.name || ''}
                      selectedServicePrice={selectedService?.regular_price || 0}
                      selectedServiceDuration={selectedService?.duration_minutes || 0}
                      isSelected={booking.selectedBarberId === barber.id}
                      onSelect={() => handleBarberSelect(barber.id, barber.full_name, barber.availability)}
                    />
                  ))}
                </div>
              )}

              <div className="flex gap-4 justify-center">
                <GoldButton variant="outline" onClick={() => setCurrentStep(1)}>
                  Back to Services
                </GoldButton>
                <GoldButton 
                  onClick={handleNextFromBarber}
                  disabled={!booking.selectedBarberId}
                >
                  Continue to Date & Time
                </GoldButton>
              </div>
            </div>
          )}

          {/* Step 3: Date & Time Selection */}
          {currentStep === 3 && booking.barberAvailability && (
            <div className="max-w-6xl mx-auto">
              {/* Summary Card */}
              <Card className="mb-8 p-4 bg-[hsl(var(--accent))]/10 border-[hsl(var(--accent))]">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-bold text-lg">Service: {selectedService?.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      ${selectedService?.regular_price} • {selectedService?.duration_minutes} min
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Barber: {booking.selectedBarberName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {booking.selectedDate && booking.selectedTime
                        ? `${format(booking.selectedDate, 'MMMM d, yyyy')} at ${booking.selectedTime}`
                        : 'Select a date and time below'}
                    </p>
                  </div>
                </div>
              </Card>

              <DateTimePicker
                barberAvailability={booking.barberAvailability}
                serviceDuration={selectedService?.duration_minutes || 30}
                selectedDate={booking.selectedDate}
                selectedTime={booking.selectedTime}
                onDateSelect={setSelectedDate}
                onTimeSelect={setSelectedTime}
              />

              <div className="flex gap-4 justify-center mt-8">
                <GoldButton variant="outline" onClick={() => setCurrentStep(2)}>
                  Back to Barbers
                </GoldButton>
                <GoldButton 
                  onClick={handleNextFromDateTime}
                  disabled={!booking.selectedDate || !booking.selectedTime}
                >
                  Continue to Customer Info
                </GoldButton>
              </div>
            </div>
          )}

          {/* Step 4: Customer Information */}
          {currentStep === 4 && (
            <div className="max-w-6xl mx-auto">
              {/* Summary Card */}
              <Card className="mb-8 p-4 bg-[hsl(var(--accent))]/10 border-[hsl(var(--accent))]">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <h3 className="font-bold">Service</h3>
                    <p className="text-sm">{selectedService?.name}</p>
                    <p className="text-xs text-muted-foreground">${selectedService?.regular_price}</p>
                  </div>
                  <div>
                    <h3 className="font-bold">Barber</h3>
                    <p className="text-sm">{booking.selectedBarberName}</p>
                  </div>
                  <div>
                    <h3 className="font-bold">Date & Time</h3>
                    <p className="text-sm">
                      {booking.selectedDate && format(booking.selectedDate, 'MMM d, yyyy')}
                    </p>
                    <p className="text-xs text-muted-foreground">{booking.selectedTime}</p>
                  </div>
                </div>
              </Card>

              <div ref={customerFormRef as any}>
                <CustomerInfoForm
                  onSubmit={handleCustomerInfoSubmit}
                  initialData={booking.customerInfo ? {
                    full_name: booking.customerInfo.name,
                    email: booking.customerInfo.email,
                    phone: booking.customerInfo.phone,
                  } : null}
                />
              </div>

              <div className="flex gap-4 justify-center mt-8">
                <GoldButton variant="outline" onClick={() => setCurrentStep(3)}>
                  Back to Date & Time
                </GoldButton>
                <GoldButton onClick={handleNextFromCustomerInfo}>
                  Continue to Confirmation
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
