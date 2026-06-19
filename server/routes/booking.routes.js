const express = require('express');
const router = express.Router();
const { 
  createBooking, 
  getBookings, 
  updateStatus, 
  cancelBooking 
} = require('../controllers/booking.controller');

const verifyToken = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');

// Protect all booking management routes
router.use(verifyToken);

router.post('/', requireRole('customer'), createBooking);
router.get('/', getBookings);
router.put('/:id/status', requireRole('owner', 'admin'), updateStatus);
router.post('/:id/cancel', requireRole('customer', 'admin'), cancelBooking);

module.exports = router;
