import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getBarbersWithRealAvailability } from "@/lib/api/barbers";
import { useBooking } from "@/contexts/BookingContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { formatTime12h } from "@/lib/utils";

interface SlotInfo {
  date: string;
  time: string;
}

interface GroupedSlots {
  morning: string[];
  afternoon: string[];
  evening: string[];
}

const groupSlotsByTimeOfDay = (slots: string[]): GroupedSlots => {
  return {
    morning: slots.filter((t) => {
      const hour = parseInt(t.split(":")[0]);
      return hour < 12;
    }),
    afternoon: slots.filter((t) => {
      const hour = parseInt(t.split(":")[0]);
      return hour >= 12 && hour < 17;
    }),
    evening: slots.filter((t) => {
      const hour = parseInt(t.split(":")[0]);
      return hour >= 17;
    }),
  };
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

export const LiveAvailabilityBanner = () => {
  const navigate = useNavigate();
  const { setPrefilled } = useBooking();
  const [expandedBarberId, setExpandedBarberId] = useState<string | null>(null);

  const { data: barbers, isLoading } = useQuery({
    queryKey: ["barbers-next-slot"],
    queryFn: () => getBarbersWithRealAvailability(30, 1),
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const handleSlotClick = (barberId: string, barberName: string, slot: SlotInfo) => {
    setPrefilled({
      barberId,
      barberName,
      date: slot.date,
      time: slot.time,
    });
    navigate("/book");
  };

  const toggleExpand = (barberId: string) => {
    setExpandedBarberId((prev) => (prev === barberId ? null : barberId));
  };

  if (isLoading) {
    return (
      <div className="w-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl py-4 px-4 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex flex-col items-center p-4">
              <div className="h-12 w-12 bg-white/10 rounded-full mb-2" />
              <div className="h-4 w-16 bg-white/10 rounded mb-1" />
              <div className="h-3 w-20 bg-white/10 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const barbersWithSlots = barbers?.filter((b) => b.nextAvailableSlot) || [];

  if (barbersWithSlots.length === 0) {
    return null;
  }

  const selectedBarber = expandedBarberId
    ? barbersWithSlots.find((b) => b.id === expandedBarberId)
    : null;

  return (
    <div className="w-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl py-4 px-4 shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[hsl(var(--accent))]/10 border border-[hsl(var(--accent))]/30">
          <Clock className="h-3.5 w-3.5 text-[hsl(var(--accent))]" />
        </div>
        <h3 className="text-xs font-cinzel tracking-[0.15em] text-[hsl(var(--accent))]">
          NEXT AVAILABLE
        </h3>
      </div>

      {/* Barber Columns */}
      <div className="grid grid-cols-3 gap-3">
        {barbersWithSlots.map((barber) => {
          const isExpanded = expandedBarberId === barber.id;
          const todaySlots = barber.realAvailability?.[0]?.time_slots || [];

          return (
            <button
              key={barber.id}
              onClick={() => toggleExpand(barber.id)}
              className={`flex flex-col items-center p-4 rounded-xl transition-all duration-200 ${
                isExpanded
                  ? "bg-white/15 ring-1 ring-[hsl(var(--accent))]/50"
                  : "bg-white/5 hover:bg-white/10"
              }`}
            >
              <Avatar className="h-12 w-12 mb-2 ring-2 ring-white/20">
                <AvatarImage
                  src={barber.profile_image_url || undefined}
                  alt={barber.full_name}
                />
                <AvatarFallback className="bg-[hsl(var(--accent))]/20 text-[hsl(var(--accent))]">
                  {getInitials(barber.full_name)}
                </AvatarFallback>
              </Avatar>

              <span className="text-sm font-semibold text-[hsl(var(--accent))] mb-1">
                {barber.full_name}
              </span>

              {barber.nextAvailableSlot && (
                <span className="text-xs text-white/70 mb-2">
                  Next: {formatTime12h(barber.nextAvailableSlot.time)}
                </span>
              )}

              <div className="flex items-center gap-1 text-white/50">
                <span className="text-xs">{todaySlots.length} slots</span>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Expanded Panel (Below Grid) */}
      <AnimatePresence>
        {selectedBarber && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium text-[hsl(var(--accent))]">
                  {selectedBarber.full_name}'s Availability
                </span>
              </div>

              {(() => {
                const todaySlots = selectedBarber.realAvailability?.[0]?.time_slots || [];
                const grouped = groupSlotsByTimeOfDay(todaySlots);
                const todayDate =
                  selectedBarber.realAvailability?.[0]?.date ||
                  new Date().toISOString().split("T")[0];

                return (
                  <div className="space-y-3">
                    <TimeSection
                      label="Morning"
                      slots={grouped.morning}
                      barber={selectedBarber}
                      date={todayDate}
                      onSlotClick={handleSlotClick}
                    />
                    <TimeSection
                      label="Afternoon"
                      slots={grouped.afternoon}
                      barber={selectedBarber}
                      date={todayDate}
                      onSlotClick={handleSlotClick}
                    />
                    <TimeSection
                      label="Evening"
                      slots={grouped.evening}
                      barber={selectedBarber}
                      date={todayDate}
                      onSlotClick={handleSlotClick}
                    />
                    {todaySlots.length === 0 && (
                      <p className="text-xs text-white/50 text-center py-2">
                        No slots available today
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface TimeSectionProps {
  label: string;
  slots: string[];
  barber: { id: string; full_name: string; nextAvailableSlot: SlotInfo | null };
  date: string;
  onSlotClick: (barberId: string, barberName: string, slot: SlotInfo) => void;
}

const TimeSection = ({ label, slots, barber, date, onSlotClick }: TimeSectionProps) => {
  if (slots.length === 0) return null;

  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-white/50 mb-1.5">
        {label}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {slots.map((time) => (
          <button
            key={time}
            onClick={(e) => {
              e.stopPropagation();
              onSlotClick(barber.id, barber.full_name, { date, time });
            }}
            className="px-2.5 py-1 text-xs rounded bg-white/10 text-white hover:bg-[hsl(var(--accent))]/20 hover:text-[hsl(var(--accent))] transition-colors"
          >
            {formatTime12h(time)}
          </button>
        ))}
      </div>
    </div>
  );
};
