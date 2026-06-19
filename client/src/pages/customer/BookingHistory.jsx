import React, { useState, useEffect } from 'react';
import bookingService from '../../services/bookingService';
import paymentService from '../../services/paymentService';
import BookingCard from '../../components/BookingCard';
import Spinner from '../../components/Spinner';
import Modal from '../../components/Modal';
import { formatCurrency } from '../../utils/formatCurrency';

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [mockOrderDetails, setMockOrderDetails] = useState(null);
  const [showMockModal, setShowMockModal] = useState(false);

  // Cancel modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await bookingService.getBookings();
      setBookings(data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to retrieve booking logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleOpenCancelModal = (bookingId) => {
    setBookingToCancel(bookingId);
    setCancelReason('');
    setShowCancelModal(true);
  };

  const handleCloseCancelModal = () => {
    setShowCancelModal(false);
    setBookingToCancel(null);
    setCancelReason('');
  };

  const handleConfirmCancel = async () => {
    if (!bookingToCancel) return;
    setCancelling(true);
    setError('');
    try {
      await bookingService.cancelBooking(bookingToCancel, cancelReason);
      alert('Booking cancelled successfully. Slots have been released.');
      handleCloseCancelModal();
      fetchBookings();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to cancel booking.');
      handleCloseCancelModal();
    } finally {
      setCancelling(false);
    }
  };

  const handlePayBalance = async (bookingId) => {
    setError('');
    setLoading(true);
    try {
      const data = await paymentService.createBalanceOrder(bookingId);
      const { razorpayOrder, keyId } = data;

      if (razorpayOrder.id.startsWith('order_mock_')) {
        setMockOrderDetails({
          orderId: razorpayOrder.id,
          bookingId,
          amount: razorpayOrder.amount / 100
        });
        setShowMockModal(true);
      } else {
        const options = {
          key: keyId,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: 'TurfBook TN',
          description: 'Pay Remaining Balance',
          order_id: razorpayOrder.id,
          handler: async function (response) {
            setLoading(true);
            try {
              await paymentService.verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              });
              fetchBookings();
            } catch (err) {
              console.error(err);
              setError('Payment verification failed.');
            } finally {
              setLoading(false);
            }
          },
          theme: {
            color: '#059669'
          }
        };

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
      setError(err.response?.data?.message || 'Failed to initialize balance payment.');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatePaymentSuccess = async () => {
    setShowMockModal(false);
    setLoading(true);
    try {
      await paymentService.verifyPayment({
        razorpay_order_id: mockOrderDetails.orderId,
        razorpay_payment_id: `pay_mock_${Math.random().toString(36).substring(2, 12)}`,
        razorpay_signature: `sig_mock_${Math.random().toString(36).substring(2, 12)}`
      });
      fetchBookings();
    } catch (err) {
      console.error(err);
      setError('Verification of simulated payment failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slatebg-dark font-sans text-white pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-extrabold font-sans mb-8">Booking Records</h1>

      {error && (
        <div className="mb-6 p-4 bg-accent-coral/10 border border-accent-coral/20 text-accent-coral text-xs rounded-xl font-medium">
          {error}
        </div>
      )}

      {loading && bookings.length === 0 ? (
        <div className="py-24">
          <Spinner size="lg" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-2xl p-8 max-w-sm mx-auto">
          <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h4 className="text-lg font-bold text-white mb-2">No Bookings Found</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            You haven't booked any playgrounds yet. Start browsing slots to lock in your next game!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <BookingCard
              key={booking._id}
              booking={booking}
              onCancel={handleOpenCancelModal}
              onPayBalance={handlePayBalance}
            />
          ))}
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {showCancelModal && (
        <Modal
          isOpen={showCancelModal}
          onClose={handleCloseCancelModal}
          title="Cancel Booking"
        >
          <div className="space-y-5">
            <div className="flex items-start gap-3 p-4 bg-accent-coral/5 border border-accent-coral/20 rounded-xl">
              <div className="w-8 h-8 bg-accent-coral/10 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-accent-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="text-xs text-slate-300 leading-relaxed">
                <p className="font-semibold text-accent-coral mb-1">Cancellation Policy</p>
                <p>Cancelling at least <strong>4 hours before</strong> the scheduled slot time: <strong className="text-turf-light">Full refund</strong> of your advance payment.</p>
                <p className="mt-1">Cancelling within <strong>4 hours</strong> of the slot time: <strong className="text-accent-coral">No refund</strong>.</p>
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 font-semibold mb-1.5">
                Reason for cancellation <span className="text-slate-500">(optional)</span>
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Tell us why you're cancelling..."
                className="w-full bg-slate-900 border border-slate-700/40 rounded-xl p-3 text-xs text-white placeholder-slate-500 resize-none focus:outline-none focus:border-accent-coral/40"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleCloseCancelModal}
                disabled={cancelling}
                className="w-full py-2.5 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700/40 hover:bg-slate-700 transition"
              >
                Go Back
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={cancelling}
                className="w-full py-2.5 bg-accent-coral hover:bg-accent-coral/80 text-white text-xs font-semibold rounded-xl transition disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </Modal>
      )}

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
                You are paying the balance in <strong>Mock Mode</strong>.
              </p>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-left max-w-sm mx-auto text-xs space-y-1.5 font-mono">
                <p>Order ID: {mockOrderDetails?.orderId}</p>
                <p>Booking ID: {mockOrderDetails?.bookingId}</p>
                <p>Balance Amount: {formatCurrency(mockOrderDetails?.amount)}</p>
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

export default BookingHistory;
