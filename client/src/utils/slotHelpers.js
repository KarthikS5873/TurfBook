/**
 * Format 24h clock string into 12h AM/PM (e.g., "18:30" to "06:30 PM")
 * @param {String} timeStr - Time string in HH:MM format
 * @returns {String} Formatted string
 */
export const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const [hoursStr, minutesStr] = timeStr.split(':');
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);

  if (isNaN(hours) || isNaN(minutes)) return timeStr;

  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;

  return `${displayHours}:${displayMinutes} ${ampm}`;
};

/**
 * Format full slot duration (e.g., "06:00 AM - 07:00 AM")
 * @param {String} start - Start HH:MM
 * @param {String} end - End HH:MM
 * @returns {String} Duration string
 */
export const formatSlotRange = (start, end) => {
  return `${formatTime(start)} - ${formatTime(end)}`;
};

/**
 * Compute the slot duration in minutes
 * @param {String} start - Start HH:MM
 * @param {String} end - End HH:MM
 * @returns {Number} Duration in minutes
 */
export const getSlotDuration = (start, end) => {
  const [h1, m1] = start.split(':').map(Number);
  const [h2, m2] = end.split(':').map(Number);
  
  const min1 = h1 * 60 + m1;
  const min2 = h2 * 60 + m2;
  
  return min2 - min1;
};
