import React, { createContext, useContext, useState, ReactNode } from 'react';

interface BookingState {
  selectedServiceId: string | null;
  selectedBarberId: string | null;
  selectedDate: Date | null;
  selectedTime: string | null;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  } | null;
}

interface BookingContextType {
  booking: BookingState;
  setSelectedService: (serviceId: string) => void;
  setSelectedBarber: (barberId: string | null) => void;
  setSelectedDate: (date: Date) => void;
  setSelectedTime: (time: string) => void;
  setCustomerInfo: (info: { name: string; email: string; phone: string }) => void;
  resetBooking: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider = ({ children }: { children: ReactNode }) => {
  const [booking, setBooking] = useState<BookingState>({
    selectedServiceId: null,
    selectedBarberId: null,
    selectedDate: null,
    selectedTime: null,
    customerInfo: null,
  });

  const setSelectedService = (serviceId: string) => {
    setBooking((prev) => ({ ...prev, selectedServiceId: serviceId }));
  };

  const setSelectedBarber = (barberId: string | null) => {
    setBooking((prev) => ({ ...prev, selectedBarberId: barberId }));
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

  const resetBooking = () => {
    setBooking({
      selectedServiceId: null,
      selectedBarberId: null,
      selectedDate: null,
      selectedTime: null,
      customerInfo: null,
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
