import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { GoldButton } from '@/components/ui/gold-button';
import { CheckCircle2, Calendar, Clock, User, Mail, Phone } from 'lucide-react';
import { format } from 'date-fns';

const BookingSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const confirmationNumber = searchParams.get('confirmation');
  const serviceName = searchParams.get('service');
  const barberName = searchParams.get('barber');
  const date = searchParams.get('date');
  const time = searchParams.get('time');
  const customerName = searchParams.get('name');
  const customerEmail = searchParams.get('email');
  const customerPhone = searchParams.get('phone');
  const vipApplied = searchParams.get('vip') === 'true';

  useEffect(() => {
    if (!confirmationNumber) {
      navigate('/book');
    }
  }, [confirmationNumber, navigate]);

  if (!confirmationNumber) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <section className="flex-1 py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Success Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[hsl(var(--accent))]/20 mb-4">
                <CheckCircle2 className="h-10 w-10 text-[hsl(var(--accent))]" />
              </div>
              <h1 className="text-4xl font-bold mb-2">Booking Confirmed!</h1>
              <p className="text-muted-foreground text-lg">
                Your appointment has been successfully scheduled
              </p>
            </div>

            {/* Confirmation Number */}
            <Card className="p-6 mb-6 bg-[hsl(var(--accent))]/10 border-[hsl(var(--accent))]">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Confirmation Number</p>
                <p className="text-3xl font-bold tracking-wider text-[hsl(var(--accent))]">
                  {confirmationNumber}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Please save this number for your records
                </p>
              </div>
            </Card>

            {/* Appointment Details */}
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Appointment Details</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-[hsl(var(--accent))] mt-0.5" />
                  <div>
                    <p className="font-semibold">Date & Time</p>
                    <p className="text-muted-foreground">
                      {date && format(new Date(date), 'EEEE, MMMM d, yyyy')} at {time}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-[hsl(var(--accent))] mt-0.5" />
                  <div>
                    <p className="font-semibold">Service</p>
                    <p className="text-muted-foreground">{serviceName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-[hsl(var(--accent))] mt-0.5" />
                  <div>
                    <p className="font-semibold">Barber</p>
                    <p className="text-muted-foreground">{barberName}</p>
                  </div>
                </div>
              </div>

              {vipApplied && (
                <div className="mt-4 p-3 bg-[hsl(var(--accent))]/10 border border-[hsl(var(--accent))]/30 rounded">
                  <p className="text-sm font-semibold text-[hsl(var(--accent))]">
                    ✓ VIP Pricing Applied
                  </p>
                </div>
              )}
            </Card>

            {/* Customer Information */}
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Your Information</h2>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-[hsl(var(--accent))]" />
                  <p>{customerName}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-[hsl(var(--accent))]" />
                  <p>{customerEmail}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-[hsl(var(--accent))]" />
                  <p>{customerPhone}</p>
                </div>
              </div>
            </Card>

            {/* Payment Instructions - IMPORTANT */}
            <Card className="p-6 mb-6 border-[hsl(var(--accent))] bg-[hsl(var(--accent))]/10">
              <h2 className="text-xl font-bold mb-3 text-[hsl(var(--accent))]">💳 Payment Required</h2>
              <div className="space-y-3">
                <p className="font-semibold">To confirm your appointment, please send payment via:</p>
                <div className="bg-background p-4 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Zelle:</span>
                    <span className="font-mono">info@bigapplebarbershop.com</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Apple Pay:</span>
                    <span className="font-mono">(555) 123-4567</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Venmo:</span>
                    <span className="font-mono">@BigAppleBarberShop</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  ⚠️ Your appointment will be confirmed once payment is received. 
                  Please include your confirmation number <strong>{confirmationNumber}</strong> in the payment note.
                </p>
              </div>
            </Card>

            {/* What's Next */}
            <Card className="p-6 mb-6 bg-muted/50">
              <h2 className="text-xl font-bold mb-3">What's Next?</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-[hsl(var(--accent))]">•</span>
                  <span>A confirmation email has been sent to {customerEmail}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[hsl(var(--accent))]">•</span>
                  <span>You'll receive a reminder 24 hours before your appointment</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[hsl(var(--accent))]">•</span>
                  <span>Please arrive 5 minutes early for your appointment</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[hsl(var(--accent))]">•</span>
                  <span>Need to reschedule? Contact us at least 24 hours in advance</span>
                </li>
              </ul>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <GoldButton
                variant="outline"
                onClick={() => navigate('/')}
              >
                Back to Home
              </GoldButton>
              <GoldButton
                onClick={() => navigate('/book')}
              >
                Book Another Appointment
              </GoldButton>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BookingSuccess;
