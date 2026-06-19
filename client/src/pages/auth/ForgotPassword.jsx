import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../../services/authService';
import Spinner from '../../components/Spinner';

/**
 * Standard Forgot Password page
 */
const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await authService.forgotPassword(email);
      setMessage(response.message || 'Recovery email dispatched. Check your mailbox.');
    } catch (err) {
      console.error(err);
      setError('Failed to request password reset. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slatebg-dark pt-24">
      <div className="glass-panel max-w-md w-full p-8 rounded-2xl border-slate-700/40">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold font-sans text-white">Reset Password</h2>
          <p className="text-slate-400 text-xs mt-1">Enter your registered email below to receive a password reset link.</p>
        </div>

        {error && (
          <div className="mb-5 p-4 bg-accent-coral/10 border border-accent-coral/20 text-accent-coral text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-5 p-4 bg-turf/10 border border-turf/20 text-turf-light text-xs rounded-xl font-medium">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input 
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="karthik@gmail.com"
              className="w-full bg-slate-900/45 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-turf focus:ring-1 focus:ring-turf transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-turf hover:bg-turf-dark disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold rounded-xl shadow-lg shadow-turf/15 hover:shadow-none transition duration-200 mt-2 flex items-center justify-center"
          >
            {loading ? <Spinner size="sm" /> : 'Send Reset Link'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          Remember your password?{' '}
          <Link to="/login" className="text-turf-light hover:underline font-semibold">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
