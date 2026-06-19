const Turf = require('../models/Turf');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const apiResponse = require('../utils/apiResponse');

const getTokenUser = async (req) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_turf_booking_key_999');
      return await User.findById(decoded.id).select('-password');
    } catch (err) {
      return null;
    }
  }
  return null;
};

/**
 * Create a Turf listing
 * POST /api/turfs
 * Private (Owner)
 */
exports.createTurf = async (req, res, next) => {
  try {
    const { name, description, district, city, address, pricePerHour, amenities, coordinates } = req.body;

    const parsedAmenities = Array.isArray(amenities) 
      ? amenities 
      : (amenities ? JSON.parse(amenities) : []);

    const parsedCoordinates = typeof coordinates === 'string' 
      ? JSON.parse(coordinates) 
      : coordinates;

    const turf = await Turf.create({
      name,
      description,
      district,
      city,
      address,
      pricePerHour: Number(pricePerHour),
      amenities: parsedAmenities,
      coordinates: parsedCoordinates,
      owner: req.user._id,
      status: 'pending'
    });

    return apiResponse(res, 201, true, 'Turf registration submitted. Awaiting admin approval.', turf);
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch list of Turfs with filter parameters
 * GET /api/turfs
 * Public - returns approved turfs; admins see all turfs
 */
exports.getTurfs = async (req, res, next) => {
  try {
    const { district, city, search, minPrice, maxPrice } = req.query;
    const query = {};

    const user = await getTokenUser(req);
    if (!user || user.role !== 'admin') {
      query.status = 'approved';
    }

    if (district) {
      query.district = { $regex: new RegExp(`^${district}$`, 'i') };
    }
    if (city) {
      query.city = { $regex: new RegExp(`^${city}$`, 'i') };
    }
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (minPrice || maxPrice) {
      query.pricePerHour = {};
      if (minPrice) query.pricePerHour.$gte = Number(minPrice);
      if (maxPrice) query.pricePerHour.$lte = Number(maxPrice);
    }

    const turfs = await Turf.find(query).populate('owner', 'name email phone');
    return apiResponse(res, 200, true, 'Turfs retrieved successfully', turfs);
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch all turfs (admin only - bypasses status filter)
 * GET /api/turfs/all
 * Private (Admin)
 */
exports.getAllTurfs = async (req, res, next) => {
  try {
    const { status, district, city, search, minPrice, maxPrice, owner } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }
    if (owner) {
      query.owner = owner;
    }
    if (district) {
      query.district = { $regex: new RegExp(`^${district}$`, 'i') };
    }
    if (city) {
      query.city = { $regex: new RegExp(`^${city}$`, 'i') };
    }
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (minPrice || maxPrice) {
      query.pricePerHour = {};
      if (minPrice) query.pricePerHour.$gte = Number(minPrice);
      if (maxPrice) query.pricePerHour.$lte = Number(maxPrice);
    }

    const turfs = await Turf.find(query).populate('owner', 'name email phone');
    return apiResponse(res, 200, true, 'All turfs retrieved successfully', turfs);
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch current owner's turfs (bypasses status filter for own turfs)
 * GET /api/turfs/my
 * Private (Owner)
 */
exports.getMyTurfs = async (req, res, next) => {
  try {
    const turfs = await Turf.find({ owner: req.user._id }).populate('owner', 'name email phone');
    return apiResponse(res, 200, true, 'Your turfs retrieved successfully', turfs);
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch a single Turf by ID
 * GET /api/turfs/:id
 * Public
 */
exports.getTurf = async (req, res, next) => {
  try {
    const turf = await Turf.findById(req.params.id).populate('owner', 'name email phone');
    if (!turf) {
      return apiResponse(res, 404, false, 'Turf not found');
    }
    return apiResponse(res, 200, true, 'Turf details retrieved', turf);
  } catch (error) {
    next(error);
  }
};

/**
 * Update Turf Details
 * PUT /api/turfs/:id
 * Private (Owner)
 */
exports.updateTurf = async (req, res, next) => {
  try {
    let turf = await Turf.findById(req.params.id);

    if (!turf) {
      return apiResponse(res, 404, false, 'Turf not found');
    }

    // Owner validation check (Admins can bypass)
    if (turf.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return apiResponse(res, 403, false, 'Unauthorized: You do not own this turf.');
    }

    const { name, description, district, city, address, pricePerHour, amenities, coordinates } = req.body;

    if (name) turf.name = name;
    if (description) turf.description = description;
    if (district) turf.district = district;
    if (city) turf.city = city;
    if (address) turf.address = address;
    if (pricePerHour) turf.pricePerHour = Number(pricePerHour);
    
    if (amenities) {
      turf.amenities = Array.isArray(amenities) ? amenities : JSON.parse(amenities);
    }
    if (coordinates) {
      turf.coordinates = typeof coordinates === 'string' ? JSON.parse(coordinates) : coordinates;
    }

    // If an owner updates the turf, push it back to pending approval to prevent unauthorized changes
    if (req.user.role === 'owner') {
      turf.status = 'pending';
    }

    await turf.save();

    return apiResponse(res, 200, true, 'Turf details updated successfully. Pending re-approval.', turf);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a Turf listing
 * DELETE /api/turfs/:id
 * Private (Owner/Admin)
 */
exports.deleteTurf = async (req, res, next) => {
  try {
    const turf = await Turf.findById(req.params.id);
    if (!turf) {
      return apiResponse(res, 404, false, 'Turf not found');
    }

    // Check ownership
    if (turf.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return apiResponse(res, 403, false, 'Unauthorized to delete this turf');
    }

    await Turf.findByIdAndDelete(req.params.id);
    return apiResponse(res, 200, true, 'Turf listing deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Upload Turf Photos
 * POST /api/turfs/:id/photos
 * Private (Owner)
 */
exports.uploadPhotos = async (req, res, next) => {
  try {
    const turf = await Turf.findById(req.params.id);
    if (!turf) {
      return apiResponse(res, 404, false, 'Turf not found');
    }

    if (turf.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return apiResponse(res, 403, false, 'Unauthorized to upload photos for this turf');
    }

    if (!req.files || req.files.length === 0) {
      return apiResponse(res, 400, false, 'Please upload at least one image');
    }

    // Capture Cloudinary URL or local fallback static route
    const newPhotos = req.files.map((file) => {
      // Cloudinary storage uploads populate file.path
      if (file.path && !file.path.startsWith('d:\\') && !file.path.startsWith('/')) {
        return file.path;
      }
      // Multer local storage backup uploads compile local static router URL
      const hostUrl = `${req.protocol}://${req.get('host')}`;
      return `${hostUrl}/uploads/${file.filename}`;
    });

    turf.images.push(...newPhotos);
    await turf.save();

    return apiResponse(res, 200, true, 'Photos uploaded successfully', turf);
  } catch (error) {
    next(error);
  }
};
