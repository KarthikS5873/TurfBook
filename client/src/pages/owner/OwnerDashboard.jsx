import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import bookingService from '../../services/bookingService';
import Spinner from '../../components/Spinner';
import { formatCurrency } from '../../utils/formatCurrency';

/**
 * Turf Owner Dashboard Hub
 */
const OwnerDashboard = () => {
  const [metrics, setMetrics] = useState({ bookingsCount: 0, revenue: 0, turfsCount: 0 });
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch bookings
      const bookingsList = await bookingService.getBookings();
      setBookings(bookingsList || []);

      // 2. Fetch owner's turfs to count
      const response = await api.get('/turfs/my');
      const turfsList = response.data.data || [];

      // Calculate stats based on bookings
      const confirmedBookings = bookingsList.filter(b => b.bookingStatus === 'confirmed');
      const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.advancePaid || 0), 0);

      setMetrics({
        bookingsCount: bookingsList.length,
        revenue: totalRevenue,
        turfsCount: turfsList.length
      });
    } catch (err) {
      console.error(err);
      setError('Failed to load dashboard parameters.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleUpdateBookingStatus = async (bookingId, status) => {
    if (!window.confirm(`Are you sure you want to mark this booking as ${status}?`)) return;
    try {
      await bookingService.updateStatus(bookingId, status);
      alert(`Booking ${status} successfully!`);
      loadDashboardData();
    } catch (err) {
      console.error(err);
      alert('Failed to update booking status.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slatebg-dark">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slatebg-dark font-sans text-white pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border-slate-700/40">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Accumulated Revenue (Advance)</p>
          <h2 className="text-3xl font-black text-turf-light mt-2">{formatCurrency(metrics.revenue)}</h2>
        </div>
        <div className="glass-panel p-6 rounded-2xl border-slate-700/40">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Booking Slots</p>
          <h2 className="text-3xl font-black text-white mt-2">{metrics.bookingsCount}</h2>
        </div>
        <div className="glass-panel p-6 rounded-2xl border-slate-700/40">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">My Registered Turfs</p>
          <h2 className="text-3xl font-black text-white mt-2">{metrics.turfsCount}</h2>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Booking Requests lists */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-baseline border-b border-slate-800 pb-3">
            <h3 className="text-xl font-bold font-sans">Recent Booking Requests</h3>
            <Link to="/owner/requests" className="text-xs text-turf-light hover:underline font-semibold">View All</Link>
          </div>

          {bookings.length === 0 ? (
            <p className="text-xs text-slate-400 py-12 text-center glass-panel rounded-2xl">
              No recent booking requests found.
            </p>
          ) : (
            <div className="space-y-4">
              {bookings.slice(0, 5).map((b) => (
                <div key={b._id} className="glass-panel p-5 rounded-xl border-slate-700/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-white">{b.turf?.name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Customer: {b.customer?.name} | Date: {b.date}
                    </p>
                    <p className="text-[11px] text-turf-light font-bold mt-1">
                      Total bill: {formatCurrency(b.totalPrice)} (Paid: {formatCurrency(b.advancePaid)})
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {b.bookingStatus === 'pending' && (
                      <>
                        <button
                          onClick={() => handleUpdateBookingStatus(b._id, 'cancelled')}
                          className="px-3 py-1.5 border border-slate-800 hover:bg-accent-coral/10 hover:text-accent-coral rounded-lg text-xs font-semibold transition"
                        >
                          Deny
                        </button>
                        <button
                          onClick={() => handleUpdateBookingStatus(b._id, 'confirmed')}
                          className="px-3.5 py-1.5 bg-turf hover:bg-turf-dark text-white rounded-lg text-xs font-semibold transition"
                        >
                          Confirm
                        </button>
                      </>
                    )}
                    {b.bookingStatus !== 'pending' && (
                      <span className={`px-3 py-1 border rounded-lg text-[10px] font-bold ${
                        b.bookingStatus === 'confirmed' 
                          ? 'bg-turf/15 border-turf/30 text-turf-light'
                          : 'bg-accent-coral/15 border-accent-coral/30 text-accent-coral'
                      }`}>
                        {b.bookingStatus.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions panel */}
        <div className="glass-panel p-6 rounded-2xl border-slate-700/40 h-fit space-y-6">
          <h3 className="text-lg font-bold font-sans border-b border-slate-800 pb-3">Quick Actions</h3>
          <div className="flex flex-col gap-3">
            <Link 
              to="/owner/turf"
              className="w-full py-3 bg-slate-800 hover:bg-slate-700/80 border border-slate-700/40 text-center text-sm font-semibold rounded-xl transition duration-150"
            >
              Add/Edit Turf Details
            </Link>
            <Link 
              to="/owner/slots"
              className="w-full py-3 bg-turf hover:bg-turf-dark text-center text-sm font-semibold rounded-xl shadow-lg shadow-turf/15 transition duration-150"
            >
              Setup / Generate Slots
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OwnerDashboard;
