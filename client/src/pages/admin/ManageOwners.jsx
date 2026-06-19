import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Spinner from '../../components/Spinner';

/**
 * Admin Panel - Manage Owners
 */
const ManageOwners = () => {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOwners = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/users');
      const allUsers = response.data.data || [];
      setOwners(allUsers.filter(u => u.role === 'owner'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwners();
  }, []);

  const handleApprove = async (ownerId, approve) => {
    if (!window.confirm(`Are you sure you want to change approval state?`)) return;
    try {
      await api.post('/admin/approve-owner', { ownerId, approve });
      alert(`Approval state changed!`);
      fetchOwners();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slatebg-dark text-white pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-8">Manage Owners</h1>
      
      {loading ? <Spinner size="lg" /> : (
        <div className="glass-panel p-6 rounded-2xl border-slate-700/40 overflow-x-auto">
          {owners.length === 0 ? (
            <p className="text-xs text-slate-500 py-10 text-center">No owner profiles registered on platform.</p>
          ) : (
            <table className="w-full text-left text-xs border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {owners.map(owner => (
                  <tr key={owner._id} className="hover:bg-slate-900/10">
                    <td className="py-3.5 px-4 font-bold text-white">{owner.name}</td>
                    <td className="py-3.5 px-4">{owner.email}</td>
                    <td className="py-3.5 px-4">{owner.phone || 'No phone'}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        owner.isApproved 
                          ? 'bg-turf/10 text-turf-light border-turf/20' 
                          : 'bg-accent-gold/10 text-accent-gold border-accent-gold/20'
                      }`}>
                        {owner.isApproved ? 'APPROVED' : 'PENDING'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleApprove(owner._id, !owner.isApproved)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition ${
                          owner.isApproved 
                            ? 'border border-slate-800 hover:bg-accent-coral/10 hover:text-accent-coral' 
                            : 'bg-turf hover:bg-turf-dark text-white'
                        }`}
                      >
                        {owner.isApproved ? 'Revoke Approval' : 'Approve Account'}
                      </button>
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

export default ManageOwners;
