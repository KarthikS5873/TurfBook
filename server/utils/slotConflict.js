/**
 * Check if a proposed time slot overlaps with existing time slots
 * Time values should be in HH:MM 24-hour format
 * 
 * @param {String} newStart - Proposed slot start time (e.g. "09:00")
 * @param {String} newEnd - Proposed slot end time (e.g. "10:30")
 * @param {Array} existingSlots - List of existing slots for that turf and date
 * @returns {Boolean} True if overlap exists, false otherwise
 */
const hasSlotConflict = (newStart, newEnd, existingSlots) => {
  const toMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const newStartMin = toMinutes(newStart);
  const newEndMin = toMinutes(newEnd);

  // Validate bounds
  if (newStartMin >= newEndMin) {
    return true; // Invalid interval is treated as a conflict
  }

  for (const slot of existingSlots) {
    const slotStartMin = toMinutes(slot.startTime);
    const slotEndMin = toMinutes(slot.endTime);

    // Overlap math: (StartA < EndB) && (EndA > StartB)
    if (newStartMin < slotEndMin && newEndMin > slotStartMin) {
      return true;
    }
  }

  return false;
};

module.exports = hasSlotConflict;
