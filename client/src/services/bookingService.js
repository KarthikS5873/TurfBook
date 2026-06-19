import api from './api';

const bookingService = {
  createBooking: async (bookingData) => {
    // bookingData: { turfId, slotIds, date }
    const response = await api.post('/bookings', bookingData);
    return response.data.data;
  },

  getBookings: async () => {
    const response = await api.get('/bookings');
    return response.data.data;
  },

  updateStatus: async (bookingId, status) => {
    const response = await api.put(`/bookings/${bookingId}/status`, { status });
    return response.data.data;
  },

  cancelBooking: async (bookingId, reason = '') => {
    const response = await api.post(`/bookings/${bookingId}/cancel`, { reason });
    return response.data.data;
  }
};

export default bookingService;
