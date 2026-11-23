// Formats integer paise into Indian Rupee string (e.g. 24990 -> ₹249.90).
// Uses integer arithmetic to avoid floating point precision issues.
// Comma grouping by three digits is correct below 1,00,000, guaranteed by the quantity cap.
export function formatPaise(paise) {
  const integerPaise = Math.round(Number(paise) || 0);
  const rupees = Math.floor(integerPaise / 100);
  const remainder = integerPaise % 100;
  const paiseString = String(remainder).padStart(2, '0');

  const rupeeString = String(rupees).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `₹${rupeeString}.${paiseString}`;
}
