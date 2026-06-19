import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useBooking from '../../hooks/useBooking';
import bookingService from '../../services/bookingService';
import paymentService from '../../services/paymentService';
import Spinner from '../../components/Spinner';
import Modal from '../../components/Modal';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { formatTime } from '../../utils/slotHelpers';

/**
 * Confirm Booking & Razorpay Payment Checkout page
 */
const BookingPage = () => {
  const navigate = useNavigate();
  const { bookingData, clearBooking } = useBooking();
  const { turf, selectedSlots, date } = bookingData;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Mock Payment Modal simulator state
  const [mockOrderDetails, setMockOrderDetails] = useState(null);
  const [showMockModal, setShowMockModal] = useState(false);

  // Return to details if no active booking config is found
  if (!turf || selectedSlots.length === 0 || !date) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slatebg-dark text-center">
        <div className="glass-panel p-8 max-w-sm rounded-2xl">
          <p className="text-sm text-slate-400 mb-5">No active bookings configured.</p>
          <button 
            onClick={() => navigate('/turfs')}
            className="w-full py-2.5 bg-turf hover:bg-turf-dark text-white rounded-xl text-xs font-semibold"
          >
            Browse Playgrounds
          </button>
        </div>
      </div>
    );
  }

  const totalPrice = selectedSlots.reduce((sum, s) => sum + s.price, 0);
  const advanceAmount = Math.round(totalPrice * 0.20);
  const balanceAmount = totalPrice - advanceAmount;

  // Initialize booking flow
  const handleCheckout = async () => {
    setError('');
    setLoading(true);
    try {
      const slotIds = selectedSlots.map(s => s._id);
      
      // 1. Initialize pending booking order
      const data = await bookingService.createBooking({
        turfId: turf._id,
        slotIds,
        date
      });

      const { booking, razorpayOrder, keyId } = data;

      // 2. Determine checkout mode (Real Razorpay vs Mockup Simulator)
      if (razorpayOrder.id.startsWith('order_mock_')) {
        // Trigger mock simulator popup
        setMockOrderDetails({
          orderId: razorpayOrder.id,
          bookingId: booking._id,
          amount: advanceAmount
        });
        setShowMockModal(true);
      } else {
        // Trigger standard Razorpay SDK modal integration
        const options = {
          key: keyId,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: 'TurfBook TN',
          description: `Advance for ${turf.name}`,
          order_id: razorpayOrder.id,
          handler: async function (response) {
            setLoading(true);
            try {
              // Submit verification signatures back to backend
              await paymentService.verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              });
              clearBooking();
              navigate('/bookings'); // Redirect to history on success
            } catch (err) {
              console.error(err);
              setError('Payment verification failed.');
            } finally {
              setLoading(false);
            }
          },
          prefill: {
            name: JSON.parse(localStorage.getItem('user'))?.name || '',
            email: JSON.parse(localStorage.getItem('user'))?.email || ''
          },
          theme: {
            color: '#059669' // Emerald Green theme
          }
        };

        // Load and launch Razorpay Checkout SDK
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => {
          const rzp = new window.Razorpay(options);
          rzp.open();
        };
        document.body.appendChild(script);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to place booking order.');
    } finally {
      setLoading(false);
    }
  };

  // Mock signature confirmation simulator action
  const handleSimulatePaymentSuccess = async () => {
    setShowMockModal(false);
    setLoading(true);
    try {
      await paymentService.verifyPayment({
        razorpay_order_id: mockOrderDetails.orderId,
        razorpay_payment_id: `pay_mock_${Math.random().toString(36).substring(2, 12)}`,
        razorpay_signature: `sig_mock_${Math.random().toString(36).substring(2, 12)}`
      });
      clearBooking();
      navigate('/bookings');
    } catch (err) {
      console.error(err);
      setError('Mock payment validation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slatebg-dark font-sans text-white pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="flex items-center space-x-2 text-sm text-slate-400 mb-6">
        <button onClick={() => navigate(-1)} className="hover:text-white transition">Details</button>
        <span>/</span>
        <span className="text-white">Checkout</span>
      </div>

      <h1 className="text-3xl font-extrabold font-sans text-white mb-8">Confirm Booking</h1>

      {error && (
        <div className="mb-6 p-4 bg-accent-coral/10 border border-accent-coral/20 text-accent-coral text-xs rounded-xl font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left column: Summary breakdown */}
        <div className="md:col-span-7 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border-slate-700/40">
            <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
              Playground Details
            </h4>
            <h3 className="text-lg font-bold text-white">{turf.name}</h3>
            <p className="text-xs text-slate-400 mt-1 leading-normal">
              {turf.address}, {turf.city}, {turf.district}
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border-slate-700/40">
            <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
              Selected Timings
            </h4>
            <p className="text-sm font-bold text-white mb-4">{formatDate(date)}</p>
            
            <div className="space-y-2.5">
              {selectedSlots.map((slot, idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-900/40 border border-slate-800/80 px-4 py-3 rounded-xl">
                  <span className="text-xs font-mono text-slate-300">
                    {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                  </span>
                  <span className="text-xs font-bold text-turf-light">{formatCurrency(slot.price)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: Billing and pay trigger */}
        <div className="md:col-span-5">
          <div className="glass-panel p-6 rounded-2xl border-slate-700/40 sticky top-24 space-y-6">
            <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2">
              Billing Breakdown
            </h4>

            <div className="space-y-3.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Total Amount</span>
                <span className="font-semibold text-white">{formatCurrency(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-turf-light font-medium">
                <span>Advance Required (20%)</span>
                <span>{formatCurrency(advanceAmount)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-800/80 pt-3.5 text-slate-400">
                <span>Balance at Turf check-in</span>
                <span className="font-semibold text-white">{formatCurrency(balanceAmount)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full py-3.5 bg-turf hover:bg-turf-dark disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-turf/20 hover:shadow-none transition duration-200 flex items-center justify-center mt-6"
            >
              {loading ? <Spinner size="sm" /> : `Pay Advance: ${formatCurrency(advanceAmount)}`}
            </button>
          </div>
        </div>
      </div>

      {/* Mock Payment Simulation Modal */}
      {showMockModal && (
        <Modal 
          isOpen={showMockModal} 
          onClose={() => setShowMockModal(false)} 
          title="Razorpay Payment Simulator"
        >
          <div className="space-y-6 text-center">
            <div className="w-12 h-12 bg-turf/10 text-turf rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-slate-300">
                You are checking out in <strong>Mock Mode</strong> because real keys are not set.
              </p>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-left max-w-sm mx-auto text-xs space-y-1.5 font-mono">
                <p>Order ID: {mockOrderDetails?.orderId}</p>
                <p>Booking ID: {mockOrderDetails?.bookingId}</p>
                <p>Amount: {formatCurrency(mockOrderDetails?.amount)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowMockModal(false)}
                className="w-full py-2.5 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700/40"
              >
                Simulate Fail
              </button>
              <button
                onClick={handleSimulatePaymentSuccess}
                className="w-full py-2.5 bg-turf hover:bg-turf-dark text-white text-xs font-semibold rounded-xl"
              >
                Simulate Success
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default BookingPage;
