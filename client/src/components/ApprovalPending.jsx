import React from 'react';
import useAuth from '../hooks/useAuth';

const ApprovalPending = () => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

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

        <button
          onClick={handleLogout}
          className="w-full py-3 bg-accent-coral hover:bg-accent-coral/80 text-white font-medium rounded-xl transition duration-200"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default ApprovalPending;
