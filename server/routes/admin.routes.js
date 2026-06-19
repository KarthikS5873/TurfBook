const express = require('express');
const router = express.Router();
const { 
  approveOwner, 
  approveTurf, 
  getStats, 
  manageUsers 
} = require('../controllers/admin.controller');

const verifyToken = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');

// Protect all admin routes with JWT and Admin checks
router.use(verifyToken);
router.use(requireRole('admin'));

router.post('/approve-owner', approveOwner);
router.post('/approve-turf', approveTurf);
router.get('/stats', getStats);
router.get('/users', manageUsers);

module.exports = router;
