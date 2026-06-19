import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

/**
 * Responsive role-aware Navbar
 */
const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'text-turf-light' : 'text-slate-300 hover:text-white';
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-slatebg-dark/80 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 text-white font-extrabold text-xl font-sans tracking-wide">
              <span className="w-8 h-8 rounded-lg bg-turf flex items-center justify-center text-white text-base shadow-md shadow-turf/30">
                TB
              </span>
              <span>
                TurfBook <span className="text-turf-light text-glow">TN</span>
              </span>
            </Link>
          </div>

          {/* Navigation Links (Desktop) */}
          <div className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {(!isAuthenticated || user.role !== 'owner') && (
              <>
                <Link to="/" className={`transition ${isActive('/')}`}>Home</Link>
                <Link to="/turfs" className={`transition ${isActive('/turfs')}`}>Browse Turfs</Link>
              </>
            )}

            {isAuthenticated && (
              <>
                {/* Customer Menu */}
                {user.role === 'customer' && (
                  <>
                    <Link to="/bookings" className={`transition ${isActive('/bookings')}`}>My Bookings</Link>
                    <Link to="/profile" className={`transition ${isActive('/profile')}`}>Profile</Link>
                  </>
                )}

                {/* Owner Menu */}
                {user.role === 'owner' && user.isApproved && (
                  <>
                    <Link to="/owner" className={`transition ${isActive('/owner')}`}>Dashboard</Link>
                    <Link to="/owner/turf" className={`transition ${isActive('/owner/turf')}`}>Manage Turf</Link>
                    <Link to="/owner/slots" className={`transition ${isActive('/owner/slots')}`}>Slot Manager</Link>
                    <Link to="/owner/requests" className={`transition ${isActive('/owner/requests')}`}>Requests</Link>
                    <Link to="/owner/revenue" className={`transition ${isActive('/owner/revenue')}`}>Revenue</Link>
                  </>
                )}

                {/* Admin Menu */}
                {user.role === 'admin' && (
                  <>
                    <Link to="/admin" className={`transition ${isActive('/admin')}`}>Admin Hub</Link>
                    <Link to="/admin/owners" className={`transition ${isActive('/admin/owners')}`}>Owners</Link>
                    <Link to="/admin/turfs" className={`transition ${isActive('/admin/turfs')}`}>Turfs</Link>
                    <Link to="/admin/users" className={`transition ${isActive('/admin/users')}`}>Users</Link>
                    <Link to="/admin/analytics" className={`transition ${isActive('/admin/analytics')}`}>Analytics</Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* User Controls (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-xs font-bold text-white leading-none">{user.name}</p>
                  <p className="text-[10px] text-slate-400 capitalize mt-0.5">{user.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700/80 border border-slate-700/40 text-slate-200 text-xs font-semibold rounded-xl transition duration-150"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-slate-300 hover:text-white text-xs font-semibold px-3 py-2 transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-turf hover:bg-turf-dark text-white text-xs font-semibold rounded-xl shadow-md shadow-turf/15 transition duration-150"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger trigger */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-400 hover:text-white p-2 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      {isOpen && (
        <div className="md:hidden bg-slatebg-dark/95 border-b border-slate-800/80 animate-in slide-in-from-top duration-200 px-4 pt-2 pb-4 space-y-2 text-sm font-medium">
          {(!isAuthenticated || user.role !== 'owner') && (
            <>
              <Link to="/" onClick={() => setIsOpen(false)} className="block py-2 text-slate-300 hover:text-white">Home</Link>
              <Link to="/turfs" onClick={() => setIsOpen(false)} className="block py-2 text-slate-300 hover:text-white">Browse Turfs</Link>
            </>
          )}

          {isAuthenticated ? (
            <>
              {/* Customer Mobile Links */}
              {user.role === 'customer' && (
                <>
                  <Link to="/bookings" onClick={() => setIsOpen(false)} className="block py-2 text-slate-300 hover:text-white">My Bookings</Link>
                  <Link to="/profile" onClick={() => setIsOpen(false)} className="block py-2 text-slate-300 hover:text-white">Profile</Link>
                </>
              )}

              {/* Owner Mobile Links */}
              {user.role === 'owner' && user.isApproved && (
                <>
                  <Link to="/owner" onClick={() => setIsOpen(false)} className="block py-2 text-slate-300 hover:text-white">Dashboard</Link>
                  <Link to="/owner/turf" onClick={() => setIsOpen(false)} className="block py-2 text-slate-300 hover:text-white">Manage Turf</Link>
                  <Link to="/owner/slots" onClick={() => setIsOpen(false)} className="block py-2 text-slate-300 hover:text-white">Slot Manager</Link>
                  <Link to="/owner/requests" onClick={() => setIsOpen(false)} className="block py-2 text-slate-300 hover:text-white">Requests</Link>
                  <Link to="/owner/revenue" onClick={() => setIsOpen(false)} className="block py-2 text-slate-300 hover:text-white">Revenue</Link>
                </>
              )}

              {/* Admin Mobile Links */}
              {user.role === 'admin' && (
                <>
                  <Link to="/admin" onClick={() => setIsOpen(false)} className="block py-2 text-slate-300 hover:text-white">Admin Hub</Link>
                  <Link to="/admin/owners" onClick={() => setIsOpen(false)} className="block py-2 text-slate-300 hover:text-white">Owners</Link>
                  <Link to="/admin/turfs" onClick={() => setIsOpen(false)} className="block py-2 text-slate-300 hover:text-white">Turfs</Link>
                  <Link to="/admin/users" onClick={() => setIsOpen(false)} className="block py-2 text-slate-300 hover:text-white">Users</Link>
                  <Link to="/admin/analytics" onClick={() => setIsOpen(false)} className="block py-2 text-slate-300 hover:text-white">Analytics</Link>
                </>
              )}

              <div className="pt-4 border-t border-slate-800/80">
                <p className="text-xs font-bold text-white leading-none mb-1">{user.name}</p>
                <p className="text-[10px] text-slate-400 capitalize mb-3">{user.role}</p>
                <button
                  onClick={() => { setIsOpen(false); handleLogout(); }}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="pt-4 border-t border-slate-800/80 flex flex-col space-y-2">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="w-full py-2.5 text-center text-slate-300 border border-slate-800 rounded-xl text-xs font-semibold"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="w-full py-2.5 text-center bg-turf text-white rounded-xl text-xs font-semibold"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
