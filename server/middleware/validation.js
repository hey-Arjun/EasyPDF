const { body, validationResult } = require('express-validator');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Login validation
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  validate
];

// Signup validation
const validateSignup = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  validate
];

// PDF compression validation
const validateCompression = [
  body('compressionLevel')
    .optional()
    .isIn(['extreme', 'recommended', 'less'])
    .withMessage('Compression level must be extreme, recommended, or less'),
  validate
];

// Page range validation
const validatePageRange = [
  body('pageRanges')
    .optional()
    .matches(/^[\d\-\s,]+$/)
    .withMessage('Page ranges must contain only numbers, hyphens, commas, and spaces'),
  validate
];

// OCR validation
const validateOcr = [
  body('language')
    .optional()
    .isLength({ min: 2, max: 5 })
    .withMessage('Language code must be between 2 and 5 characters'),
  validate
];

module.exports = {
  validate,
  validateLogin,
  validateSignup,
  validateCompression,
  validatePageRange,
  validateOcr
}; 