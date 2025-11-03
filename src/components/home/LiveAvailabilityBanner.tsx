import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getBarbersWithRealAvailability } from "@/lib/api/barbers";
import { useBooking } from "@/contexts/BookingContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock } from "lucide-react";
import { motion } from "framer-motion";

export const LiveAvailabilityBanner = () => {
  const navigate = useNavigate();
  const { setPrefilled } = useBooking();

  const { data: barbers, isLoading } = useQuery({
    queryKey: ["barbers-next-slot"],
    queryFn: () => getBarbersWithRealAvailability(30, 1),
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  const handleSlotClick = (barber: any, slot: { date: string; time: string }) => {
    setPrefilled({
      barberId: barber.id,
      barberName: barber.full_name,
      date: slot.date,
      time: slot.time,
    });
    navigate("/book");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="w-full bg-background/50 backdrop-blur-sm border-y border-border/50 py-4">
        <div className="container mx-auto px-4">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="min-w-[200px] h-16 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const barbersWithSlots = barbers?.filter(b => b.nextAvailableSlot) || [];

  if (barbersWithSlots.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-background/50 backdrop-blur-sm border-y border-border/50 py-4"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Next Available</span>
        </div>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          {barbersWithSlots.map((barber) => (
            <motion.button
              key={barber.id}
              onClick={() => handleSlotClick(barber, barber.nextAvailableSlot!)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="min-w-[200px] flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:border-primary/50 transition-all"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={barber.profile_image_url || undefined} alt={barber.full_name} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getInitials(barber.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <div className="font-medium text-sm text-foreground">{barber.full_name}</div>
                <div className="text-xs text-muted-foreground">
                  {barber.nextAvailableSlot?.time}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
