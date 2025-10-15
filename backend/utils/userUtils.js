const crypto = require('crypto');

/**
 * Generate a unique 10-digit cryptographic MMID
 * @returns {string} 10-digit MMID
 */
function generateMMID() {
  // Generate a random 10-digit number
  const randomBytes = crypto.randomBytes(5);
  const mmid = parseInt(randomBytes.toString('hex'), 16).toString().slice(0, 10);
  
  // Ensure it's exactly 10 digits
  return mmid.padStart(10, '0');
}

/**
 * Generate username based on user's name and MMID
 * @param {string} firstName - User's first name
 * @param {string} lastName - User's last name
 * @param {string} mmid - User's MMID
 * @returns {string} Generated username
 */
function generateUsername(firstName, lastName, mmid) {
  const cleanFirstName = firstName.toLowerCase().replace(/[^a-z]/g, '');
  const cleanLastName = lastName.toLowerCase().replace(/[^a-z]/g, '');
  
  // Create base username
  let baseUsername = `${cleanFirstName}${cleanLastName}`;
  
  // If too long, truncate
  if (baseUsername.length > 8) {
    baseUsername = baseUsername.substring(0, 8);
  }
  
  // Add MMID suffix
  return `${baseUsername}_${mmid}`;
}

/**
 * Generate software login email
 * @param {string} username - Generated username
 * @param {string} mmid - User's MMID
 * @returns {string} Software login email
 */
function generateSoftwareLoginEmail(username, mmid) {
  return `${username}_${mmid}@trucomm.com`;
}

/**
 * Generate a secure password
 * @param {number} length - Password length (default: 12)
 * @returns {string} Generated password
 */
function generateSecurePassword(length = 12) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  return password;
}

/**
 * Calculate GST amount (18%)
 * @param {number} amount - Base amount
 * @returns {number} GST amount
 */
function calculateGST(amount) {
  return Math.round((amount * 0.18) * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculate coupon discount
 * @param {Object} coupon - Coupon object
 * @param {number} amount - Base amount
 * @returns {number} Discount amount
 */
function calculateCouponDiscount(coupon, amount) {
  if (!coupon || !coupon.isActive) return 0;
  
  let discount = 0;
  
  if (coupon.discountType === 'PERCENTAGE') {
    discount = (amount * coupon.discountValue) / 100;
    
    // Apply maximum discount limit if set
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else if (coupon.discountType === 'FIXED') {
    discount = coupon.discountValue;
  }
  
  // Ensure discount doesn't exceed the amount
  return Math.min(discount, amount);
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate work email format (should be company email)
 * @param {string} email - Work email to validate
 * @returns {boolean} Is valid work email
 */
function isValidWorkEmail(email) {
  if (!isValidEmail(email)) return false;
  
  // Check if it's a company email (not common personal email providers)
  const personalDomains = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 
    'icloud.com', 'aol.com', 'protonmail.com'
  ];
  
  const domain = email.split('@')[1].toLowerCase();
  return !personalDomains.includes(domain);
}

module.exports = {
  generateMMID,
  generateUsername,
  generateSoftwareLoginEmail,
  generateSecurePassword,
  calculateGST,
  calculateCouponDiscount,
  isValidEmail,
  isValidWorkEmail
};
