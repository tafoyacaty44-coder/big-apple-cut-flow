import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getBarbersWithRealAvailability } from "@/lib/api/barbers";
import { useBooking } from "@/contexts/BookingContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Calendar } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

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
      <div className="w-full bg-black/40 backdrop-blur-xl border-y border-white/10 py-5 shadow-[0_0_30px_rgba(245,193,66,0.05)]">
        <div className="container mx-auto px-4">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="min-w-[220px] h-24 rounded-xl bg-white/5 border border-white/10 animate-pulse"
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
      className="w-full bg-black/40 backdrop-blur-xl border-y border-white/10 py-5 shadow-[0_0_30px_rgba(245,193,66,0.05)] relative"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20 pointer-events-none" />
      <div className="container mx-auto px-4 relative">
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
            <BarberCard
              key={barber.id}
              barber={barber}
              index={index}
              onSlotClick={handleSlotClick}
              navigate={navigate}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

interface BarberCardProps {
  barber: any;
  index: number;
  onSlotClick: (barber: any, slot: { date: string; time: string }) => void;
  navigate: (path: string) => void;
}

const BarberCard = ({ barber, index, onSlotClick, navigate }: BarberCardProps) => {
  const prefersReducedMotion = useReducedMotion();

  const handleViewSchedule = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/barbers/${barber.id}`);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      transition={{
        delay: index * 0.1,
        duration: 0.4,
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSlotClick(barber, barber.nextAvailableSlot!)}
      className="min-w-[220px] flex flex-col gap-2 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-[hsl(var(--accent))]/40 transition-all duration-300 snap-start cursor-pointer shadow-[0_0_12px_rgba(245,193,66,0.35)]"
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10 ring-2 ring-[hsl(var(--accent))]/20">
          <AvatarImage src={barber.profile_image_url || undefined} alt={barber.full_name} />
          <AvatarFallback className="bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))] font-semibold">
            {getInitials(barber.full_name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-[hsl(var(--accent))]">{barber.full_name}</div>
          <div className="text-xs text-[hsl(var(--accent))] font-medium mt-0.5">
            {barber.nextAvailableSlot?.time}
          </div>
          <div className="flex items-center gap-1 mt-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400" />
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
              Available
            </span>
          </div>
        </div>
        <button
          onClick={handleViewSchedule}
          className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
          aria-label="View full schedule"
        >
          <Calendar className="h-4 w-4 text-[hsl(var(--accent))]/70 hover:text-[hsl(var(--accent))]" />
        </button>
      </div>
    </motion.div>
  );
};
