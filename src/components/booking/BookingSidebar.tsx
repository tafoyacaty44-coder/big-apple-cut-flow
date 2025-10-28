import { Check, Calendar, Scissors, User, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { GoldButton } from "@/components/ui/gold-button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface BookingSidebarProps {
  currentStep: number;
  selectedService?: { name: string; price: number; vip_price?: number } | null;
  selectedBarber?: { name: string } | null;
  selectedDate?: Date | null;
  selectedTime?: string | null;
  onEditStep: (step: number) => void;
  onContinue: () => void;
  canContinue: boolean;
  isVip?: boolean;
}

export const BookingSidebar = ({
  currentStep,
  selectedService,
  selectedBarber,
  selectedDate,
  selectedTime,
  onEditStep,
  onContinue,
  canContinue,
  isVip = false,
}: BookingSidebarProps) => {
  const steps = [
    {
      number: 1,
      label: "Service",
      icon: Scissors,
      completed: !!selectedService,
      content: selectedService
        ? `${selectedService.name} - $${isVip && selectedService.vip_price ? selectedService.vip_price : selectedService.price}`
        : "Select a service",
    },
    {
      number: 2,
      label: "Barber & Time",
      icon: User,
      completed: !!selectedBarber && !!selectedDate && !!selectedTime,
      content: selectedBarber && selectedDate && selectedTime
        ? `${selectedBarber.name} • ${new Date(selectedDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} • ${selectedTime}`
        : "Choose barber & schedule",
    },
    {
      number: 3,
      label: "Confirm & Pay",
      icon: Calendar,
      completed: false,
      content: "Review your booking",
    },
  ];

  const calculateTotal = () => {
    if (!selectedService) return 0;
    return isVip && selectedService.vip_price ? selectedService.vip_price : selectedService.price;
  };

  return (
    <Card className="h-full flex flex-col border-r rounded-none border-l-0 border-t-0 border-b-0 bg-muted/30">
      <div className="p-6 flex-1 overflow-y-auto">
        <h2 className="text-lg font-bold mb-6">Booking Summary</h2>

        <div className="space-y-4">
          {steps.map((step, index) => {
            const isActive = currentStep === step.number;
            const isClickable = step.completed && currentStep > step.number;

            return (
              <div key={step.number}>
                <button
                  onClick={() => isClickable && onEditStep(step.number)}
                  disabled={!isClickable}
                  className={cn(
                    "w-full text-left p-3 rounded-lg transition-all",
                    isActive && "bg-primary/10 border border-primary/20",
                    isClickable && "hover:bg-muted cursor-pointer",
                    !isClickable && !isActive && "opacity-60"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
                        step.completed
                          ? "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]"
                          : isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {step.completed ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <step.icon className="h-4 w-4" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold">{step.label}</span>
                        {isClickable && (
                          <span className="text-xs text-muted-foreground">(edit)</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {step.content}
                      </p>
                    </div>
                  </div>
                </button>
                {index < steps.length - 1 && (
                  <div className="ml-[1.125rem] my-2 h-6 w-0.5 bg-border" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-6 border-t bg-background">
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Subtotal</span>
            <span>${calculateTotal().toFixed(2)}</span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span className="text-[hsl(var(--accent))]">${calculateTotal().toFixed(2)}</span>
          </div>
        </div>

        <GoldButton
          onClick={onContinue}
          disabled={!canContinue}
          className="w-full"
          size="lg"
        >
          {currentStep === 3 ? "Complete Booking" : "Continue"}
        </GoldButton>
      </div>
    </Card>
  );
};
