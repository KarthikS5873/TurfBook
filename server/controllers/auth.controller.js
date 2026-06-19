const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const apiResponse = require('../utils/apiResponse');

/**
 * Register User (Customer or Owner)
 * POST /api/auth/register
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Validate role
    if (role && !['customer', 'owner'].includes(role)) {
      return apiResponse(res, 400, false, 'Invalid user role specified');
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return apiResponse(res, 400, false, 'Email is already registered');
    }

    // Create user (owner isApproved will default to false, customer to true)
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role || 'customer'
    });

    const token = generateToken(user._id);

    // If owner, send notification that their registration is pending
    if (user.role === 'owner') {
      await sendEmail({
        to: user.email,
        subject: 'TurfBook TN - Owner Account Under Review',
        text: `Hello ${user.name},\n\nThank you for registering as a Turf Owner on TurfBook TN. Your profile is currently under review by our administrator team. We will notify you once your account has been approved.`,
        html: `<h3>Welcome ${user.name}!</h3><p>Thank you for registering as a Turf Owner on TurfBook TN. Your profile is currently under review by our administrator team. We will notify you once your account has been approved.</p>`,
        recipientId: user._id
      });
    }

    // Exclude password from response
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isApproved: user.isApproved,
      phone: user.phone
    };

    return apiResponse(res, 201, true, 'User registered successfully', {
      user: userResponse,
      token
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login User
 * POST /api/auth/login
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return apiResponse(res, 400, false, 'Please provide email and password');
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return apiResponse(res, 401, false, 'Invalid credentials');
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return apiResponse(res, 401, false, 'Invalid credentials');
    }

    // Generate token
    const token = generateToken(user._id);

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isApproved: user.isApproved,
      phone: user.phone
    };

    return apiResponse(res, 200, true, 'Logged in successfully', {
      user: userResponse,
      token
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout User
 * POST /api/auth/logout
 */
exports.logout = async (req, res, next) => {
  try {
    return apiResponse(res, 200, true, 'Logged out successfully. Please clear token from client storage.');
  } catch (error) {
    next(error);
  }
};

/**
 * Forgot Password
 * POST /api/auth/forgot-password
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      // Return 200 even if user doesn't exist for security reasons
      return apiResponse(res, 200, true, 'If that email is registered, we have sent a reset code.');
    }

    // Generate mock reset link (in a real system, you would save a token to the user model)
    const resetUrl = `http://localhost:5173/reset-password?email=${email}&token=mock_reset_token_${Date.now()}`;

    await sendEmail({
      to: user.email,
      subject: 'TurfBook TN - Password Reset Request',
      text: `Hello ${user.name},\n\nYou requested a password reset. Please click on the link below to reset your password:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`,
      html: `<h3>Password Reset Request</h3><p>Hello ${user.name},</p><p>You requested a password reset. Please click the link below to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you did not request this, please ignore this email.</p>`,
      recipientId: user._id
    });

    return apiResponse(res, 200, true, 'If that email is registered, we have sent a reset code.');
  } catch (error) {
    next(error);
  }
};
