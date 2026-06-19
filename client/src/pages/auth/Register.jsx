import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Spinner from '../../components/Spinner';

/**
 * Standard Register page
 */
const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('customer'); // 'customer' or 'owner'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    try {
      await register({
        name,
        email,
        phone,
        password,
        role
      });

      if (role === 'owner') {
        setSuccess('Registration successful! Owner profile is pending review. Redirecting...');
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slatebg-dark pt-24">
      <div className="glass-panel max-w-md w-full p-8 rounded-2xl border-slate-700/40">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold font-sans text-white">Create an Account</h2>
          <p className="text-slate-400 text-xs mt-1">Join the TurfBook TN network today</p>
        </div>

        {/* Role tab selector */}
        <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => setRole('customer')}
            className={`py-2 px-3 text-center text-xs font-semibold rounded-lg transition duration-150 ${
              role === 'customer' 
                ? 'bg-turf text-white shadow-md shadow-turf/15'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Play/Book (Customer)
          </button>
          <button
            type="button"
            onClick={() => setRole('owner')}
            className={`py-2 px-3 text-center text-xs font-semibold rounded-lg transition duration-150 ${
              role === 'owner' 
                ? 'bg-turf text-white shadow-md shadow-turf/15'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Own a Turf (Owner)
          </button>
        </div>

        {error && (
          <div className="mb-5 p-4 bg-accent-coral/10 border border-accent-coral/20 text-accent-coral text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 p-4 bg-turf/10 border border-turf/20 text-turf-light text-xs rounded-xl font-medium">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Full Name
            </label>
            <input 
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Karthik Kumar"
              className="w-full bg-slate-900/45 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-turf focus:ring-1 focus:ring-turf transition"
            />
          </div>

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

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Phone Number
            </label>
            <input 
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="9876543210"
              className="w-full bg-slate-900/45 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-turf focus:ring-1 focus:ring-turf transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Password
            </label>
            <input 
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-900/45 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-turf focus:ring-1 focus:ring-turf transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Confirm Password
            </label>
            <input 
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-900/45 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-turf focus:ring-1 focus:ring-turf transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-turf hover:bg-turf-dark disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold rounded-xl shadow-lg shadow-turf/15 hover:shadow-none transition duration-200 mt-2 flex items-center justify-center"
          >
            {loading ? <Spinner size="sm" /> : 'Register'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-turf-light hover:underline font-semibold">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
