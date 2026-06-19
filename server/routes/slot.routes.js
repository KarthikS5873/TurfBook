const express = require('express');
const router = express.Router();
const { 
  createSlot, 
  getSlots, 
  updateSlot, 
  deleteSlot 
} = require('../controllers/slot.controller');

const verifyToken = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');

// Public slots listings
router.get('/', getSlots);

// Protected slot management
router.post('/', verifyToken, requireRole('owner'), createSlot);
router.put('/:id', verifyToken, requireRole('owner'), updateSlot);
router.delete('/:id', verifyToken, requireRole('owner'), deleteSlot);

module.exports = router;
