const crypto = require('crypto');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Slot = require('../models/Slot');
const Turf = require('../models/Turf');
const User = require('../models/User');
const { razorpayInstance } = require('../config/razorpay');
const sendEmail = require('../utils/sendEmail');
const apiResponse = require('../utils/apiResponse');

/**
 * Create a Razorpay Order for paying the remaining balance
 * POST /api/payments/balance
 * Private (Customer)
 */
exports.createBalanceOrder = async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId).populate('turf');
    if (!booking) {
      return apiResponse(res, 404, false, 'Booking record not found');
    }

    if (booking.balanceAmount <= 0) {
      return apiResponse(res, 400, false, 'Remaining balance is already fully paid');
    }

    const balanceAmount = booking.balanceAmount;

    // Create Razorpay Order
    const options = {
      amount: balanceAmount * 100, // standard subunit paise
      currency: 'INR',
      receipt: `receipt_bal_${booking._id.toString().substring(0, 10)}`,
      notes: {
        bookingId: booking._id.toString(),
        paymentType: 'balance'
      }
    };

    const razorpayOrder = await razorpayInstance.orders.create(options);

    // Save payment log
    await Payment.create({
      booking: booking._id,
      razorpayOrderId: razorpayOrder.id,
      amount: balanceAmount,
      paymentType: 'balance',
      status: 'created'
    });

    return apiResponse(res, 200, true, 'Balance checkout order created', {
      razorpayOrder,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder_id'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify Razorpay payment signature and confirm booking
 * POST /api/payments/verify
 * Private (Customer)
 */
exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id) {
      return apiResponse(res, 400, false, 'Missing payment parameters');
    }

    // Find the corresponding Payment log
    const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
    if (!payment) {
      return apiResponse(res, 404, false, 'Payment log not found');
    }

    let isSignatureValid = false;

    // Support mock verification for dev test orders
    if (razorpay_order_id.startsWith('order_mock_')) {
      isSignatureValid = true;
    } else {
      // Perform strict HMAC SHA256 cryptographic check
      const secret = process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret_key';
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(body.toString())
        .digest('hex');

      isSignatureValid = expectedSignature === razorpay_signature;
    }

    if (!isSignatureValid) {
      payment.status = 'failed';
      await payment.save();
      return apiResponse(res, 400, false, 'Payment verification failed. Cryptographic signature invalid.');
    }

    // Update payment parameters
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature || 'mock_sig';
    payment.status = 'captured';
    await payment.save();

    // Load booking record
    const booking = await Booking.findById(payment.booking)
      .populate('customer')
      .populate('turf')
      .populate('slots');

    if (!booking) {
      return apiResponse(res, 404, false, 'Associated booking record not found');
    }

    // Update booking financial totals based on paymentType
    if (payment.paymentType === 'advance') {
      booking.advancePaid = payment.amount;
      booking.balanceAmount = booking.totalPrice - payment.amount;
      booking.paymentStatus = 'partially_paid';
      booking.bookingStatus = 'confirmed';
    } else if (payment.paymentType === 'balance') {
      booking.advancePaid += payment.amount;
      booking.balanceAmount = 0;
      booking.paymentStatus = 'paid';
    }

    await booking.save();

    // Lock the turf slots by marking them as booked
    await Slot.updateMany(
      { _id: { $in: booking.slots } },
      { $set: { isBooked: true, booking: booking._id } }
    );

    // Fetch Turf Owner email details
    const owner = await User.findById(booking.turf.owner);
    const ownerEmail = owner ? owner.email : null;

    // Send confirmation email to Customer
    await sendEmail({
      to: booking.customer.email,
      subject: `TurfBook TN - Booking Confirmed at ${booking.turf.name}!`,
      text: `Hi ${booking.customer.name},\n\nYour booking at ${booking.turf.name} for ${booking.date} is confirmed.\nTotal: ₹${booking.totalPrice}\nPaid: ₹${booking.advancePaid}\nRemaining: ₹${booking.balanceAmount}\n\nThank you for booking with TurfBook TN!`,
      html: `
        <h3>Booking Confirmed!</h3>
        <p>Hi ${booking.customer.name},</p>
        <p>Your booking at <strong>${booking.turf.name}</strong> for <strong>${booking.date}</strong> is confirmed.</p>
        <ul>
          <li>Total Price: ₹${booking.totalPrice}</li>
          <li>Amount Paid: ₹${booking.advancePaid}</li>
          <li>Balance Due: ₹${booking.balanceAmount}</li>
        </ul>
        <p>Thank you for using TurfBook TN!</p>
      `,
      recipientId: booking.customer._id
    });

    // Send notification email to Turf Owner
    if (ownerEmail) {
      await sendEmail({
        to: ownerEmail,
        subject: `TurfBook TN - New Booking Received for ${booking.turf.name}`,
        text: `Hi ${owner.name},\n\nYou have received a new booking for ${booking.turf.name} on ${booking.date}.\nCustomer: ${booking.customer.name} (${booking.customer.phone})\nTotal: ₹${booking.totalPrice}\nAdvance Paid: ₹${booking.advancePaid}\nBalance Due: ₹${booking.balanceAmount}`,
        recipientId: owner._id
      });
    }

    return apiResponse(res, 200, true, 'Payment verified and booking confirmed', booking);
  } catch (error) {
    next(error);
  }
};

/**
 * Webhook handler for external gateway alerts
 * POST /api/payments/webhook
 */
exports.webhook = async (req, res, next) => {
  try {
    // Return OK to acknowledge receiving Razorpay webhook events
    res.status(200).send({ status: 'ok' });
  } catch (error) {
    next(error);
  }
};
