import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Card, CardContent } from '@/components/ui/card';
import { GoldButton } from '@/components/ui/gold-button';
import { Calendar, AlertCircle, CheckCircle, User as UserIcon, Scissors, Calendar as CalendarIcon, Clock, ChevronLeft, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimations } from '@/hooks/useAnimations';
import { AnimatedCard } from '@/components/ui/animated-card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Progress } from '@/components/ui/progress';
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
  const { booking, setSelectedService, setSelectedBarber, setSelectedDate, setSelectedTime, setCustomerInfo, setBlacklisted, setSelectedAddons, resetBooking } = useBooking();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const TOTAL_STEPS = 5;

  // Reset booking context when component mounts (fresh start)
  useEffect(() => {
    // Only reset if we're on step 1 and there's no service selected
    // This allows returning to booking page to continue, but fresh starts are clean
    if (currentStep === 1 && !booking.selectedServiceId) {
      resetBooking();
      setSelectedAddonIds([]);
      setPolicyAgreed(false);
      setSelectedPaymentMethod(null);
      setVipCodeFromForm('');
      setVipCodeValid(false);
      setPromoCode('');
      setPromoDiscount(0);
    }
  }, []); // Only run on mount

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
    enabled: currentStep === 2 && !!selectedService,
  });

  // Fetch barber availability when barber and service are selected
  const { data: barberAvailabilityData = [] } = useQuery({
    queryKey: ['barber-availability', booking.selectedBarberId, selectedService?.duration_minutes],
    queryFn: () => {
      if (!booking.selectedBarberId || !selectedService?.duration_minutes) return [];
      return getBarberAvailability(
        booking.selectedBarberId,
        format(new Date(), 'yyyy-MM-dd'),
        format(addDays(new Date(), 30), 'yyyy-MM-dd'),
        selectedService.duration_minutes
      );
    },
    enabled: currentStep === 3 && !!booking.selectedBarberId && !!selectedService?.duration_minutes,
  });

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
    setSelectedAddonIds([]); // Reset add-ons when service changes
  };

  const handleAddonToggle = (addonIds: string[]) => {
    setSelectedAddonIds(addonIds);
  };

  const handleBarberSelect = (barberId: string, barberName: string) => {
    setSelectedBarber(barberId, barberName, []);
    // Clear date/time selections when changing barbers
    setSelectedDate(null);
    setSelectedTime(null);
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
      
      // If on step 4 (customer info), move to step 5 (confirmation)
      if (currentStep === 4) {
        setCurrentStep(5);
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
    if (step === 3) return !!booking.selectedBarberId;
    if (step === 4) return !!(booking.selectedDate && booking.selectedTime);
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

  const handleConfirmBooking = () => {
    bookingMutation.mutate(vipCodeValid ? vipCodeFromForm : undefined);
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
                regular_price: selectedService.regular_price,
                vip_price: selectedService.vip_price
              } : null}
              selectedBarber={booking.selectedBarberName ? { name: booking.selectedBarberName } : null}
              selectedDate={booking.selectedDate}
              selectedTime={booking.selectedTime}
              customerInfo={booking.customerInfo}
              selectedAddons={selectedAddons}
              onEditStep={handleEditStep}
              onContinue={() => {
                if (currentStep === 1 && canContinueStep(1)) setCurrentStep(2);
                if (currentStep === 2 && canContinueStep(2)) setCurrentStep(3);
                if (currentStep === 3 && canContinueStep(3)) setCurrentStep(4);
                if (currentStep === 5) handleConfirmBooking();
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
              <div className="text-left flex-1">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">Step {currentStep} of {TOTAL_STEPS}</span>
                    <span>{Math.round((currentStep / TOTAL_STEPS) * 100)}%</span>
                  </div>
                  <Progress value={(currentStep / TOTAL_STEPS) * 100} className="h-1.5" />
                </div>
                <div className="text-sm text-muted-foreground truncate mt-1">
                  {booking.customerInfo?.name}
                  {selectedService && ` • ${selectedService.name}`}
                  {selectedAddons.length > 0 && ` • ${selectedAddons.map(a => a.name).join(', ')}`}
                  {booking.selectedBarberName && ` • ${booking.selectedBarberName}`}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {currentStep > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Start over? This will clear all your booking information.')) {
                        resetBooking();
                        setCurrentStep(1);
                        setSelectedAddonIds([]);
                        setPolicyAgreed(false);
                        setSelectedPaymentMethod(null);
                      }
                    }}
                    className="text-xs text-destructive hover:underline mr-2"
                  >
                    Reset
                  </button>
                )}
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
            {/* Back Button for steps 2+ */}
            {currentStep > 1 && !booking.isBlacklisted && (
              <div className="mb-3 flex items-center justify-between">
                <button
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  className="flex items-center gap-1 text-sm font-medium hover:text-[hsl(var(--accent))] transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
                <span className="text-xs text-muted-foreground font-medium">
                  Step {currentStep} of {TOTAL_STEPS}
                </span>
              </div>
            )}
            {/* Blacklist Warning */}
            {booking.isBlacklisted && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Unfortunately, we don't have any available appointments at this time. Please check back later.
                </AlertDescription>
              </Alert>
            )}

            {/* Step 1: Select Service */}
            <AnimatePresence mode="wait">
              {currentStep === 1 && !booking.isBlacklisted && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: isMobile ? 100 : 0 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isMobile ? -100 : 0 }}
                  transition={{ duration: 0.3 }}
                  className={cn("space-y-4", isMobile && "pb-20")}
                >
                  <div>
                    <h2 className="text-xl font-bold mb-1">Select a Service</h2>
                    <p className="text-sm text-muted-foreground">Choose the service you'd like</p>
                  </div>
                  <CompactServiceList
                    services={services}
                    addons={addonServices}
                    selectedServiceId={booking.selectedServiceId}
                    selectedAddonIds={selectedAddonIds}
                    onServiceSelect={handleServiceSelect}
                    onAddonToggle={handleAddonToggle}
                    isVip={vipCodeValid}
                  />
                  {isMobile && (
                    <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t z-40 shadow-lg">
                      <GoldButton
                        className="w-full min-h-[48px]"
                        onClick={() => {
                          if (!booking.selectedServiceId) return;
                          setSelectedAddons(selectedAddonIds);
                          setCurrentStep(2);
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

            {/* Step 2: Select Barber */}
            <AnimatePresence mode="wait">
              {currentStep === 2 && !booking.isBlacklisted && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: isMobile ? 100 : 0 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isMobile ? -100 : 0 }}
                  transition={{ duration: 0.3 }}
                  className={cn("space-y-4", isMobile && "pb-20")}
                >
                  <div>
                    <h2 className="text-xl font-bold mb-1">Select a Service</h2>
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
                        setCurrentStep(2);
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

            {/* Step 2: Select Barber ONLY */}
            <AnimatePresence mode="wait">
              {currentStep === 2 && !booking.isBlacklisted && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: isMobile ? 100 : 0 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isMobile ? -100 : 0 }}
                  transition={{ duration: 0.3 }}
                  className={cn("space-y-3", isMobile && "pb-20")}
                >
                  <div>
                    <h2 className="text-xl font-bold mb-1">Select Your Barber</h2>
                    <p className="text-sm text-muted-foreground">Choose your preferred barber</p>
                  </div>
                  {isLoadingBarbers ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{/* Removed "Any Available Barber" option */}

                      {barbers.map((barber) => (
                        <SimplifiedBarberCard
                          key={barber.id}
                          barber={barber}
                          selectedServiceName={selectedService?.name || ""}
                          selectedServicePrice={selectedService?.regular_price || 0}
                          isSelected={booking.selectedBarberId === barber.id}
                          onSelect={() => handleBarberSelect(barber.id, barber.full_name)}
                        />
                      ))}
                    </div>
                  )}

                  {isMobile && (
                    <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t z-40 shadow-lg">
                      <GoldButton
                        className="w-full min-h-[48px]"
                        onClick={() => canContinueStep(2) && setCurrentStep(3)}
                        disabled={!canContinueStep(2)}
                      >
                        Continue to Date & Time
                      </GoldButton>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step 3: Select Date & Time ONLY */}
            <AnimatePresence mode="wait">
              {currentStep === 3 && !booking.isBlacklisted && selectedService && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: isMobile ? 100 : 0 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isMobile ? -100 : 0 }}
                  transition={{ duration: 0.3 }}
                  className={cn("space-y-3", isMobile && "pb-20")}
                >
                  <div>
                    <h2 className="text-xl font-bold mb-1">Choose Date & Time</h2>
                    <p className="text-sm text-muted-foreground">Select your preferred appointment slot</p>
                  </div>

                  {booking.selectedBarberName && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-[hsl(var(--accent))]/10 border border-[hsl(var(--accent))]/30 rounded-lg text-sm">
                      <Scissors className="h-4 w-4 text-[hsl(var(--accent))]" />
                      <span className="text-muted-foreground">Barber:</span>
                      <span className="font-semibold">{booking.selectedBarberName}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="font-semibold">{selectedService.name}</span>
                    </div>
                  )}

                  <MonthlyCalendarPicker
                    barberId={booking.selectedBarberId}
                    serviceDuration={selectedService.duration_minutes}
                    selectedDate={booking.selectedDate}
                    selectedTime={booking.selectedTime}
                    onDateSelect={handleDateSelect}
                    onTimeSelect={handleTimeSelect}
                    availabilityData={barberAvailabilityData}
                  />

                  {isMobile && (
                    <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t z-40 shadow-lg">
                      <GoldButton
                        className="w-full min-h-[48px]"
                        onClick={() => canContinueStep(3) && setCurrentStep(4)}
                        disabled={!canContinueStep(3)}
                      >
                        Continue to Your Info
                      </GoldButton>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step 4: Customer Information */}
            <AnimatePresence mode="wait">
              {currentStep === 4 && !booking.isBlacklisted && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: isMobile ? 100 : 0 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isMobile ? -100 : 0 }}
                  transition={{ duration: 0.3 }}
                  className={cn("space-y-4", isMobile && "pb-20")}
                >
                  <div>
                    <h2 className="text-xl font-bold mb-1">Your Information</h2>
                    <p className="text-sm text-muted-foreground">We need your contact information</p>
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
                        Continue to Review
                      </GoldButton>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step 5: Review & Confirm - ULTRA COMPACT */}
            <AnimatePresence mode="wait">
              {currentStep === 5 && selectedService && !booking.isBlacklisted && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, x: isMobile ? 100 : 0 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isMobile ? -100 : 0 }}
                  transition={{ duration: 0.3 }}
                  className={cn("space-y-3", isMobile && "pb-20")}
                >
                  <div>
                    <h2 className="text-lg font-bold mb-1">Review Your Booking</h2>
                    <p className="text-xs text-muted-foreground">Confirm details and complete booking</p>
                  </div>

                  {/* Compact Summary - No Card */}
                  <div className="border rounded-lg p-3 space-y-2 text-sm bg-muted/30">
                    <h3 className="font-bold text-base mb-2">Appointment Summary</h3>
                    <div className="text-xs space-y-1">
                      <div><span className="text-muted-foreground">Customer:</span> <span className="font-semibold">{booking.customerInfo?.name}</span></div>
                      <div><span className="text-muted-foreground">Service:</span> <span className="font-semibold">{selectedService.name}</span>{selectedAddons.length > 0 && ` • ${selectedAddons.map(a => a.name).join(', ')}`}</div>
                      <div><span className="text-muted-foreground">Barber:</span> <span className="font-semibold">{booking.selectedBarberName}</span></div>
                      <div><span className="text-muted-foreground">Date & Time:</span> <span className="font-semibold">{booking.selectedDate && booking.selectedTime ? `${format(booking.selectedDate, "EEE, MMM d")} • ${formatTime12h(booking.selectedTime)}` : ""}</span></div>
                      <div><span className="text-muted-foreground">Duration:</span> <span className="font-semibold">{selectedService.duration_minutes + selectedAddons.reduce((sum, a) => sum + a.duration_minutes, 0)} min</span> • <span className="font-bold text-[hsl(var(--accent))]">Total: ${calculateBookingTotal(selectedService, selectedAddons, vipCodeValid).subtotal.toFixed(2)}</span></div>
                    </div>
                  </div>
                  {/* Cancellation Policy - Compact */}
                  <CancellationPolicy 
                    agreed={policyAgreed}
                    onAgreeChange={setPolicyAgreed}
                  />

                  {/* Payment Method - Compact */}
                  <div className="border rounded-lg p-3">
                    <h3 className="text-sm font-bold mb-2">Payment Method</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'zelle' as const, name: 'Zelle', info: '(555) 123-4567' },
                        { id: 'apple_pay' as const, name: 'Apple Pay', info: '(555) 123-4567' },
                        { id: 'venmo' as const, name: 'Venmo', info: '@BigAppleBarberShop' },
                        { id: 'cash_app' as const, name: 'Cash App', info: '$BigAppleBarbers' },
                      ].map((method) => (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setSelectedPaymentMethod(method.id)}
                          className={`p-2 sm:p-4 border-2 rounded-lg text-left transition-all ${
                            selectedPaymentMethod === method.id
                              ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent))]/10'
                              : 'border-border hover:border-[hsl(var(--accent))]/50'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-xs sm:text-sm font-semibold mb-0.5 leading-tight">{method.name}</p>
                              <p className="text-[10px] sm:text-xs text-muted-foreground break-words leading-tight">{method.info}</p>
                            </div>
                            {selectedPaymentMethod === method.id && (
                              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-[hsl(var(--accent))] flex-shrink-0" />
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
                  </div>

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
                        onClick={handleConfirmBooking}
                        disabled={!policyAgreed || !selectedPaymentMethod || bookingMutation.isPending}
                        className="w-full min-h-[48px]"
                      >
                        {bookingMutation.isPending ? "Booking..." : "Complete Booking"}
                      </GoldButton>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

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
