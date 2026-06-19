import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Customer Pages
import Home from './pages/customer/Home';
import TurfList from './pages/customer/TurfList';
import TurfDetail from './pages/customer/TurfDetail';
import BookingPage from './pages/customer/BookingPage';
import BookingHistory from './pages/customer/BookingHistory';
import Profile from './pages/customer/Profile';

// Owner Pages
import OwnerDashboard from './pages/owner/OwnerDashboard';
import ManageTurf from './pages/owner/ManageTurf';
import SlotManager from './pages/owner/SlotManager';
import BookingRequests from './pages/owner/BookingRequests';
import Revenue from './pages/owner/Revenue';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageOwners from './pages/admin/ManageOwners';
import ManageTurfs from './pages/admin/ManageTurfs';
import ManageUsers from './pages/admin/ManageUsers';
import Analytics from './pages/admin/Analytics';

function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            {/* Header Navigation */}
            <Navbar />

            {/* Central Page Contents */}
            <main className="flex-grow">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/turfs" element={<TurfList />} />
                <Route path="/turfs/:id" element={<TurfDetail />} />

                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* Protected Customer Routes */}
                <Route 
                  path="/booking/confirm" 
                  element={
                    <ProtectedRoute allowedRoles={['customer']}>
                      <BookingPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/bookings" 
                  element={
                    <ProtectedRoute allowedRoles={['customer', 'owner', 'admin']}>
                      <BookingHistory />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute allowedRoles={['customer', 'owner', 'admin']}>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />

                {/* Protected Owner Routes */}
                <Route 
                  path="/owner" 
                  element={
                    <ProtectedRoute allowedRoles={['owner']}>
                      <OwnerDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/owner/turf" 
                  element={
                    <ProtectedRoute allowedRoles={['owner']}>
                      <ManageTurf />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/owner/slots" 
                  element={
                    <ProtectedRoute allowedRoles={['owner']}>
                      <SlotManager />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/owner/requests" 
                  element={
                    <ProtectedRoute allowedRoles={['owner']}>
                      <BookingRequests />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/owner/revenue" 
                  element={
                    <ProtectedRoute allowedRoles={['owner']}>
                      <Revenue />
                    </ProtectedRoute>
                  } 
                />

                {/* Protected Admin Routes */}
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/owners" 
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <ManageOwners />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/turfs" 
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <ManageTurfs />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/users" 
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <ManageUsers />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/analytics" 
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <Analytics />
                    </ProtectedRoute>
                  } 
                />

                {/* Fallback route */}
                <Route path="*" element={<Home />} />
              </Routes>
            </main>

            {/* Footer */}
            <Footer />
          </div>
        </Router>
      </BookingProvider>
    </AuthProvider>
  );
}

export default App;
