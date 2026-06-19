const apiResponse = require('../utils/apiResponse');

/**
 * Global Error Interceptor Middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('Unhandled API Error:', err);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose Bad ObjectId CastError
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Resource not found with identifier of: ${err.value}`;
  }

  // Mongoose Schema Validation Failures
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((val) => val.message).join(', ');
  }

  // Mongoose Duplicate Key Error (Unique constraints)
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate database resource record already exists.';
  }

  // JWT Token Failures
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Authentication token is invalid or malformed.';
  }

  return apiResponse(res, statusCode, false, message);
};

module.exports = errorHandler;
