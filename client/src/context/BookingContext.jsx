import React, { createContext, useState, useEffect } from 'react';

export const BookingContext = createContext(null);

export const BookingProvider = ({ children }) => {
  const [bookingData, setBookingData] = useState(() => {
    const saved = localStorage.getItem('active_booking');
    return saved ? JSON.parse(saved) : { turf: null, selectedSlots: [], date: '' };
  });

  useEffect(() => {
    localStorage.setItem('active_booking', JSON.stringify(bookingData));
  }, [bookingData]);

  const configureBooking = (turf, slots, date) => {
    setBookingData({
      turf,
      selectedSlots: slots,
      date
    });
  };

  const clearBooking = () => {
    setBookingData({ turf: null, selectedSlots: [], date: '' });
    localStorage.removeItem('active_booking');
  };

  const value = {
    bookingData,
    configureBooking,
    clearBooking
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
};
