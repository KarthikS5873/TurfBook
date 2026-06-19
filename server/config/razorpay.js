const Razorpay = require('razorpay');

const isRazorpayConfigured = 
  process.env.RAZORPAY_KEY_ID && 
  process.env.RAZORPAY_KEY_ID !== 'rzp_test_placeholder_id' &&
  process.env.RAZORPAY_KEY_SECRET && 
  process.env.RAZORPAY_KEY_SECRET !== 'placeholder_secret_key';

let razorpayInstance;

if (isRazorpayConfigured) {
  try {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    console.log('Razorpay integration loaded successfully.');
  } catch (error) {
    console.error('Failed to initialize Razorpay SDK. Using Mock fallback.', error.message);
  }
}

if (!razorpayInstance) {
  console.log('Razorpay credentials missing or placeholders. Using mock payment workflow.');
  razorpayInstance = {
    orders: {
      create: async (options) => {
        return {
          id: 'order_mock_' + Math.random().toString(36).substring(2, 15),
          entity: 'order',
          amount: options.amount,
          amount_paid: 0,
          amount_due: options.amount,
          currency: options.currency || 'INR',
          receipt: options.receipt,
          status: 'created',
          attempts: 0,
          notes: options.notes,
          created_at: Math.floor(Date.now() / 1000)
        };
      }
    },
    payments: {
      refund: async (paymentId, options) => {
        return {
          id: 'refund_mock_' + Math.random().toString(36).substring(2, 15),
          payment_id: paymentId,
          amount: options.amount || 0,
          currency: 'INR',
          status: 'processed',
          created_at: Math.floor(Date.now() / 1000)
        };
      }
    }
  };
}

module.exports = {
  razorpayInstance,
  isMock: !isRazorpayConfigured
};
