/**
 * Format numbers to standard Indian Rupee currency representation (e.g. ₹1,200)
 * @param {Number} value - Price amount
 * @returns {String} Formatted string
 */
export const formatCurrency = (value) => {
  const number = Number(value) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(number);
};
