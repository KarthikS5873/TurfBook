import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Spinner from '../../components/Spinner';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

/**
 * Admin Panel - Analytics
 */
const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get('/admin/stats');
        setStats(response.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slatebg-dark">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slatebg-dark text-white pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      <h1 className="text-3xl font-extrabold mb-8 font-sans">Platform Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl border-slate-700/40 space-y-4">
          <h3 className="text-base font-bold font-sans border-b border-slate-800 pb-2.5">User Base Analysis</h3>
          <div className="space-y-3.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Total Customers</span>
              <span className="font-semibold text-white">{stats?.totalCustomers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Turf Owners</span>
              <span className="font-semibold text-white">{stats?.totalOwners}</span>
            </div>
            <div className="flex justify-between border-t border-slate-850 pt-3">
              <span className="text-slate-300 font-medium">Aggregate Users</span>
              <span className="font-bold text-white">{(stats?.totalCustomers || 0) + (stats?.totalOwners || 0)}</span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border-slate-700/40 space-y-4">
          <h3 className="text-base font-bold font-sans border-b border-slate-800 pb-2.5">Platform Sales Analysis</h3>
          <div className="space-y-3.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Total Confirmed Bookings</span>
              <span className="font-semibold text-white">{stats?.totalBookings}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Gross Sales Revenue</span>
              <span className="font-semibold text-turf-light">{formatCurrency(stats?.totalRevenue)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-850 pt-3">
              <span className="text-slate-300 font-medium">Average Order Booking Value</span>
              <span className="font-bold text-white">
                {stats?.totalBookings > 0 
                  ? formatCurrency(Math.round(stats.totalRevenue / stats.totalBookings)) 
                  : formatCurrency(0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
