import api from './api';

const paymentService = {
  createBalanceOrder: async (bookingId) => {
    const response = await api.post('/payments/balance', { bookingId });
    return response.data.data;
  },

  verifyPayment: async (paymentPayload) => {
    // paymentPayload: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
    const response = await api.post('/payments/verify', paymentPayload);
    return response.data.data;
  }
};

export default paymentService;
