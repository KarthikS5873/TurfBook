const Review = require('../models/Review');
const Booking = require('../models/Booking');
const apiResponse = require('../utils/apiResponse');

/**
 * Add a review for a Turf
 * POST /api/reviews
 * Private (Customer with completed bookings)
 */
exports.addReview = async (req, res, next) => {
  try {
    const { turfId, rating, comment } = req.body;

    if (!turfId || !rating) {
      return apiResponse(res, 400, false, 'Missing turfId or rating parameter');
    }

    // Anti-spam constraint: customer must have at least one confirmed booking
    const hasBooked = await Booking.findOne({
      customer: req.user._id,
      turf: turfId,
      bookingStatus: 'confirmed'
    });

    if (!hasBooked && req.user.role !== 'admin') {
      return apiResponse(
        res, 
        400, 
        false, 
        'Validation failed: You can only review turfs that you have booked and played on.'
      );
    }

    // Double review check
    const existingReview = await Review.findOne({ user: req.user._id, turf: turfId });
    if (existingReview) {
      return apiResponse(res, 400, false, 'You have already reviewed this turf. Try editing or deleting it.');
    }

    const photos = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        if (file.path && !file.path.startsWith('d:\\') && !file.path.startsWith('/')) {
          photos.push(file.path);
        } else {
          const hostUrl = `${req.protocol}://${req.get('host')}`;
          photos.push(`${hostUrl}/uploads/${file.filename}`);
        }
      });
    }

    const review = await Review.create({
      user: req.user._id,
      turf: turfId,
      rating: Number(rating),
      comment,
      photos
    });

    return apiResponse(res, 201, true, 'Review posted successfully', review);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve reviews for a Turf
 * GET /api/reviews/turf/:turfId
 * Public
 */
exports.getTurfReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ turf: req.params.turfId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    return apiResponse(res, 200, true, 'Reviews fetched successfully', reviews);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a review
 * DELETE /api/reviews/:id
 * Private (Owner of review / Admin)
 */
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return apiResponse(res, 404, false, 'Review not found');
    }

    // Validate ownership
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return apiResponse(res, 403, false, 'Unauthorized to delete this review.');
    }

    await Review.findByIdAndDelete(req.params.id);
    return apiResponse(res, 200, true, 'Review deleted successfully');
  } catch (error) {
    next(error);
  }
};
