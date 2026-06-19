/**
 * Format date string into "DD MMM YYYY" (e.g. 15 Aug 2026)
 * @param {String|Date} dateStr - Input date representation
 * @returns {String} Formatted representation
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  // Support YYYY-MM-DD string splits to prevent timezone shift errors
  let date;
  if (typeof dateStr === 'string' && dateStr.includes('-')) {
    const [year, month, day] = dateStr.split('-');
    date = new Date(year, month - 1, day);
  } else {
    date = new Date(dateStr);
  }

  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

/**
 * Get weekday string (e.g. Saturday)
 * @param {String|Date} dateStr - Date representation
 * @returns {String} Weekday
 */
export const formatDayOfWeek = (dateStr) => {
  if (!dateStr) return '';
  let date;
  if (typeof dateStr === 'string' && dateStr.includes('-')) {
    const [year, month, day] = dateStr.split('-');
    date = new Date(year, month - 1, day);
  } else {
    date = new Date(dateStr);
  }

  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-IN', { weekday: 'long' });
};
