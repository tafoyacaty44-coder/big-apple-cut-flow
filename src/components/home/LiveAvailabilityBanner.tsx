import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getBarbersWithRealAvailability } from "@/lib/api/barbers";
import { useBooking } from "@/contexts/BookingContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, ChevronDown, ChevronRight } from "lucide-react";
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
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg mb-2" />
        ))}
      </div>
    );
  }

  const barbersWithSlots = barbers?.filter((b) => b.nextAvailableSlot) || [];

  if (barbersWithSlots.length === 0) {
    return null;
  }

  // Find global earliest slot
  const globalEarliest = barbersWithSlots.reduce((earliest, barber) => {
    if (!earliest) return { barber, slot: barber.nextAvailableSlot! };
    const currentTime = barber.nextAvailableSlot!.time;
    const earliestTime = earliest.slot.time;
    if (currentTime < earliestTime) {
      return { barber, slot: barber.nextAvailableSlot! };
    }
    return earliest;
  }, null as { barber: (typeof barbersWithSlots)[0]; slot: SlotInfo } | null);

  return (
    <div className="w-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl py-4 px-4 shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[hsl(var(--accent))]/10 border border-[hsl(var(--accent))]/30">
          <Clock className="h-3.5 w-3.5 text-[hsl(var(--accent))]" />
        </div>
        <h3 className="text-xs font-cinzel tracking-[0.15em] text-[hsl(var(--accent))]">
          NEXT AVAILABLE
        </h3>
      </div>

      {/* Top Summary - Global Next Available */}
      {globalEarliest && (
        <button
          onClick={() =>
            handleSlotClick(
              globalEarliest.barber.id,
              globalEarliest.barber.full_name,
              globalEarliest.slot
            )
          }
          className="w-full mb-4 p-3 rounded-lg bg-[hsl(var(--accent))]/10 border border-[hsl(var(--accent))]/30 hover:bg-[hsl(var(--accent))]/20 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-foreground/70">Book now:</span>
              <span className="text-sm font-semibold text-[hsl(var(--accent))]">
                {globalEarliest.barber.full_name}
              </span>
              <span className="text-sm text-foreground/70">@</span>
              <span className="text-sm font-semibold text-[hsl(var(--accent))]">
                {formatTime12h(globalEarliest.slot.time)}
              </span>
            </div>
            <ChevronRight className="h-4 w-4 text-[hsl(var(--accent))] group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>
      )}

      {/* Barber Rows */}
      <div className="space-y-2">
        {barbersWithSlots.map((barber) => {
          const todaySlots =
            barber.realAvailability?.[0]?.time_slots || [];
          const groupedSlots = groupSlotsByTimeOfDay(todaySlots);
          const previewSlots = todaySlots.slice(0, 3);
          const isExpanded = expandedBarberId === barber.id;

          return (
            <div key={barber.id} className="rounded-lg overflow-hidden">
              {/* Collapsed Row */}
              <button
                onClick={() => toggleExpand(barber.id)}
                className={`w-full p-3 flex items-center gap-3 bg-white/5 border transition-colors ${
                  isExpanded
                    ? "border-[hsl(var(--accent))]/40 rounded-t-lg border-b-0"
                    : "border-white/10 rounded-lg hover:border-white/20"
                }`}
              >
                <Avatar className="h-9 w-9 ring-2 ring-[hsl(var(--accent))]/20 flex-shrink-0">
                  <AvatarImage
                    src={barber.profile_image_url || undefined}
                    alt={barber.full_name}
                  />
                  <AvatarFallback className="bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))] font-semibold text-xs">
                    {getInitials(barber.full_name)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0 text-left">
                  <div className="text-sm font-medium text-foreground truncate">
                    {barber.full_name}
                  </div>
                  <div className="text-xs text-[hsl(var(--accent))]">
                    Next: {formatTime12h(barber.nextAvailableSlot!.time)}
                  </div>
                </div>

                {/* Preview Chips */}
                <div className="hidden sm:flex items-center gap-1.5">
                  {previewSlots.slice(1, 4).map((time) => (
                    <span
                      key={time}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSlotClick(barber.id, barber.full_name, {
                          date: barber.nextAvailableSlot!.date,
                          time,
                        });
                      }}
                      className="px-2 py-0.5 text-[10px] rounded bg-white/10 text-foreground/70 hover:bg-[hsl(var(--accent))]/20 hover:text-[hsl(var(--accent))] cursor-pointer transition-colors"
                    >
                      {formatTime12h(time)}
                    </span>
                  ))}
                </div>

                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="h-4 w-4 text-foreground/50" />
                </motion.div>
              </button>

              {/* Expanded Panel */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3 bg-white/5 border border-[hsl(var(--accent))]/40 border-t-0 rounded-b-lg space-y-3">
                      {/* Morning */}
                      {groupedSlots.morning.length > 0 && (
                        <TimeSection
                          label="Morning"
                          slots={groupedSlots.morning}
                          barber={barber}
                          onSlotClick={handleSlotClick}
                        />
                      )}

                      {/* Afternoon */}
                      {groupedSlots.afternoon.length > 0 && (
                        <TimeSection
                          label="Afternoon"
                          slots={groupedSlots.afternoon}
                          barber={barber}
                          onSlotClick={handleSlotClick}
                        />
                      )}

                      {/* Evening */}
                      {groupedSlots.evening.length > 0 && (
                        <TimeSection
                          label="Evening"
                          slots={groupedSlots.evening}
                          barber={barber}
                          onSlotClick={handleSlotClick}
                        />
                      )}

                      {todaySlots.length === 0 && (
                        <p className="text-xs text-foreground/50 text-center py-2">
                          No slots available today
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface TimeSectionProps {
  label: string;
  slots: string[];
  barber: { id: string; full_name: string; nextAvailableSlot: SlotInfo | null };
  onSlotClick: (barberId: string, barberName: string, slot: SlotInfo) => void;
}

const TimeSection = ({ label, slots, barber, onSlotClick }: TimeSectionProps) => {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-foreground/40 mb-1.5">
        {label}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {slots.map((time) => (
          <button
            key={time}
            onClick={() =>
              onSlotClick(barber.id, barber.full_name, {
                date: barber.nextAvailableSlot!.date,
                time,
              })
            }
            className="px-2.5 py-1 text-xs rounded bg-white/10 text-foreground/80 hover:bg-[hsl(var(--accent))]/20 hover:text-[hsl(var(--accent))] transition-colors"
          >
            {formatTime12h(time)}
          </button>
        ))}
      </div>
    </div>
  );
};
