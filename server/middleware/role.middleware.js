const apiResponse = require('../utils/apiResponse');

/**
 * Access control role middleware
 * @param {...String} roles - Allowed roles (e.g., 'admin', 'owner', 'customer')
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return apiResponse(res, 401, false, 'Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      return apiResponse(
        res, 
        403, 
        false, 
        `Forbidden: Access restricted to [${roles.join(', ')}] role(s)`
      );
    }

    // Additional restriction: Turf owners must be approved by the platform administrator
    if (req.user.role === 'owner' && !req.user.isApproved) {
      return apiResponse(
        res, 
        403, 
        false, 
        'Forbidden: Your owner registration request is pending admin approval.'
      );
    }

    next();
  };
};

module.exports = requireRole;
