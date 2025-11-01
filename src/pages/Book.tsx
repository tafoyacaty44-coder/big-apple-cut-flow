import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Card, CardContent } from '@/components/ui/card';
import { GoldButton } from '@/components/ui/gold-button';
import { Calendar, AlertCircle, CheckCircle, User as UserIcon, Scissors, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getServices } from '@/lib/api/services';
import { getBarbersWithRealAvailability } from '@/lib/api/barbers';
import { useBooking } from '@/contexts/BookingContext';
import BarberCard from '@/components/booking/BarberCard';
import { SevenDayAvailability } from '@/components/booking/SevenDayAvailability';
import CustomerInfoForm from '@/components/booking/CustomerInfoForm';
import DiscountCodesForm from '@/components/booking/DiscountCodesForm';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { BookingSidebar } from '@/components/booking/BookingSidebar';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileSummary, setShowMobileSummary] = useState(false);
  const [vipCodeFromForm, setVipCodeFromForm] = useState('');
  const [vipCodeValid, setVipCodeValid] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoCampaignId, setPromoCampaignId] = useState<string | undefined>();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'zelle' | 'apple_pay' | 'venmo' | 'cash_app' | null>(null);
  const { booking, setSelectedService, setSelectedBarber, setSelectedDate, setSelectedTime, setCustomerInfo, setBlacklisted, resetBooking } = useBooking();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleVipCodeChange = (code: string, isValid: boolean) => {
    setVipCodeFromForm(code);
    setVipCodeValid(isValid);
  };

  const handlePromoCodeChange = (code: string, discount: number, campaignId?: string) => {
    setPromoCode(code);
    setPromoDiscount(discount);
    setPromoCampaignId(campaignId);
  };

  const { data: services = [], isLoading: isLoadingServices } = useQuery({
    queryKey: ['services'],
    queryFn: getServices,
  });

  const selectedService = services.find((s) => s.id === booking.selectedServiceId);

  const { data: barbers = [], isLoading: isLoadingBarbers } = useQuery({
    queryKey: ['barbers', 'real-availability', selectedService?.duration_minutes],
    queryFn: () => getBarbersWithRealAvailability(selectedService?.duration_minutes || 30),
    enabled: currentStep === 3 && !!selectedService,
  });

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
  };

  const handleBarberSelect = (barberId: string, barberName: string) => {
    setSelectedBarber(barberId, barberName, []);
  };

  const handleDateTimeSelect = (date: string, time: string) => {
    setSelectedDate(new Date(date));
    setSelectedTime(time);
  };

  const handleCustomerInfoSubmit = async (data: { full_name: string; email: string; phone: string; notes?: string }) => {
    // Check blacklist
    try {
      const { data: blacklistResult, error } = await supabase.functions.invoke('check-blacklist', {
        body: {
          email: data.email,
          phone: data.phone,
        },
      });

      if (error) {
        console.error('Blacklist check error:', error);
        // Continue anyway if check fails - don't block legitimate customers
      }

      if (blacklistResult?.blacklisted) {
        setBlacklisted(true);
        setCustomerInfo({
          name: data.full_name,
          email: data.email,
          phone: data.phone,
        });
        toast({
          title: 'No Availability',
          description: 'Unfortunately, we don\'t have any available appointments at this time. Please check back later.',
          variant: 'destructive',
        });
        return; // Don't proceed
      }

      // Not blacklisted, proceed
      setCustomerInfo({
        name: data.full_name,
        email: data.email,
        phone: data.phone,
      });
      
      // If on step 1, move to step 2
      if (currentStep === 1) {
        setCurrentStep(2);
      } else if (currentStep === 4) {
        // If on final step, submit booking
        handleConfirmBooking();
      }
    } catch (error) {
      console.error('Error checking blacklist:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleEditStep = (step: number) => {
    setCurrentStep(step);
    if (isMobile) setShowMobileSummary(false);
  };

  const canContinueStep = (step: number) => {
    if (step === 1) return !!booking.customerInfo;
    if (step === 2) return !!booking.selectedServiceId;
    if (step === 3) return !!booking.selectedBarberId && !!booking.selectedDate && !!booking.selectedTime;
    if (step === 4) return !!(booking.selectedServiceId && booking.selectedBarberId && booking.selectedDate && booking.selectedTime && booking.customerInfo && selectedPaymentMethod);
    return false;
  };

  const bookingMutation = useMutation({
    mutationFn: async (vipCode?: string) => {
      if (!booking.selectedServiceId || !booking.selectedBarberId || !booking.selectedDate || !booking.selectedTime || !booking.customerInfo) {
        throw new Error('Missing booking information');
      }

      toast({
        title: 'Booking in progress...',
        description: 'Please wait while we confirm your appointment.',
      });

      const { data, error } = await supabase.functions.invoke('book-appointment', {
        body: {
          service_id: booking.selectedServiceId,
          barber_id: booking.selectedBarberId,
          appointment_date: format(booking.selectedDate, 'yyyy-MM-dd'),
          appointment_time: booking.selectedTime,
          customer_id: user?.id || null,
          guest_name: !user ? booking.customerInfo.name : null,
          guest_email: !user ? booking.customerInfo.email : null,
          guest_phone: !user ? booking.customerInfo.phone : null,
          vip_code: vipCode || null,
          promo_code: promoCode || null,
          campaign_id: promoCampaignId || null,
          payment_method: selectedPaymentMethod,
        },
      });

      if (error) {
        if (error.message?.includes('time slot is no longer available')) {
          throw new Error('This time slot was just booked by another customer. Please select a different time.');
        }
        throw new Error(error.message || 'Failed to create appointment');
      }
      return data;
    },
    onSuccess: (data) => {
      const selectedSvc = services.find(s => s.id === booking.selectedServiceId);
      
      queryClient.invalidateQueries({ queryKey: ['availability', 'today'] });
      if (booking.selectedBarberId) {
        queryClient.invalidateQueries({ 
          queryKey: ['availability', 'barber', booking.selectedBarberId] 
        });
      }

      toast({
        title: '✓ Booking Confirmed!',
        description: `Your appointment is set for ${booking.selectedTime}`,
      });
      
      const params = new URLSearchParams({
        confirmation: data.confirmation_number,
        service: selectedSvc?.name || '',
        barber: booking.selectedBarberName || '',
        date: booking.selectedDate ? format(booking.selectedDate, 'yyyy-MM-dd') : '',
        time: booking.selectedTime || '',
        name: booking.customerInfo?.name || '',
        email: booking.customerInfo?.email || '',
        phone: booking.customerInfo?.phone || '',
        vip: data.vip_applied ? 'true' : 'false',
        payment_method: selectedPaymentMethod || 'zelle',
      });

      resetBooking();
      navigate(`/booking-success?${params.toString()}`);
    },
    onError: (error: any) => {
      toast({
        title: 'Booking Failed',
        description: error.message || 'Something went wrong. Please try again or contact us for assistance.',
        variant: 'destructive',
      });
    },
  });

  const handleConfirmBooking = (vipCode?: string) => {
    const finalVipCode = vipCodeValid ? vipCodeFromForm : vipCode;
    bookingMutation.mutate(finalVipCode);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pt-20">
      <Navigation />
      
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <div className="w-80 flex-shrink-0">
            <BookingSidebar
              currentStep={currentStep}
              selectedService={selectedService ? {
                name: selectedService.name,
                price: selectedService.regular_price,
                vip_price: selectedService.vip_price
              } : null}
              selectedBarber={booking.selectedBarberName ? { name: booking.selectedBarberName } : null}
              selectedDate={booking.selectedDate}
              selectedTime={booking.selectedTime}
              customerInfo={booking.customerInfo}
              onEditStep={handleEditStep}
              onContinue={() => {
                if (currentStep === 1 && canContinueStep(1)) setCurrentStep(2);
                if (currentStep === 2 && canContinueStep(2)) setCurrentStep(3);
                if (currentStep === 3 && canContinueStep(3)) setCurrentStep(4);
                if (currentStep === 4) handleConfirmBooking();
              }}
              canContinue={canContinueStep(currentStep)}
              customerInfoFormId="customer-info-form"
            />
          </div>
        )}

        {/* Mobile Summary Header */}
        {isMobile && (
          <div className="sticky top-0 z-50 bg-background border-b shadow-sm">
            <button
              onClick={() => setShowMobileSummary(!showMobileSummary)}
              className="w-full flex items-center justify-between p-4 active:bg-muted/50 transition-colors"
            >
              <div className="text-left">
                <div className="font-semibold">Step {currentStep} of 4</div>
                <div className="text-sm text-muted-foreground truncate">
                  {booking.customerInfo?.name}
                  {selectedService && ` • ${selectedService.name}`}
                  {booking.selectedBarberName && ` • ${booking.selectedBarberName}`}
                </div>
              </div>
              <div className="text-[hsl(var(--accent))] font-bold">
                ${selectedService?.regular_price || 0}
              </div>
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-5xl mx-auto">
            {/* Blacklist Warning */}
            {booking.isBlacklisted && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Unfortunately, we don't have any available appointments at this time. Please check back later.
                </AlertDescription>
              </Alert>
            )}

            {/* Step 1: Customer Information */}
            {currentStep === 1 && !booking.isBlacklisted && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Your Information</h2>
                  <p className="text-muted-foreground">Let's start with your contact details</p>
                </div>
                <CustomerInfoForm 
                  onSubmit={handleCustomerInfoSubmit}
                  selectedServiceId={booking.selectedServiceId}
                />
                {isMobile && (
                  <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t z-40 shadow-lg">
                    <GoldButton
                      type="submit"
                      form="customer-info-form"
                      className="w-full min-h-[48px]"
                    >
                      Continue to Service Selection
                    </GoldButton>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Select Service */}
            {currentStep === 2 && !booking.isBlacklisted && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Select a Service</h2>
                  <p className="text-muted-foreground">Choose the service you'd like to book</p>
                </div>
                {isLoadingServices ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Card key={i} className="animate-pulse">
                        <div className="aspect-[3/2] bg-muted rounded-t-lg" />
                        <CardContent className="p-4 space-y-2">
                          <div className="h-6 bg-muted rounded w-3/4" />
                          <div className="h-4 bg-muted rounded w-full" />
                          <div className="h-4 bg-muted rounded w-1/2" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {services.map((service) => {
                      const imageSrc = serviceImages[service.name] || serviceImages["Haircut"];
                      
                      return (
                        <Card
                          key={service.id}
                          className={cn(
                            "cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
                            booking.selectedServiceId === service.id && 'border-[hsl(var(--accent))] border-2 shadow-lg'
                          )}
                          onClick={() => handleServiceSelect(service.id)}
                        >
                          <div className="aspect-[3/2] overflow-hidden rounded-t-lg">
                            <img
                              src={imageSrc}
                              alt={service.name}
                              loading="lazy"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-bold text-lg mb-1">{service.name}</h3>
                            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{service.description}</p>
                            <div className="flex justify-between items-center">
                              <div>
                                <span className="text-lg font-bold text-[hsl(var(--accent))]">
                                  ${service.regular_price}
                                </span>
                                {service.vip_price && (
                                  <span className="text-xs text-muted-foreground ml-2">
                                    VIP: ${service.vip_price}
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {service.duration_minutes} min
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
                {isMobile && (
                  <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t z-40 shadow-lg">
                    <GoldButton
                      className="w-full min-h-[48px]"
                      onClick={() => booking.selectedServiceId && setCurrentStep(3)}
                      disabled={!booking.selectedServiceId}
                    >
                      Continue to Barber Selection
                    </GoldButton>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Select Barber + Date/Time */}
            {currentStep === 3 && !booking.isBlacklisted && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Choose Your Barber & Time</h2>
                  <p className="text-muted-foreground">Select a barber and pick your preferred date and time</p>
                </div>
                {isLoadingBarbers ? (
                  <div className="space-y-4">
                    <Card className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="h-32 bg-muted rounded" />
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <Card 
                      className="border-[hsl(var(--accent))] bg-[hsl(var(--accent))]/5 hover:bg-[hsl(var(--accent))]/10 transition-colors cursor-pointer"
                      onClick={() => handleBarberSelect('any', 'Any Available Barber')}
                    >
                      <CardContent className="p-6 text-center">
                        <Calendar className="h-12 w-12 mx-auto mb-3 text-[hsl(var(--accent))]" />
                        <h3 className="font-bold text-lg mb-2">Any Available Barber</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Get the first available time slot with any of our skilled barbers
                        </p>
                      </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {barbers.map((barber) => (
                        <BarberCard
                          key={barber.id}
                          barber={barber}
                          selectedServiceName={selectedService?.name || ""}
                          selectedServicePrice={selectedService?.regular_price || 0}
                          selectedServiceDuration={selectedService?.duration_minutes || 0}
                          isSelected={booking.selectedBarberId === barber.id}
                          onSelect={() => handleBarberSelect(barber.id, barber.full_name)}
                        />
                      ))}
                    </div>

                    {booking.selectedBarberId && selectedService && (
                      <div className="mt-8 pt-8 border-t">
                        <h3 className="text-2xl font-bold mb-4">Pick Your Date & Time</h3>
                        <SevenDayAvailability
                          barberId={booking.selectedBarberId}
                          serviceDuration={selectedService.duration_minutes}
                          onSelectTime={handleDateTimeSelect}
                        />
                      </div>
                    )}
                  </div>
                )}
                {isMobile && (
                  <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t z-40 shadow-lg">
                    <GoldButton
                      className="w-full min-h-[48px]"
                      onClick={() => canContinueStep(3) && setCurrentStep(4)}
                      disabled={!canContinueStep(3)}
                    >
                      Continue to Confirmation
                    </GoldButton>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Review & Confirm */}
            {currentStep === 4 && selectedService && !booking.isBlacklisted && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Review Your Booking</h2>
                  <p className="text-muted-foreground">Confirm your details and complete booking</p>
                </div>

                {/* Payment Verification Alert */}
                <Alert className="bg-[hsl(var(--accent))]/10 border-[hsl(var(--accent))]/30">
                  <AlertCircle className="h-4 w-4 text-[hsl(var(--accent))]" />
                  <AlertTitle className="text-[hsl(var(--accent))]">📋 Payment Verification Required</AlertTitle>
                  <AlertDescription>
                    Your appointment will be pending until we verify your payment. Once payment is confirmed, we'll send you a confirmation email (typically within 2-4 hours).
                  </AlertDescription>
                </Alert>

                {/* Booking Summary Card */}
                <Card className="border-[hsl(var(--accent))]/20 bg-muted/50">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-xl mb-4">Booking Details</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Customer:</span>
                        <span className="font-semibold">{booking.customerInfo?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Service:</span>
                        <span className="font-semibold">{selectedService.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Barber:</span>
                        <span className="font-semibold">{booking.selectedBarberName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date & Time:</span>
                        <span className="font-semibold">
                          {booking.selectedDate && booking.selectedTime 
                            ? `${format(booking.selectedDate, "MMM d, yyyy")} at ${booking.selectedTime}`
                            : ""
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="font-semibold">{selectedService.duration_minutes} minutes</span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between text-lg">
                        <span className="font-bold">Total:</span>
                        <span className="font-bold text-[hsl(var(--accent))]">${selectedService.regular_price}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Method Selection */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-2">Select Payment Method</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Choose how you'll send your payment. You'll need to complete payment after booking.
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      {[
                        { id: 'zelle' as const, name: 'Zelle', info: 'info@bigapplebarbershop.com' },
                        { id: 'apple_pay' as const, name: 'Apple Pay', info: '(555) 123-4567' },
                        { id: 'venmo' as const, name: 'Venmo', info: '@BigAppleBarberShop' },
                        { id: 'cash_app' as const, name: 'Cash App', info: '$BigAppleBarbers' },
                      ].map((method) => (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setSelectedPaymentMethod(method.id)}
                          className={`p-4 border-2 rounded-lg text-left transition-all ${
                            selectedPaymentMethod === method.id
                              ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent))]/10'
                              : 'border-border hover:border-[hsl(var(--accent))]/50'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-semibold mb-1">{method.name}</p>
                              <p className="text-xs text-muted-foreground">{method.info}</p>
                            </div>
                            {selectedPaymentMethod === method.id && (
                              <CheckCircle className="h-5 w-5 text-[hsl(var(--accent))] flex-shrink-0" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>

                    {selectedPaymentMethod && (
                      <Alert className="bg-[hsl(var(--accent))]/5 border-[hsl(var(--accent))]/20">
                        <AlertDescription className="text-sm">
                          After completing your booking, send ${selectedService.regular_price} via {
                            selectedPaymentMethod === 'zelle' ? 'Zelle' :
                            selectedPaymentMethod === 'apple_pay' ? 'Apple Pay' :
                            selectedPaymentMethod === 'venmo' ? 'Venmo' : 'Cash App'
                          } and include your confirmation number in the payment note.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>

                {/* VIP/Promo Codes */}
                <DiscountCodesForm 
                  onVipCodeChange={handleVipCodeChange}
                  onPromoCodeChange={handlePromoCodeChange}
                  selectedServiceId={booking.selectedServiceId}
                  promoDiscount={promoDiscount}
                />

                {/* Mobile Complete Booking Button */}
                {isMobile && (
                  <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t z-40 shadow-lg">
                    <GoldButton
                      onClick={() => handleConfirmBooking()}
                      disabled={!canContinueStep(4) || bookingMutation.isPending}
                      className="w-full min-h-[48px]"
                      size="lg"
                    >
                      {bookingMutation.isPending ? "Processing..." : "Complete Booking"}
                    </GoldButton>
                  </div>
                )}
              </div>
            )}

            {/* Blacklisted - Show Dead End */}
            {booking.isBlacklisted && currentStep > 1 && (
              <Alert variant="destructive" className="mt-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  We apologize, but we're unable to show available appointments at this time. Please try again later or contact us directly.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Book;
