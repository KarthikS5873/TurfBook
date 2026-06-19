const User = require('../models/User');
const Turf = require('../models/Turf');
const Booking = require('../models/Booking');
const sendEmail = require('../utils/sendEmail');
const apiResponse = require('../utils/apiResponse');

/**
 * Approve or Reject Turf Owner profile
 * POST /api/admin/approve-owner
 * Private (Admin Only)
 */
exports.approveOwner = async (req, res, next) => {
  try {
    const { ownerId, approve } = req.body;

    if (!ownerId || approve === undefined) {
      return apiResponse(res, 400, false, 'Missing ownerId or approve boolean');
    }

    const user = await User.findById(ownerId);
    if (!user || user.role !== 'owner') {
      return apiResponse(res, 404, false, 'Owner account not found');
    }

    user.isApproved = !!approve;
    await user.save();

    const subject = !!approve 
      ? 'TurfBook TN - Owner Account Approved!' 
      : 'TurfBook TN - Owner Account Application Update';

    const bodyText = !!approve
      ? `Hello ${user.name},\n\nWe are pleased to inform you that your Turf Owner profile has been approved! You can now log in, list your turfs, setup dates and slots, and receive bookings.\n\nBest regards,\nTurfBook TN Team`
      : `Hello ${user.name},\n\nThank you for registering. Unfortunately, your Turf Owner profile application has been rejected at this time. Please contact support for more details.\n\nBest regards,\nTurfBook TN Team`;

    // Notify owner
    await sendEmail({
      to: user.email,
      subject,
      text: bodyText,
      recipientId: user._id
    });

    return apiResponse(
      res, 
      200, 
      true, 
      `Owner profile has been ${!!approve ? 'approved' : 'rejected'}. Notification email sent.`, 
      user
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Approve or Reject Turf listing
 * POST /api/admin/approve-turf
 * Private (Admin Only)
 */
exports.approveTurf = async (req, res, next) => {
  try {
    const { turfId, status } = req.body;

    if (!turfId || !status || !['approved', 'rejected'].includes(status)) {
      return apiResponse(res, 400, false, 'Invalid status parameter. Use "approved" or "rejected".');
    }

    const turf = await Turf.findById(turfId).populate('owner');
    if (!turf) {
      return apiResponse(res, 404, false, 'Turf listing not found');
    }

    turf.status = status;
    await turf.save();

    // Send email alert to turf owner
    await sendEmail({
      to: turf.owner.email,
      subject: `TurfBook TN - Turf Listing "${turf.name}" Update`,
      text: `Hello ${turf.owner.name},\n\nYour turf listing "${turf.name}" has been ${status} by the platform administrator.\n\nBest regards,\nTurfBook TN Team`,
      recipientId: turf.owner._id
    });

    return apiResponse(res, 200, true, `Turf listing status changed to ${status}`, turf);
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch platform overview statistics
 * GET /api/admin/stats
 * Private (Admin Only)
 */
exports.getStats = async (req, res, next) => {
  try {
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalOwners = await User.countDocuments({ role: 'owner' });
    const totalTurfs = await Turf.countDocuments();
    const totalBookings = await Booking.countDocuments();

    // Sum overall advance payments of confirmed bookings
    const confirmedBookings = await Booking.find({ bookingStatus: 'confirmed' });
    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.advancePaid || 0), 0);

    return apiResponse(res, 200, true, 'Statistics loaded successfully', {
      totalCustomers,
      totalOwners,
      totalTurfs,
      totalBookings,
      totalRevenue
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch all registered users
 * GET /api/admin/users
 * Private (Admin Only)
 */
exports.manageUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return apiResponse(res, 200, true, 'All user records retrieved', users);
  } catch (error) {
    next(error);
  }
};
