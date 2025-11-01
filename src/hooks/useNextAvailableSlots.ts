import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, addMinutes, startOfHour, isAfter, isBefore } from "date-fns";

export function useNextAvailableSlots(count = 3) {
  return useQuery({
    queryKey: ["next-available-slots"],
    queryFn: async () => {
      const now = new Date();
      const today = format(now, "yyyy-MM-dd");
      const currentDay = now.getDay();
      const currentTime = format(now, "HH:mm:ss");

      // Get active barbers with availability today
      const { data: availability } = await supabase
        .from("barber_availability")
        .select(`
          barber_id,
          start_time,
          end_time,
          barbers!inner(is_active)
        `)
        .eq("day_of_week", currentDay)
        .eq("is_available", true)
        .eq("barbers.is_active", true);

      if (!availability || availability.length === 0) {
        return [];
      }

      // Get today's appointments
      const { data: appointments } = await supabase
        .from("appointments")
        .select("appointment_time, service_id, services(duration_minutes)")
        .eq("appointment_date", today)
        .in("status", ["confirmed", "pending"]);

      // Find next available slots
      const slots: string[] = [];
      const maxHoursAhead = 4;
      let checkTime = addMinutes(startOfHour(now), Math.ceil(now.getMinutes() / 15) * 15);

      while (slots.length < count && isBefore(checkTime, addMinutes(now, maxHoursAhead * 60))) {
        const checkTimeStr = format(checkTime, "HH:mm:ss");
        
        // Check if any barber is available at this time
        const isAvailable = availability.some((avail) => {
          const start = avail.start_time;
          const end = avail.end_time;
          return checkTimeStr >= start && checkTimeStr < end;
        });

        // Check if slot conflicts with existing appointments
        const hasConflict = appointments?.some((apt) => {
          const aptTime = apt.appointment_time;
          const duration = (apt.services as any)?.duration_minutes || 30;
          const aptEnd = format(
            addMinutes(new Date(`2000-01-01 ${aptTime}`), duration),
            "HH:mm:ss"
          );
          return checkTimeStr >= aptTime && checkTimeStr < aptEnd;
        });

        if (isAvailable && !hasConflict) {
          slots.push(format(checkTime, "h:mm a"));
        }

        checkTime = addMinutes(checkTime, 15);
      }

      return slots;
    },
    staleTime: 60 * 1000, // Refresh every minute
    refetchInterval: 60 * 1000,
  });
}
