import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Spinner from '../../components/Spinner';

/**
 * Admin Panel - Manage Turfs
 */
const ManageTurfs = () => {
  const [turfs, setTurfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTurfs = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/turfs');
      setTurfs(response.data.data || []);
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to load turfs';
      setError(message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTurfs();
  }, []);

  const handleApprove = async (turfId, status) => {
    if (!window.confirm(`Are you sure you want to mark this turf as ${status}?`)) return;
    try {
      await api.post('/admin/approve-turf', { turfId, status });
      alert(`Turf status updated!`);
      fetchTurfs();
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to update turf';
      alert(`Error: ${message}`);
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slatebg-dark text-white pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-8">Manage Turfs</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-accent-coral/10 border border-accent-coral/20 rounded-lg text-accent-coral text-xs">
          {error}
        </div>
      )}
      {loading ? <Spinner size="lg" /> : (
        <div className="glass-panel p-6 rounded-2xl border-slate-700/40 overflow-x-auto">
          {turfs.length === 0 ? (
            <p className="text-xs text-slate-500 py-10 text-center">No turf listings registered on platform.</p>
          ) : (
            <table className="w-full text-left text-xs border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Owner</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {turfs.map(t => (
                  <tr key={t._id} className="hover:bg-slate-900/10">
                    <td className="py-3.5 px-4 font-bold text-white">{t.name}</td>
                    <td className="py-3.5 px-4">{t.city}, {t.district}</td>
                    <td className="py-3.5 px-4">{t.owner?.name || 'No owner'}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        t.status === 'approved' ? 'bg-turf/10 text-turf-light border-turf/20' : 
                        t.status === 'pending' ? 'bg-accent-gold/10 text-accent-gold border-accent-gold/20' : 
                        'bg-accent-coral/10 text-accent-coral border-accent-coral/20'
                      }`}>
                        {t.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        {t.status !== 'approved' && (
                          <button
                            onClick={() => handleApprove(t._id, 'approved')}
                            className="px-3 py-1.5 bg-turf hover:bg-turf-dark text-white rounded-lg text-[10px] font-bold"
                          >
                            Approve
                          </button>
                        )}
                        {t.status !== 'rejected' && (
                          <button
                            onClick={() => handleApprove(t._id, 'rejected')}
                            className="px-3 py-1.5 border border-slate-800 hover:bg-accent-coral/10 hover:text-accent-coral rounded-lg text-[10px] font-bold"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default ManageTurfs;
