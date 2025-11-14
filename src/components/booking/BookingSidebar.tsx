import { Check, Calendar, Scissors, User, Clock } from "lucide-react";
import { cn, formatTime12h, calculateBookingTotal } from "@/lib/utils";
import { GoldButton } from "@/components/ui/gold-button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface BookingSidebarProps {
  currentStep: number;
  selectedService?: { name: string; regular_price: number; vip_price?: number | null } | null;
  selectedBarber?: { name: string } | null;
  selectedDate?: Date | null;
  selectedTime?: string | null;
  customerInfo?: { name: string; email: string; phone: string } | null;
  selectedAddons?: Array<{ name: string; regular_price: number; vip_price?: number }>;
  onEditStep: (step: number) => void;
  onContinue: () => void;
  canContinue: boolean;
  isVip?: boolean;
  customerInfoFormId?: string;
}

export const BookingSidebar = ({
  currentStep,
  selectedService,
  selectedBarber,
  selectedDate,
  selectedTime,
  customerInfo,
  selectedAddons = [],
  onEditStep,
  onContinue,
  canContinue,
  isVip = false,
  customerInfoFormId,
}: BookingSidebarProps) => {
  const steps = [
    {
      number: 1,
      label: "Service",
      icon: Scissors,
      completed: !!selectedService,
      content: selectedService
        ? `${selectedService.name}${selectedAddons.length > 0 ? ` • ${selectedAddons.map(a => a.name).join(', ')}` : ''}`
        : "Select a service",
    },
    {
      number: 2,
      label: "Barber",
      icon: User,
      completed: !!selectedBarber,
      content: selectedBarber
        ? selectedBarber.name
        : "Choose your barber",
    },
    {
      number: 3,
      label: "Date & Time",
      icon: Clock,
      completed: !!selectedDate && !!selectedTime,
      content: selectedDate && selectedTime
        ? `${new Date(selectedDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} • ${formatTime12h(selectedTime)}`
        : "Pick date & time",
    },
    {
      number: 4,
      label: "Your Info",
      icon: User,
      completed: !!customerInfo,
      content: customerInfo
        ? `${customerInfo.name}`
        : "Enter your details",
    },
    {
      number: 5,
      label: "Confirm",
      icon: Calendar,
      completed: false,
      content: "Review booking",
    },
  ];

  const priceCalc = calculateBookingTotal(selectedService, selectedAddons, isVip);

  return (
    <Card className="h-full flex flex-col border-r rounded-none border-l-0 border-t-0 border-b-0 bg-muted/30 overflow-hidden w-64">
      <div className="p-3 flex-1 overflow-y-auto min-h-0">
        <h2 className="text-sm font-bold mb-3 uppercase">Booking Summary</h2>

        <div className="space-y-2.5">
          {steps.map((step, index) => {
            const isActive = currentStep === step.number;
            const isClickable = step.completed && currentStep > step.number;

            return (
              <div key={step.number}>
                <button
                  onClick={() => isClickable && onEditStep(step.number)}
                  disabled={!isClickable}
                  className={cn(
                    "w-full text-left p-2 rounded-lg transition-all",
                    isActive && "bg-primary/10 border border-primary/20",
                    isClickable && "hover:bg-muted cursor-pointer",
                    !isClickable && !isActive && "opacity-60"
                  )}
                >
                  <div className="flex items-start gap-2">
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors text-xs font-bold",
                        step.completed
                          ? "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]"
                          : isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {step.completed ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <step.icon className="h-3 w-3" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-xs font-semibold">{step.label}</span>
                        {isClickable && (
                          <span className="text-[10px] text-muted-foreground">(edit)</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate leading-tight">
                        {step.content}
                      </p>
                    </div>
                  </div>
                </button>
                {index < steps.length - 1 && (
                  <div className="ml-[0.875rem] my-1.5 h-4 w-0.5 bg-border" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-4 border-t bg-background flex-shrink-0">
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="transition-all duration-300 ease-in-out">
              ${priceCalc.subtotal.toFixed(2)}
            </span>
          </div>
          {isVip && priceCalc.vipSavings > 0 && (
            <div className="flex justify-between text-xs mb-1.5 text-green-600 animate-in slide-in-from-top-2 duration-300">
              <span>VIP Savings</span>
              <span className="font-semibold transition-all duration-300 ease-in-out">
                -${priceCalc.vipSavings.toFixed(2)}
              </span>
            </div>
          )}
          <Separator className="my-1.5" />
          <div className="flex justify-between font-bold text-sm">
            <span>Total</span>
            <span className={cn(
              "text-[hsl(var(--accent))] transition-all duration-300 ease-in-out",
              isVip && "animate-pulse-subtle"
            )}>
              ${priceCalc.subtotal.toFixed(2)}
            </span>
          </div>
        </div>

        <GoldButton
          {...(currentStep === 4 && customerInfoFormId
            ? { type: "submit", form: customerInfoFormId }
            : { onClick: onContinue }
          )}
          disabled={!canContinue}
          className="w-full"
          size="default"
        >
          {currentStep === 5 ? "Complete Booking" : "Continue"}
        </GoldButton>
      </div>
    </Card>
  );
};
