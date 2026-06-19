const Slot = require('../models/Slot');
const Turf = require('../models/Turf');
const hasSlotConflict = require('../utils/slotConflict');
const apiResponse = require('../utils/apiResponse');

/**
 * Bulk create slots for a Turf on a specific date
 * POST /api/slots
 * Private (Owner)
 */
exports.createSlot = async (req, res, next) => {
  try {
    const { turfId, date, slots } = req.body; // slots: [{ startTime, endTime, price }]

    if (!turfId || !date || !slots) {
      return apiResponse(res, 400, false, 'Missing turfId, date, or slots parameter');
    }

    const turf = await Turf.findById(turfId);
    if (!turf) {
      return apiResponse(res, 404, false, 'Turf not found');
    }

    // Validate ownership
    if (turf.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return apiResponse(res, 403, false, 'Unauthorized to manage slots for this turf.');
    }

    if (!Array.isArray(slots) || slots.length === 0) {
      return apiResponse(res, 400, false, 'Slots parameter must be a non-empty array');
    }

    // Retrieve existing slots for overlap comparison
    const existingSlots = await Slot.find({ turf: turfId, date });

    const slotsToCreate = [];
    const conflicts = [];

    for (const item of slots) {
      const { startTime, endTime, price } = item;

      // Verify bounds
      if (!startTime || !endTime || !price) {
        return apiResponse(res, 400, false, 'Every slot must include startTime, endTime, and price');
      }

      // Check overlap inside incoming batch and database
      const isOverlapping = hasSlotConflict(
        startTime, 
        endTime, 
        [...existingSlots, ...slotsToCreate]
      );

      if (isOverlapping) {
        conflicts.push(`${startTime}-${endTime}`);
      } else {
        slotsToCreate.push({
          turf: turfId,
          date,
          startTime,
          endTime,
          price: Number(price)
        });
      }
    }

    if (conflicts.length > 0) {
      return apiResponse(
        res, 
        400, 
        false, 
        `Conflict detected for time slot(s): ${conflicts.join(', ')}. No slots were created.`,
        { conflicts }
      );
    }

    const createdSlots = await Slot.insertMany(slotsToCreate);
    return apiResponse(res, 201, true, 'Slots created successfully', createdSlots);
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch slots for a Turf on a specific date
 * GET /api/slots
 * Public
 */
exports.getSlots = async (req, res, next) => {
  try {
    const { turfId, date } = req.query;

    if (!turfId || !date) {
      return apiResponse(res, 400, false, 'Missing turfId or date parameter');
    }

    const slots = await Slot.find({ turf: turfId, date }).sort({ startTime: 1 });
    return apiResponse(res, 200, true, 'Slots retrieved successfully', slots);
  } catch (error) {
    next(error);
  }
};

/**
 * Edit a specific slot
 * PUT /api/slots/:id
 * Private (Owner)
 */
exports.updateSlot = async (req, res, next) => {
  try {
    const slot = await Slot.findById(req.params.id).populate('turf');
    if (!slot) {
      return apiResponse(res, 404, false, 'Slot not found');
    }

    // Validate ownership
    if (slot.turf.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return apiResponse(res, 403, false, 'Unauthorized to modify this slot.');
    }

    if (slot.isBooked) {
      return apiResponse(res, 400, false, 'Cannot modify a slot that is already booked.');
    }

    const { price, startTime, endTime } = req.body;

    if (price) slot.price = Number(price);

    if (startTime || endTime) {
      const newStart = startTime || slot.startTime;
      const newEnd = endTime || slot.endTime;

      const otherSlots = await Slot.find({
        turf: slot.turf._id,
        date: slot.date,
        _id: { $ne: slot._id }
      });

      if (hasSlotConflict(newStart, newEnd, otherSlots)) {
        return apiResponse(res, 400, false, 'The updated timings overlap with an existing slot.');
      }

      slot.startTime = newStart;
      slot.endTime = newEnd;
    }

    await slot.save();
    return apiResponse(res, 200, true, 'Slot updated successfully', slot);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an unbooked slot
 * DELETE /api/slots/:id
 * Private (Owner)
 */
exports.deleteSlot = async (req, res, next) => {
  try {
    const slot = await Slot.findById(req.params.id).populate('turf');
    if (!slot) {
      return apiResponse(res, 404, false, 'Slot not found');
    }

    // Check ownership
    if (slot.turf.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return apiResponse(res, 403, false, 'Unauthorized to delete this slot.');
    }

    if (slot.isBooked) {
      return apiResponse(res, 400, false, 'Safety Warning: Cannot delete a slot that is already booked.');
    }

    await Slot.findByIdAndDelete(req.params.id);
    return apiResponse(res, 200, true, 'Slot deleted successfully');
  } catch (error) {
    next(error);
  }
};
