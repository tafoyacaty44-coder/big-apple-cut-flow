import React, { createContext, useContext, useState, ReactNode } from 'react';

interface BarberAvailability {
  id: string;
  barber_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
  status_message: string | null;
}

interface BookingState {
  selectedServiceId: string | null;
  selectedBarberId: string | undefined;
  selectedBarberName: string | null;
  barberAvailability: BarberAvailability[] | null;
  selectedDate: Date | null;
  selectedTime: string | null;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  } | null;
  isBlacklisted: boolean;
}

interface PrefilledData {
  serviceId?: string;
  barberId?: string;
  barberName?: string;
  date?: string;
  time?: string;
}

interface BookingContextType {
  booking: BookingState;
  setSelectedService: (serviceId: string) => void;
  setSelectedBarber: (barberId: string, barberName: string, availability: BarberAvailability[]) => void;
  setSelectedDate: (date: Date) => void;
  setSelectedTime: (time: string) => void;
  setCustomerInfo: (info: { name: string; email: string; phone: string }) => void;
  setBlacklisted: (status: boolean) => void;
  setPrefilled: (data: PrefilledData) => void;
  resetBooking: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider = ({ children }: { children: ReactNode }) => {
  const [booking, setBooking] = useState<BookingState>({
    selectedServiceId: null,
    selectedBarberId: undefined,
    selectedBarberName: null,
    barberAvailability: null,
    selectedDate: null,
    selectedTime: null,
    customerInfo: null,
    isBlacklisted: false,
  });

  const setSelectedService = (serviceId: string) => {
    setBooking((prev) => ({ ...prev, selectedServiceId: serviceId }));
  };

  const setSelectedBarber = (barberId: string, barberName: string, availability: BarberAvailability[]) => {
    setBooking((prev) => ({ 
      ...prev, 
      selectedBarberId: barberId,
      selectedBarberName: barberName,
      barberAvailability: availability
    }));
  };

  const setSelectedDate = (date: Date) => {
    setBooking((prev) => ({ ...prev, selectedDate: date }));
  };

  const setSelectedTime = (time: string) => {
    setBooking((prev) => ({ ...prev, selectedTime: time }));
  };

  const setCustomerInfo = (info: { name: string; email: string; phone: string }) => {
    setBooking((prev) => ({ ...prev, customerInfo: info }));
  };

  const setBlacklisted = (status: boolean) => {
    setBooking((prev) => ({ ...prev, isBlacklisted: status }));
  };

  const setPrefilled = (data: PrefilledData) => {
    const updates: Partial<BookingState> = {};
    
    if (data.serviceId) updates.selectedServiceId = data.serviceId;
    if (data.barberId) {
      updates.selectedBarberId = data.barberId;
      updates.selectedBarberName = data.barberName || null;
    }
    if (data.date) updates.selectedDate = new Date(data.date);
    if (data.time) updates.selectedTime = data.time;
    
    setBooking((prev) => ({ ...prev, ...updates }));
  };

  const resetBooking = () => {
    setBooking({
      selectedServiceId: null,
      selectedBarberId: undefined,
      selectedBarberName: null,
      barberAvailability: null,
      selectedDate: null,
      selectedTime: null,
      customerInfo: null,
      isBlacklisted: false,
    });
  };

  return (
    <BookingContext.Provider
      value={{
        booking,
        setSelectedService,
        setSelectedBarber,
        setSelectedDate,
        setSelectedTime,
        setCustomerInfo,
        setBlacklisted,
        setPrefilled,
        resetBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
