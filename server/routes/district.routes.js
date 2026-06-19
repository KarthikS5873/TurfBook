const express = require('express');
const router = express.Router();
const District = require('../models/District');
const apiResponse = require('../utils/apiResponse');

/**
 * Fetch all Tamil Nadu districts and cities
 * GET /api/districts
 */
router.get('/', async (req, res, next) => {
  try {
    const districts = await District.find().sort({ name: 1 });
    return apiResponse(res, 200, true, 'Districts retrieved successfully', districts);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
