const express = require('express');
const router = express.Router();
const { 
  addReview, 
  getTurfReviews, 
  deleteReview 
} = require('../controllers/review.controller');

const verifyToken = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');
const upload = require('../middleware/upload.middleware');

// Public retrieve review endpoint
router.get('/turf/:turfId', getTurfReviews);

// Private review management endpoints
router.post('/', verifyToken, requireRole('customer'), upload.array('photos', 3), addReview);
router.delete('/:id', verifyToken, deleteReview);

module.exports = router;
