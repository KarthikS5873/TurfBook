import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Spinner from './Spinner';

/**
 * Route protection wrapper component
 * @param {React.ReactNode} children - Wrapped content
 * @param {Array<String>} [allowedRoles] - Roles authorized to access this route
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slatebg-dark">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login, storing original path for return redirections
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Role check failed, redirect back to home base
    return <Navigate to="/" replace />;
  }

  // Double check: if turf owner is not approved by admin, prevent them from accessing dashboard
  if (user.role === 'owner' && !user.isApproved && allowedRoles && allowedRoles.includes('owner')) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slatebg-dark">
        <div className="glass-panel max-w-md w-full p-8 text-center rounded-2xl">
          <div className="w-16 h-16 bg-accent-gold/10 text-accent-gold rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold font-sans text-white mb-2">Account Under Review</h2>
          <p className="text-slate-300 text-sm mb-6 leading-relaxed">
            Your Turf Owner profile application is currently pending admin review. You will gain full access to the dashboard once approved.
          </p>
          <div className="mb-6 p-4 bg-turf/10 border border-turf/20 text-turf-light text-xs rounded-xl font-medium text-left">
            <span className="font-bold block mb-1">💡 Demo Mode Hint:</span>
            To approve this owner account, logout and log in using the Admin credentials:
            <div className="mt-1.5 font-mono bg-slate-900/50 p-2.5 rounded-lg border border-slate-700/50 text-[11px] text-white select-all">
              Email: admin@turfbooktn.com<br />
              Password: Admin@Password123
            </div>
          </div>
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition duration-200"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
