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
      <div className="w-full bg-background/80 backdrop-blur-md border-y border-[hsl(var(--accent))]/20 py-5">
        <div className="container mx-auto px-4">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide">
            {[1, 2, 3].map((i) => (
              <Skeleton 
                key={i} 
                className="min-w-[200px] h-16 rounded-lg gold-shine" 
              />
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
      transition={{ duration: 0.5 }}
      className="w-full bg-background/80 backdrop-blur-md border-y border-[hsl(var(--accent))]/20 py-5"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[hsl(var(--accent))]/10 border border-[hsl(var(--accent))]/30">
            <Clock className="h-4 w-4 text-[hsl(var(--accent))]" />
          </div>
          <h3 className="text-xs font-cinzel tracking-[0.2em] text-[hsl(var(--accent))]">
            NEXT AVAILABLE
          </h3>
        </div>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory">
          {barbersWithSlots.map((barber, index) => (
            <motion.button
              key={barber.id}
              onClick={() => handleSlotClick(barber, barber.nextAvailableSlot!)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="min-w-[200px] flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-[hsl(var(--accent))]/30 hover:border-[hsl(var(--accent))] hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all duration-300 snap-start"
            >
              <Avatar className="h-10 w-10 ring-2 ring-[hsl(var(--accent))]/20">
                <AvatarImage src={barber.profile_image_url || undefined} alt={barber.full_name} />
                <AvatarFallback className="bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))] font-semibold">
                  {getInitials(barber.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <div className="font-semibold text-sm text-foreground">{barber.full_name}</div>
                <div className="text-xs text-[hsl(var(--accent))] font-medium">
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
