const jwt = require('jsonwebtoken');

/**
 * Generate a JWT for an authenticated user
 * @param {String} userId - User identifier
 * @returns {String} Signed JWT
 */
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId }, 
    process.env.JWT_SECRET || 'super_secret_turf_booking_key_999', 
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

module.exports = generateToken;
