import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Spinner from '../../components/Spinner';
import { formatCurrency } from '../../utils/formatCurrency';

/**
 * Main Administrator Dashboard
 */
const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalOwners: 0,
    totalTurfs: 0,
    totalBookings: 0,
    totalRevenue: 0
  });

  const [pendingOwners, setPendingOwners] = useState([]);
  const [pendingTurfs, setPendingTurfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAdminDashboard = async () => {
    setLoading(true);
    try {
      // 1. Fetch stats
      const statsResponse = await api.get('/admin/stats');
      setStats(statsResponse.data.data || {});

      // 2. Fetch users to filter pending owners
      const usersResponse = await api.get('/admin/users');
      const allUsers = usersResponse.data.data || [];
      setPendingOwners(allUsers.filter(u => u.role === 'owner' && !u.isApproved));

      // 3. Fetch turfs to filter pending turfs
      const turfsResponse = await api.get('/turfs');
      const allTurfs = turfsResponse.data.data || [];
      setPendingTurfs(allTurfs.filter(t => t.status === 'pending'));
    } catch (err) {
      console.error(err);
      setError('Failed to load administrator dashboard stats.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminDashboard();
  }, []);

  const handleApproveOwner = async (ownerId, approve) => {
    if (!window.confirm(`Are you sure you want to ${approve ? 'approve' : 'reject'} this owner?`)) return;
    try {
      await api.post('/admin/approve-owner', { ownerId, approve });
      alert(`Owner account registration ${approve ? 'approved' : 'rejected'} successfully!`);
      loadAdminDashboard();
    } catch (err) {
      console.error(err);
      alert('Failed to update owner status.');
    }
  };

  const handleApproveTurf = async (turfId, status) => {
    if (!window.confirm(`Are you sure you want to mark this turf as ${status}?`)) return;
    try {
      await api.post('/admin/approve-turf', { turfId, status });
      alert(`Turf listing has been ${status}!`);
      loadAdminDashboard();
    } catch (err) {
      console.error(err);
      alert('Failed to update turf status.');
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
      
      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass-panel p-5 rounded-xl border-slate-700/40">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Gross Platform Revenue</p>
          <h3 className="text-xl font-black text-turf-light mt-1.5">{formatCurrency(stats.totalRevenue)}</h3>
        </div>
        <div className="glass-panel p-5 rounded-xl border-slate-700/40">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Active Customers</p>
          <h3 className="text-xl font-black text-white mt-1.5">{stats.totalCustomers}</h3>
        </div>
        <div className="glass-panel p-5 rounded-xl border-slate-700/40">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Registered Owners</p>
          <h3 className="text-xl font-black text-white mt-1.5">{stats.totalOwners}</h3>
        </div>
        <div className="glass-panel p-5 rounded-xl border-slate-700/40">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Playgrounds</p>
          <h3 className="text-xl font-black text-white mt-1.5">{stats.totalTurfs}</h3>
        </div>
        <div className="glass-panel p-5 rounded-xl border-slate-700/40">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Booking Logs</p>
          <h3 className="text-xl font-black text-white mt-1.5">{stats.totalBookings}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Pending Owners Table */}
        <div className="glass-panel p-6 rounded-2xl border-slate-700/40 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
            <h3 className="text-base font-bold font-sans">Pending Owners Approval ({pendingOwners.length})</h3>
            <Link to="/admin/owners" className="text-xs text-turf-light hover:underline font-semibold">Manage</Link>
          </div>

          {pendingOwners.length === 0 ? (
            <p className="text-xs text-slate-500 py-10 text-center">No pending owner registration applications.</p>
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {pendingOwners.map((owner) => (
                <div key={owner._id} className="flex justify-between items-center bg-slate-900/40 border border-slate-850 p-3.5 rounded-xl">
                  <div>
                    <h5 className="text-xs font-bold text-white">{owner.name}</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">{owner.email} | {owner.phone || 'No phone'}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproveOwner(owner._id, false)}
                      className="px-2.5 py-1.5 border border-slate-800 hover:bg-accent-coral/10 hover:text-accent-coral rounded-lg text-[10px] font-semibold transition"
                    >
                      Deny
                    </button>
                    <button
                      onClick={() => handleApproveOwner(owner._id, true)}
                      className="px-3 py-1.5 bg-turf hover:bg-turf-dark text-white rounded-lg text-[10px] font-semibold transition"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Turfs Table */}
        <div className="glass-panel p-6 rounded-2xl border-slate-700/40 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
            <h3 className="text-base font-bold font-sans">Pending Turf Listings ({pendingTurfs.length})</h3>
            <Link to="/admin/turfs" className="text-xs text-turf-light hover:underline font-semibold">Manage</Link>
          </div>

          {pendingTurfs.length === 0 ? (
            <p className="text-xs text-slate-500 py-10 text-center">No pending turf listings review requests.</p>
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {pendingTurfs.map((turf) => (
                <div key={turf._id} className="flex justify-between items-center bg-slate-900/40 border border-slate-850 p-3.5 rounded-xl">
                  <div>
                    <h5 className="text-xs font-bold text-white">{turf.name}</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Owner: {turf.owner?.name} | Location: {turf.city}, {turf.district}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproveTurf(turf._id, 'rejected')}
                      className="px-2.5 py-1.5 border border-slate-800 hover:bg-accent-coral/10 hover:text-accent-coral rounded-lg text-[10px] font-semibold transition"
                    >
                      Deny
                    </button>
                    <button
                      onClick={() => handleApproveTurf(turf._id, 'approved')}
                      className="px-3 py-1.5 bg-turf hover:bg-turf-dark text-white rounded-lg text-[10px] font-semibold transition"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
