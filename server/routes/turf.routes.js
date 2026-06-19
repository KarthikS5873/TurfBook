const express = require('express');
const router = express.Router();
const { 
  createTurf, 
  getTurfs, 
  getAllTurfs,
  getMyTurfs,
  getTurf, 
  updateTurf, 
  deleteTurf, 
  uploadPhotos 
} = require('../controllers/turf.controller');

const verifyToken = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');
const upload = require('../middleware/upload.middleware');

// Public routes
router.get('/', getTurfs);
router.get('/my', verifyToken, requireRole('owner'), getMyTurfs);
router.get('/all', verifyToken, requireRole('admin'), getAllTurfs);
router.get('/:id', getTurf);

// Protected routes (Owners and Admin)
router.post('/', verifyToken, requireRole('owner'), createTurf);
router.put('/:id', verifyToken, requireRole('owner', 'admin'), updateTurf);
router.delete('/:id', verifyToken, requireRole('owner', 'admin'), deleteTurf);

// Media uploading route
router.post('/:id/photos', verifyToken, requireRole('owner'), upload.array('photos', 5), uploadPhotos);

module.exports = router;
