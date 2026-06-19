/**
 * Standard API Response Wrapper
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP status code
 * @param {Boolean} success - True if request succeeded, false otherwise
 * @param {String} message - User-friendly messaging details
 * @param {any} data - Associated payload data
 */
const apiResponse = (res, statusCode, success, message, data = null) => {
  return res.status(statusCode).json({
    success,
    message,
    data
  });
};

module.exports = apiResponse;
