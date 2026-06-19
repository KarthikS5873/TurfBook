import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Spinner from './Spinner';
import ApprovalPending from './ApprovalPending';

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
    return <ApprovalPending />;
  }

  return children;
};

export default ProtectedRoute;
