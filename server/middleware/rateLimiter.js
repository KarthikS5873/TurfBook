const rateLimit = require('express-rate-limit');

/**
 * Standard API rate limiter config
 * Limits requests to 10000 per 15 minutes per IP address in local dev, or 100 in production
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 10000, // Maximum requests
  standardHeaders: true, // Return rate limit info headers
  legacyHeaders: false, // Hide legacy headers
  message: {
    success: false,
    message: 'Too many requests from this address. Please try again after 15 minutes.'
  }
});

module.exports = limiter;
