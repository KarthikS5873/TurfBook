import React from 'react';
import { formatTime } from '../utils/slotHelpers';
import { formatDate } from '../utils/formatDate';
import { formatCurrency } from '../utils/formatCurrency';

/**
 * Booking card component showing details, statuses, and action binds
 * @param {Object} booking - Booking fields
 * @param {Function} [onCancel] - Cancel callback
 * @param {Function} [onPayBalance] - Pay balance order callback
 * @param {Boolean} [isOwnerView=false] - View scope flag
 */
const BookingCard = ({ booking, onCancel, onPayBalance, isOwnerView = false }) => {
  const {
    _id,
    turf,
    customer,
    slots,
    date,
    totalPrice,
    advancePaid,
    balanceAmount,
    bookingStatus,
    paymentStatus,
    cancellationReason,
    cancelledAt,
    refundedAmount
  } = booking;

  // Compile booking status classes
  const bookingStatusColors = {
    pending: 'bg-accent-gold/10 text-accent-gold border-accent-gold/30',
    confirmed: 'bg-turf/10 text-turf border-turf/30',
    cancelled: 'bg-accent-coral/10 text-accent-coral border-accent-coral/30'
  };

  // Compile payment status classes
  const paymentStatusColors = {
    pending: 'bg-accent-coral/10 text-accent-coral border-accent-coral/30',
    partially_paid: 'bg-accent-gold/10 text-accent-gold border-accent-gold/30',
    paid: 'bg-turf/10 text-turf border-turf/30'
  };

  // Determine if booking is cancelable (> 4 hours in future)
  const isCancelable = () => {
    if (bookingStatus === 'cancelled') return false;
    if (slots && slots.length > 0) {
      const firstSlot = slots[0];
      const slotDateTimeStr = `${date}T${firstSlot.startTime}:00`;
      const slotTime = new Date(slotDateTimeStr);
      const currentTime = new Date();
      const diffHrs = (slotTime - currentTime) / (1000 * 60 * 60);
      return diffHrs >= 4;
    }
    return false;
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border-slate-700/40 hover:border-slate-600/50 transition duration-200">
      {/* Top section: Title and Statuses */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-5 border-b border-slate-700/40 pb-4">
        <div>
          <h4 className="text-lg font-bold font-sans text-white">
            {turf ? turf.name : 'Unknown Turf'}
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Booking ID: <span className="font-mono text-[11px]">{_id}</span>
          </p>
          {isOwnerView && customer && (
            <p className="text-xs text-slate-300 mt-2 font-medium">
              Customer: {customer.name} ({customer.phone || 'No Phone'})
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={`border px-3 py-1 rounded-full text-xs font-semibold ${bookingStatusColors[bookingStatus] || 'bg-slate-800 border-slate-700 text-slate-400'}`}>
            Booking: {bookingStatus.toUpperCase()}
          </span>
          <span className={`border px-3 py-1 rounded-full text-xs font-semibold ${paymentStatusColors[paymentStatus] || 'bg-slate-800 border-slate-700 text-slate-400'}`}>
            Payment: {paymentStatus.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      </div>

      {/* Date & Slots Timing info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Date & Timing</p>
          <p className="text-sm font-bold text-white mt-1.5">{formatDate(date)}</p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {slots && slots.map((slot, idx) => (
              <span key={idx} className="bg-slate-900/50 text-slate-300 border border-slate-700/40 px-2 py-0.5 rounded text-[11px] font-mono">
                {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
              </span>
            ))}
          </div>
        </div>

        {/* Pricing & Balances */}
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Billing Breakdown</p>
          <div className="grid grid-cols-3 gap-2 mt-2 bg-slate-900/40 border border-slate-700/40 p-3 rounded-xl text-center">
            <div>
              <p className="text-[10px] text-slate-400">Total Price</p>
              <p className="text-xs font-bold text-white mt-0.5">{formatCurrency(totalPrice)}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400">Advance Paid</p>
              <p className="text-xs font-bold text-turf-light mt-0.5">{formatCurrency(advancePaid)}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400">Balance Due</p>
              <p className={`text-xs font-bold mt-0.5 ${balanceAmount > 0 ? 'text-accent-coral' : 'text-slate-400'}`}>
                {formatCurrency(balanceAmount)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cancellation info */}
      {bookingStatus === 'cancelled' && (
        <div className="mb-5 p-4 bg-accent-coral/5 border border-accent-coral/20 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 bg-accent-coral/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-3.5 h-3.5 text-accent-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="text-xs text-slate-300 space-y-1">
              <p className="font-semibold text-accent-coral">Booking Cancelled</p>
              {cancelledAt && (
                <p>Cancelled on: {new Date(cancelledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              )}
              {cancellationReason && (
                <p>Reason: {cancellationReason}</p>
              )}
              {refundedAmount > 0 && (
                <p className="text-turf-light font-semibold">Refunded: {formatCurrency(refundedAmount)}</p>
              )}
              {refundedAmount === 0 && advancePaid > 0 && (
                <p className="text-accent-coral">No refund issued (cancelled within 4 hours of slot time)</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Actions footer */}
      {!isOwnerView && (bookingStatus !== 'cancelled') && (
        <div className="flex justify-end gap-3 pt-2 border-t border-slate-700/40">
          {/* Cancel trigger */}
          {isCancelable() && onCancel && (
            <button
              onClick={() => onCancel(_id)}
              className="px-4 py-2 border border-slate-700/50 hover:bg-accent-coral/10 hover:border-accent-coral/30 text-slate-300 hover:text-accent-coral text-xs font-semibold rounded-xl transition duration-150"
            >
              Cancel Booking
            </button>
          )}

          {/* Pay balance trigger */}
          {balanceAmount > 0 && onPayBalance && (
            <button
              onClick={() => onPayBalance(_id)}
              className="px-5 py-2.5 bg-turf hover:bg-turf-dark text-white text-xs font-semibold rounded-xl shadow-lg shadow-turf/20 hover:shadow-none transition duration-150"
            >
              Pay Balance ({formatCurrency(balanceAmount)})
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default BookingCard;
