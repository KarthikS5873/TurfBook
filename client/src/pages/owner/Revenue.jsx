import React, { useState, useEffect } from 'react';
import bookingService from '../../services/bookingService';
import Spinner from '../../components/Spinner';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

/**
 * Revenue analytics page for Owners
 */
const Revenue = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalAdvance: 0, totalOutstanding: 0, completedCount: 0 });

  useEffect(() => {
    const fetchRevenueStats = async () => {
      setLoading(true);
      try {
        const data = await bookingService.getBookings();
        const list = data || [];
        setBookings(list);

        const confirmed = list.filter(b => b.bookingStatus === 'confirmed');
        const advance = confirmed.reduce((sum, b) => sum + (b.advancePaid || 0), 0);
        const balance = confirmed.reduce((sum, b) => sum + (b.balanceAmount || 0), 0);

        setStats({
          totalAdvance: advance,
          totalOutstanding: balance,
          completedCount: confirmed.length
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRevenueStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slatebg-dark">
        <Spinner size="lg" />
      </div>
    );
  }

  const confirmedBookings = bookings.filter(b => b.bookingStatus === 'confirmed');

  return (
    <div className="min-h-screen bg-slatebg-dark font-sans text-white pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-10">
      <h1 className="text-3xl font-extrabold font-sans">Financial Analytics</h1>

      {/* Stats summaries cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border-slate-700/40">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Advance Collected</p>
          <h2 className="text-3xl font-black text-turf-light mt-2">{formatCurrency(stats.totalAdvance)}</h2>
        </div>
        <div className="glass-panel p-6 rounded-2xl border-slate-700/40">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Outstanding Balance</p>
          <h2 className="text-3xl font-black text-accent-gold mt-2">{formatCurrency(stats.totalOutstanding)}</h2>
        </div>
        <div className="glass-panel p-6 rounded-2xl border-slate-700/40">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Confirmed Bookings</p>
          <h2 className="text-3xl font-black text-white mt-2">{stats.completedCount}</h2>
        </div>
      </div>

      {/* Revenue transaction details */}
      <div className="glass-panel p-6 rounded-2xl border-slate-700/40">
        <h3 className="text-lg font-bold font-sans mb-4 border-b border-slate-800 pb-3">Confirmed Earnings Audit</h3>

        {confirmedBookings.length === 0 ? (
          <p className="text-xs text-slate-500 py-12 text-center">No transactions completed yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Booking Date</th>
                  <th className="py-3 px-4">Playground</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4 text-center">Advance Paid</th>
                  <th className="py-3 px-4 text-center">Balance Due</th>
                  <th className="py-3 px-4 text-right">Total Billing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-light">
                {confirmedBookings.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-900/30 transition">
                    <td className="py-3.5 px-4 font-mono">{formatDate(b.date)}</td>
                    <td className="py-3.5 px-4 font-semibold text-white">{b.turf?.name}</td>
                    <td className="py-3.5 px-4">{b.customer?.name}</td>
                    <td className="py-3.5 px-4 text-center text-turf-light font-medium">{formatCurrency(b.advancePaid)}</td>
                    <td className="py-3.5 px-4 text-center text-accent-gold font-medium">{formatCurrency(b.balanceAmount)}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-white">{formatCurrency(b.totalPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Revenue;
