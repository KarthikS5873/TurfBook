const jwt = require('jsonwebtoken');
const User = require('../models/User');
const apiResponse = require('../utils/apiResponse');

/**
 * Authentication check middleware
 * Checks for JWT bearer tokens in the authorization header
 */
const verifyToken = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_turf_booking_key_999');

      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return apiResponse(res, 401, false, 'User account no longer exists');
      }

      next();
    } catch (error) {
      console.error('JWT Token Verification Error:', error.message);
      return apiResponse(res, 401, false, 'Access denied. Invalid or expired token.');
    }
  }

  if (!token) {
    return apiResponse(res, 401, false, 'Access denied. No authentication token provided.');
  }
};

module.exports = verifyToken;
