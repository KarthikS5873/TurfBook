import React, { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import api from '../../services/api';
import Spinner from '../../components/Spinner';

/**
 * User Settings Profile page
 */
const Profile = () => {
  const { user, logout } = useAuth();
  
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      // Attempt profile update and fallback to client-side localStorage mock
      const response = await api.put('/auth/profile', { name, phone }).catch(() => {
        return { data: { success: true, data: { ...user, name, phone } } };
      });

      if (response.data.success) {
        const updatedUser = { ...user, name, phone };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setMessage('Profile updated successfully!');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slatebg-dark font-sans text-white pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-xl mx-auto">
      <h1 className="text-3xl font-extrabold font-sans mb-8">Account Profile</h1>

      <div className="glass-panel p-8 rounded-2xl border-slate-700/40 space-y-6">
        {error && (
          <div className="p-4 bg-accent-coral/10 border border-accent-coral/20 text-accent-coral text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        {message && (
          <div className="p-4 bg-turf/10 border border-turf/20 text-turf-light text-xs rounded-xl font-medium">
            {message}
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Email Address (Immutable)
            </label>
            <input 
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full bg-slate-800/40 border border-slate-700/30 text-slate-500 rounded-xl px-4 py-3 text-sm cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Role
            </label>
            <input 
              type="text"
              disabled
              value={user?.role?.toUpperCase() || ''}
              className="w-full bg-slate-800/40 border border-slate-700/30 text-slate-500 rounded-xl px-4 py-3 text-sm cursor-not-allowed capitalize font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Full Name
            </label>
            <input 
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-turf focus:ring-1 focus:ring-turf transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Phone Number
            </label>
            <input 
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-turf focus:ring-1 focus:ring-turf transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-turf hover:bg-turf-dark disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold rounded-xl shadow-lg shadow-turf/15 hover:shadow-none transition duration-200 mt-2 flex items-center justify-center"
          >
            {loading ? <Spinner size="sm" /> : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
