const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimiter = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/error.middleware');

// Initialize app
const app = express();

// Standard middlewares
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://turf-book-five.vercel.app',
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map(s => s.trim()) : [])
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiter to all API requests
app.use('/api', rateLimiter);

// Serve uploads folder statically for mock image rendering
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes imports
const authRoutes = require('./routes/auth.routes');
const districtRoutes = require('./routes/district.routes');
const turfRoutes = require('./routes/turf.routes');
const slotRoutes = require('./routes/slot.routes');
const bookingRoutes = require('./routes/booking.routes');
const paymentRoutes = require('./routes/payment.routes');
const reviewRoutes = require('./routes/review.routes');
const adminRoutes = require('./routes/admin.routes');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/districts', districtRoutes);
app.use('/api/turfs', turfRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// Fallback health-check route
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running smoothly' });
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
