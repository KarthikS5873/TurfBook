import React, { useState, useEffect } from 'react';
import bookingService from '../../services/bookingService';
import Spinner from '../../components/Spinner';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatTime } from '../../utils/slotHelpers';
import { formatDate } from '../../utils/formatDate';

/**
 * Owner Booking Requests filtering page
 */
const BookingRequests = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await bookingService.getBookings();
      setBookings(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    if (!window.confirm(`Are you sure you want to mark this booking as ${status}?`)) return;
    try {
      await bookingService.updateStatus(id, status);
      alert(`Booking ${status} successfully!`);
      loadRequests();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (statusFilter === 'all') return true;
    return b.bookingStatus === statusFilter;
  });

  return (
    <div className="min-h-screen bg-slatebg-dark font-sans text-white pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-slate-800/80 pb-4">
        <h1 className="text-3xl font-extrabold font-sans">Booking Requests</h1>
        
        {/* Status filtering */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs font-semibold text-slate-300 transition cursor-pointer focus:outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="py-24">
          <Spinner size="lg" />
        </div>
      ) : filteredBookings.length === 0 ? (
        <p className="text-xs text-slate-500 py-20 text-center glass-panel rounded-2xl">
          No bookings match this filter parameter.
        </p>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => (
            <div key={b._id} className="glass-panel p-6 rounded-2xl border-slate-700/40 hover:border-slate-600/50 transition">
              <div className="flex flex-col sm:flex-row justify-between gap-4 items-start border-b border-slate-850 pb-4 mb-4">
                <div>
                  <h4 className="text-base font-bold text-white">{b.turf?.name}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Customer: <span className="font-semibold text-slate-300">{b.customer?.name}</span> | Phone: {b.customer?.phone || 'No phone'}
                  </p>
                </div>
                <span className={`px-2.5 py-0.5 border text-[10px] font-bold rounded-full ${
                  b.bookingStatus === 'confirmed' 
                    ? 'bg-turf/15 border-turf/30 text-turf-light'
                    : b.bookingStatus === 'pending'
                      ? 'bg-accent-gold/15 border-accent-gold/30 text-accent-gold'
                      : 'bg-accent-coral/15 border-accent-coral/30 text-accent-coral'
                }`}>
                  {b.bookingStatus.toUpperCase()}
                </span>
              </div>

              <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-slate-300">Date: {formatDate(b.date)}</p>
                  <p className="text-xs text-slate-400">
                    Slots:{' '}
                    {b.slots?.map((s, idx) => (
                      <span key={idx} className="bg-slate-950 px-2 py-0.5 rounded text-[10px] font-mono mr-1">
                        {formatTime(s.startTime)} - {formatTime(s.endTime)}
                      </span>
                    ))}
                  </p>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-xs text-slate-400">Revenue stats</p>
                  <p className="text-sm font-bold text-turf-light">
                    Paid: {formatCurrency(b.advancePaid)} / Total: {formatCurrency(b.totalPrice)}
                  </p>
                </div>
              </div>

              {b.bookingStatus === 'pending' && (
                <div className="flex justify-end gap-2.5 pt-4 mt-4 border-t border-slate-850">
                  <button
                    onClick={() => handleUpdateStatus(b._id, 'cancelled')}
                    className="px-3.5 py-1.5 border border-slate-800 hover:bg-accent-coral/10 hover:text-accent-coral rounded-lg text-xs font-semibold transition"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(b._id, 'confirmed')}
                    className="px-4 py-1.5 bg-turf hover:bg-turf-dark text-white rounded-lg text-xs font-semibold transition"
                  >
                    Approve
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingRequests;
