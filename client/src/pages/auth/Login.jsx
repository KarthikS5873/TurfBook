import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Spinner from '../../components/Spinner';

/**
 * Standard Login page
 */
const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get redirect path or default based on role
  const from = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      
      if (from) {
        navigate(from, { replace: true });
        return;
      }

      // Role based routing
      if (data.user.role === 'admin') {
        navigate('/admin');
      } else if (data.user.role === 'owner') {
        navigate('/owner');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slatebg-dark pt-24">
      <div className="glass-panel max-w-md w-full p-8 rounded-2xl border-slate-700/40">
        <div className="text-center mb-8">
          <span className="w-12 h-12 rounded-xl bg-turf flex items-center justify-center text-white text-lg font-bold mx-auto mb-4 shadow-lg shadow-turf/25">
            TB
          </span>
          <h2 className="text-2xl font-bold font-sans text-white">Welcome Back</h2>
          <p className="text-slate-400 text-xs mt-1">Book your playground slots seamlessly</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-accent-coral/10 border border-accent-coral/20 text-accent-coral text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input 
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-slate-900/45 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-turf focus:ring-1 focus:ring-turf transition"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Password
              </label>
              <Link to="/forgot-password" className="text-xs text-turf-light hover:text-white transition">
                Forgot Password?
              </Link>
            </div>
            <input 
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-900/45 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-turf focus:ring-1 focus:ring-turf transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-turf hover:bg-turf-dark disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold rounded-xl shadow-lg shadow-turf/15 hover:shadow-none transition duration-200 mt-2 flex items-center justify-center"
          >
            {loading ? <Spinner size="sm" /> : 'Log In'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-8">
          Don't have an account?{' '}
          <Link to="/register" className="text-turf-light hover:underline font-semibold">
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
