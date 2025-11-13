import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Card, CardContent } from '@/components/ui/card';
import { GoldButton } from '@/components/ui/gold-button';
import { Calendar, AlertCircle, CheckCircle, User as UserIcon, Scissors, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimations } from '@/hooks/useAnimations';
import { AnimatedCard } from '@/components/ui/animated-card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getServices, getAddonServices } from '@/lib/api/services';
import { getActiveBarbers } from '@/lib/api/barbers';
import { useBooking } from '@/contexts/BookingContext';
import { SimplifiedBarberCard } from '@/components/booking/SimplifiedBarberCard';
import { MonthlyCalendarPicker } from '@/components/booking/MonthlyCalendarPicker';
import CustomerInfoForm from '@/components/booking/CustomerInfoForm';
import { CompactServiceList } from '@/components/booking/CompactServiceList';
import DiscountCodesForm from '@/components/booking/DiscountCodesForm';
import { CancellationPolicy } from '@/components/booking/CancellationPolicy';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { BookingSidebar } from '@/components/booking/BookingSidebar';
import { Separator } from '@/components/ui/separator';
import { cn, calculateBookingTotal, formatTime12h } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { SeoHead } from '@/components/SeoHead';
import { getBarberAvailability } from '@/lib/api/availability';
import { addDays } from 'date-fns';

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
  const { pageTransition, cardEntrance } = useAnimations();
  const [vipCodeFromForm, setVipCodeFromForm] = useState('');
  const [vipCodeValid, setVipCodeValid] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoCampaignId, setPromoCampaignId] = useState<string | undefined>();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'zelle' | 'apple_pay' | 'venmo' | 'cash_app' | null>(null);
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
  const [policyAgreed, setPolicyAgreed] = useState(false);
  const [barberAvailabilityData, setBarberAvailabilityData] = useState<any[]>([]);
  const { booking, setSelectedService, setSelectedBarber, setSelectedDate, setSelectedTime, setCustomerInfo, setBlacklisted, setSelectedAddons, resetBooking } = useBooking();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Sync selected add-ons with booking context
  useEffect(() => {
    if (booking.selectedAddonIds.length > 0 && selectedAddonIds.length === 0) {
      setSelectedAddonIds(booking.selectedAddonIds);
    }
  }, [booking.selectedAddonIds]);

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

  const { data: addonServices = [], isLoading: isLoadingAddons } = useQuery({
    queryKey: ['services', 'addons', booking.selectedServiceId],
    queryFn: () => getAddonServices(booking.selectedServiceId),
    enabled: !!booking.selectedServiceId,
  });

  const selectedAddons = addonServices.filter(addon => selectedAddonIds.includes(addon.id));

  const { data: barbers = [], isLoading: isLoadingBarbers } = useQuery({
    queryKey: ['barbers', 'active'],
    queryFn: getActiveBarbers,
    enabled: currentStep === 3 && !!selectedService,
  });

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
    setSelectedAddonIds([]); // Reset add-ons when service changes
  };

  const handleAddonToggle = (addonId: string) => {
    setSelectedAddonIds(prev => 
      prev.includes(addonId) 
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    );
  };

  const handleBarberSelect = (barberId: string, barberName: string) => {
    setSelectedBarber(barberId, barberName, []);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
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
    if (step === 2) {
      // Save add-ons to context when continuing from step 2
      if (selectedAddonIds.length > 0) {
        setSelectedAddons(selectedAddonIds);
      }
      return !!booking.selectedServiceId;
    }
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
          addon_service_ids: selectedAddonIds.length > 0 ? selectedAddonIds : null,
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
        appointmentId: data.appointment_id,
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
    <motion.div 
      className="min-h-screen bg-background flex flex-col pt-20"
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <SeoHead pageSlug="book" />
      <Navigation />
      
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <div className="flex-shrink-0">
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
              selectedAddons={selectedAddons}
              onEditStep={handleEditStep}
              onContinue={() => {
                if (currentStep === 2 && canContinueStep(2)) setCurrentStep(3);
                if (currentStep === 3 && canContinueStep(3)) setCurrentStep(4);
                if (currentStep === 4) handleConfirmBooking();
              }}
              canContinue={canContinueStep(currentStep)}
              customerInfoFormId="customer-info-form"
              isVip={vipCodeValid}
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
                  {selectedAddons.length > 0 && ` • ${selectedAddons.map(a => a.name).join(', ')}`}
                  {booking.selectedBarberName && ` • ${booking.selectedBarberName}`}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {vipCodeValid && (
                  <span className="text-xs bg-[hsl(var(--accent))]/20 text-[hsl(var(--accent))] px-2 py-0.5 rounded-full font-semibold">
                    VIP ✨
                  </span>
                )}
                <span className="text-[hsl(var(--accent))] font-bold">
                  ${calculateBookingTotal(selectedService, selectedAddons, false).subtotal.toFixed(2)}
                </span>
              </div>
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
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
            <AnimatePresence mode="wait">
              {currentStep === 1 && !booking.isBlacklisted && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: isMobile ? 100 : 0 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isMobile ? -100 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Your Information</h2>
                    <p className="text-sm text-muted-foreground">Let's start with your contact details</p>
                  </div>
            <CustomerInfoForm 
              onSubmit={handleCustomerInfoSubmit}
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
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step 2: Select Service */}
            <AnimatePresence mode="wait">
              {currentStep === 2 && !booking.isBlacklisted && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: isMobile ? 100 : 0 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isMobile ? -100 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Select a Service</h2>
                    <p className="text-sm text-muted-foreground">Choose the service you'd like to book</p>
                  </div>
                {isLoadingServices ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <CompactServiceList
                    services={services.filter(s => s.category !== 'addon')}
                    addons={addonServices}
                    selectedServiceId={booking.selectedServiceId}
                    selectedAddonIds={selectedAddonIds}
                    onServiceSelect={handleServiceSelect}
                    onAddonToggle={handleAddonToggle}
                    serviceImages={serviceImages}
                    isVip={vipCodeValid}
                  />
                )}


                {isMobile && (
                  <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t z-40 shadow-lg">
                    <GoldButton
                      className="w-full min-h-[48px]"
                      onClick={() => {
                        if (!booking.selectedServiceId) return;
                        setSelectedAddons(selectedAddonIds);
                        setCurrentStep(3);
                      }}
                      disabled={!booking.selectedServiceId}
                    >
                      Continue to Barber Selection
                    </GoldButton>
                  </div>
                )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step 3: Select Barber + Date/Time */}
            {currentStep === 3 && !booking.isBlacklisted && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Choose Your Barber & Time</h2>
                  <p className="text-sm text-muted-foreground">Select a barber and pick your preferred date and time</p>
                </div>
                {isLoadingBarbers ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Barber Selection - Compact */}
                    <div>
                      <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Scissors className="h-4 w-4" />
                        Select Barber
                      </h3>
                      <div className="space-y-2">
                        {/* Any Available Option */}
                        <div 
                          className={cn(
                            "flex items-center gap-4 p-3 rounded-lg border-2 transition-all cursor-pointer",
                            booking.selectedBarberId === 'any'
                              ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent))]/5'
                              : 'border-border hover:bg-muted/50'
                          )}
                          onClick={() => handleBarberSelect('any', 'Any Available Barber')}
                        >
                          <div className="w-12 h-12 rounded-full bg-[hsl(var(--accent))]/20 flex items-center justify-center flex-shrink-0">
                            <Calendar className="h-6 w-6 text-[hsl(var(--accent))]" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-base">Any Available Barber</h4>
                            <p className="text-xs text-muted-foreground">First available time slot</p>
                          </div>
                          <GoldButton 
                            size="sm"
                            variant={booking.selectedBarberId === 'any' ? "default" : "outline"}
                            className="flex-shrink-0"
                          >
                            {booking.selectedBarberId === 'any' ? "Selected" : "Select"}
                          </GoldButton>
                        </div>

                        {/* Individual Barbers - Simplified Cards */}
                        {barbers.map((barber) => (
                          <SimplifiedBarberCard
                            key={barber.id}
                            barber={barber}
                            selectedServiceName={selectedService?.name || ""}
                            selectedServicePrice={selectedService?.regular_price || 0}
                            isSelected={booking.selectedBarberId === barber.id}
                            onSelect={() => handleBarberSelect(barber.id, barber.full_name)}
                            onVipCodeChange={(code) => setVipCodeFromForm(code)}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Date & Time Selection - Side by Side */}
                    {booking.selectedBarberId && selectedService && (
                      <div className="pt-4 border-t">
                        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4" />
                          Pick Your Date & Time
                        </h3>
                        <MonthlyCalendarPicker
                          barberId={booking.selectedBarberId}
                          serviceDuration={selectedService.duration_minutes}
                          selectedDate={booking.selectedDate}
                          selectedTime={booking.selectedTime}
                          onDateSelect={handleDateSelect}
                          onTimeSelect={handleTimeSelect}
                          availabilityData={barberAvailabilityData}
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
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Review Your Booking</h2>
                  <p className="text-sm text-muted-foreground">Confirm your details and complete booking</p>
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
                      {selectedAddons.length > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Add-ons:</span>
                          <div className="text-right">
                            {selectedAddons.map((addon) => (
                              <div key={addon.id} className="font-medium">• {addon.name}</div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Barber:</span>
                        <span className="font-semibold">{booking.selectedBarberName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date & Time:</span>
                        <span className="font-semibold">
                          {booking.selectedDate && booking.selectedTime 
                            ? `${format(booking.selectedDate, "MMM d, yyyy")} at ${formatTime12h(booking.selectedTime)}`
                            : ""
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="font-semibold">{selectedService.duration_minutes} minutes</span>
                      </div>
                      <Separator className="my-2" />
                      
                      {/* Price Breakdown */}
                      {(() => {
                        const pricing = calculateBookingTotal(selectedService, selectedAddons, vipCodeValid);
                        return (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{selectedService.name}</span>
                              <div className="flex items-center gap-2">
                                {vipCodeValid && pricing.baseRegularPrice !== pricing.basePrice && (
                                  <span className="line-through text-muted-foreground text-xs">
                                    ${pricing.baseRegularPrice.toFixed(2)}
                                  </span>
                                )}
                                <span className={vipCodeValid ? "text-[hsl(var(--accent))]" : ""}>
                                  ${pricing.basePrice.toFixed(2)}
                                </span>
                              </div>
                            </div>
                            
                            {selectedAddons.map((addon) => {
                              const addonPrice = vipCodeValid && addon.vip_price ? addon.vip_price : addon.regular_price;
                              const showStrikethrough = vipCodeValid && addon.vip_price && addon.vip_price !== addon.regular_price;
                              return (
                                <div key={addon.id} className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">{addon.name}</span>
                                  <div className="flex items-center gap-2">
                                    {showStrikethrough && (
                                      <span className="line-through text-muted-foreground text-xs">
                                        ${addon.regular_price.toFixed(2)}
                                      </span>
                                    )}
                                    <span className={vipCodeValid ? "text-[hsl(var(--accent))]" : ""}>
                                      ${addonPrice.toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                            
                            {vipCodeValid && pricing.vipSavings > 0 && (
                              <>
                                <Separator className="my-1" />
                                <div className="flex justify-between text-sm">
                                  <span className="flex items-center gap-1 text-[hsl(var(--accent))]">
                                    VIP Savings ✨
                                  </span>
                                  <span className="font-semibold text-green-600">
                                    -${pricing.vipSavings.toFixed(2)}
                                  </span>
                                </div>
                              </>
                            )}
                            
                            <Separator className="my-2" />
                            <div className="flex justify-between text-lg">
                              <span className="font-bold">Total:</span>
                              <span className="font-bold text-[hsl(var(--accent))]">
                                ${pricing.subtotal.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </CardContent>
                </Card>

                {/* Cancellation Policy */}
                <CancellationPolicy 
                  agreed={policyAgreed}
                  onAgreeChange={setPolicyAgreed}
                />

                {/* Payment Method Selection */}
                <Card>
                  <CardContent className="p-4">
                    <h3 className="text-base font-bold mb-2">Select Payment Method</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Choose how you'll send your payment. You'll need to complete payment after booking.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-2 mb-3">
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
                          After completing your booking, send ${calculateBookingTotal(selectedService, selectedAddons, vipCodeValid).subtotal.toFixed(2)} via {
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
                      disabled={!canContinueStep(4) || !policyAgreed || bookingMutation.isPending}
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
    </motion.div>
  );
};

export default Book;
