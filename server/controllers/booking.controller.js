const Booking = require('../models/Booking');
const Slot = require('../models/Slot');
const Turf = require('../models/Turf');
const Payment = require('../models/Payment');
const { razorpayInstance, isMock } = require('../config/razorpay');
const sendEmail = require('../utils/sendEmail');
const sendSMS = require('../utils/sendSMS');
const apiResponse = require('../utils/apiResponse');

exports.createBooking = async (req, res, next) => {
  try {
    const { turfId, slotIds, date } = req.body;

    if (!turfId || !slotIds || slotIds.length === 0 || !date) {
      return apiResponse(res, 400, false, 'Missing turfId, slotIds, or date parameters');
    }

    const turf = await Turf.findById(turfId);
    if (!turf) {
      return apiResponse(res, 404, false, 'Turf not found');
    }

    if (turf.status !== 'approved') {
      return apiResponse(res, 400, false, 'This turf is currently unavailable for booking');
    }

    const slots = await Slot.find({
      _id: { $in: slotIds },
      turf: turfId,
      date: date,
      isBooked: false
    });

    if (slots.length !== slotIds.length) {
      return apiResponse(res, 400, false, 'One or more selected slots are unavailable or already booked');
    }

    const totalPrice = slots.reduce((sum, slot) => sum + slot.price, 0);
    const advancePaidRequired = Math.round(totalPrice * 0.20);
    const balanceRemaining = totalPrice - advancePaidRequired;

    const booking = await Booking.create({
      customer: req.user._id,
      turf: turfId,
      slots: slotIds,
      date,
      totalPrice,
      advancePaid: 0,
      balanceAmount: totalPrice,
      paymentStatus: 'pending',
      bookingStatus: 'pending'
    });

    const options = {
      amount: advancePaidRequired * 100,
      currency: 'INR',
      receipt: 'receipt_booking_' + booking._id.toString().substring(0, 10),
      notes: {
        bookingId: booking._id.toString(),
        customerId: req.user._id.toString(),
        paymentType: 'advance'
      }
    };

    const razorpayOrder = await razorpayInstance.orders.create(options);

    await Payment.create({
      booking: booking._id,
      razorpayOrderId: razorpayOrder.id,
      amount: advancePaidRequired,
      paymentType: 'advance',
      status: 'created'
    });

    return apiResponse(res, 201, true, 'Booking order initialized successfully', {
      booking,
      razorpayOrder,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder_id'
    });
  } catch (error) {
    next(error);
  }
};

exports.getBookings = async (req, res, next) => {
  try {
    let query = {};

    if (req.user.role === 'customer') {
      query.customer = req.user._id;
    } else if (req.user.role === 'owner') {
      const myTurfs = await Turf.find({ owner: req.user._id }).select('_id');
      const turfIds = myTurfs.map((t) => t._id);
      query.turf = { $in: turfIds };
    }

    const bookings = await Booking.find(query)
      .populate('customer', 'name email phone')
      .populate('turf', 'name city district address images')
      .populate('slots', 'startTime endTime price')
      .sort({ createdAt: -1 });

    return apiResponse(res, 200, true, 'Bookings retrieved successfully', bookings);
  } catch (error) {
    next(error);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['confirmed', 'cancelled'].includes(status)) {
      return apiResponse(res, 400, false, 'Invalid booking status target');
    }

    const booking = await Booking.findById(req.params.id).populate('turf');
    if (!booking) {
      return apiResponse(res, 404, false, 'Booking record not found');
    }

    if (booking.turf.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return apiResponse(res, 403, false, 'Unauthorized to update this booking status');
    }

    booking.bookingStatus = status;

    if (status === 'cancelled') {
      await Slot.updateMany(
        { _id: { $in: booking.slots } },
        { $set: { isBooked: false, booking: null } }
      );
      booking.paymentStatus = 'pending';
    }

    await booking.save();
    return apiResponse(res, 200, true, 'Booking marked as ' + status + ' successfully', booking);
  } catch (error) {
    next(error);
  }
};

exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('slots')
      .populate({
        path: 'turf',
        populate: { path: 'owner', select: 'name email phone' }
      });

    if (!booking) {
      return apiResponse(res, 404, false, 'Booking not found');
    }

    if (booking.customer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return apiResponse(res, 403, false, 'Unauthorized to cancel this booking');
    }

    if (booking.bookingStatus === 'cancelled') {
      return apiResponse(res, 400, false, 'Booking is already cancelled');
    }

    const { reason } = req.body;
    let refundedAmount = 0;
    let isEligibleForRefund = false;

    if (booking.slots.length > 0) {
      const firstSlot = booking.slots[0];
      const slotDateTimeStr = booking.date + 'T' + firstSlot.startTime + ':00';
      const slotTime = new Date(slotDateTimeStr);
      const currentTime = new Date();
      const timeDiffMs = slotTime - currentTime;
      const hoursDiff = timeDiffMs / (1000 * 60 * 60);

      if (req.user.role === 'admin') {
        isEligibleForRefund = true;
      } else if (hoursDiff >= 4) {
        isEligibleForRefund = true;
      }
    }

    if (isEligibleForRefund && booking.advancePaid > 0) {
      const advancePayment = await Payment.findOne({
        booking: booking._id,
        paymentType: 'advance',
        status: 'captured'
      });

      if (advancePayment && advancePayment.razorpayPaymentId) {
        try {
          const refund = await razorpayInstance.payments.refund(
            advancePayment.razorpayPaymentId,
            { amount: booking.advancePaid * 100 }
          );

          advancePayment.status = 'refunded';
          advancePayment.refundId = refund.id;
          advancePayment.refundAmount = booking.advancePaid;
          await advancePayment.save();

          refundedAmount = booking.advancePaid;
        } catch (refundErr) {
          console.error('Refund failed:', refundErr.message);
        }
      }
    }

    booking.bookingStatus = 'cancelled';
    booking.cancellationReason = reason || null;
    booking.cancelledAt = new Date();
    booking.refundedAmount = refundedAmount;

    if (refundedAmount > 0) {
      booking.paymentStatus = 'refunded';
    } else if (booking.advancePaid > 0) {
      booking.paymentStatus = 'pending';
    }

    await Slot.updateMany(
      { _id: { $in: booking.slots } },
      { $set: { isBooked: false, booking: null } }
    );

    await booking.save();

    // Send cancellation email to customer
    let customerMsg = 'Your booking on ' + booking.date + ' has been successfully cancelled.';
    if (refundedAmount > 0) {
      customerMsg += ' A full refund of Rs.' + refundedAmount + ' has been initiated.';
    } else if (booking.advancePaid > 0) {
      customerMsg += ' As the cancellation was made within 4 hours of the slot time, the advance amount is non-refundable.';
    } else {
      customerMsg += ' No payment was made for this booking.';
    }

    await sendEmail({
      to: req.user.email,
      subject: 'TurfBook TN - Booking Cancelled',
      text: customerMsg,
      recipientId: req.user._id
    });

    // Send notification to turf owner
    if (booking.turf && booking.turf.owner) {
      const owner = booking.turf.owner;
      const ownerMsg = 'Booking cancelled by customer for ' + (booking.turf.name || 'your turf') +
        ' on ' + booking.date + '. Reason: ' + (reason || 'Not specified') +
        '. Refund status: ' + (refundedAmount > 0 ? 'Refunded Rs.' + refundedAmount : 'No refund issued');

      await sendEmail({
        to: owner.email,
        subject: 'TurfBook TN - Booking Cancelled by Customer',
        text: ownerMsg,
        recipientId: owner._id
      });

      if (owner.phone) {
        await sendSMS({
          to: owner.phone,
          message: 'TurfBook TN: Booking cancelled for ' + (booking.turf.name || 'your turf') +
            ' on ' + booking.date + '. Check your dashboard for details.',
          recipientId: owner._id
        });
      }
    }

    return apiResponse(res, 200, true, 'Booking cancelled successfully. Slots have been released.', booking);
  } catch (error) {
    next(error);
  }
};
