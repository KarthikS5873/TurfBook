const express = require('express');
const router = express.Router();
const { 
  createBalanceOrder, 
  verifyPayment, 
  webhook 
} = require('../controllers/payment.controller');

const verifyToken = require('../middleware/auth.middleware');

// Checkout operations
router.post('/balance', verifyToken, createBalanceOrder);
router.post('/verify', verifyToken, verifyPayment);

// Public webhook listener
router.post('/webhook', webhook);

module.exports = router;
