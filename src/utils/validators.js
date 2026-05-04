const { body, param, query } = require('express-validator');

// Regex patterns
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{10,}$/;
const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/; // huruf, angka, underscore, 3-20 karakter
const phoneRegex = /^\+?[\d\s-]{10,}$/; // basic phone validation
const descriptionRegex = /^.{0,500}$/; // opsional, maks 500 karakter

// Validation rules
const userRegistrationValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name must be at most 100 characters'),
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .matches(usernameRegex).withMessage('Username must be 3-20 characters and contain only letters, numbers, and underscores'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .matches(emailRegex).withMessage('Invalid email format'),
  body('phone')
    .optional()
    .trim()
    .matches(phoneRegex).withMessage('Invalid phone format'),
  body('password')
    .trim()
    .notEmpty().withMessage('Password is required')
    .matches(passwordRegex).withMessage('Password must be at least 10 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
];

const userUpdateValidation = [
  body('id')
    .isInt().withMessage('User ID must be an integer'),
  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Name must be at most 100 characters'),
  body('username')
    .optional()
    .trim()
    .matches(usernameRegex).withMessage('Username must be 3-20 characters and contain only letters, numbers, and underscores'),
  body('email')
    .optional()
    .trim()
    .matches(emailRegex).withMessage('Invalid email format'),
  body('phone')
    .optional()
    .trim()
    .matches(phoneRegex).withMessage('Invalid phone format'),
  body('password')
    .optional()
    .trim()
    .matches(passwordRegex).withMessage('Password must be at least 10 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('balance')
    .optional()
    .isInt({ min: 0 }).withMessage('Balance must be a non-negative integer'),
];

const transactionCreationValidation = [
  body('user_id')
    .isInt().withMessage('User ID must be an integer'),
  body('item_id')
    .isInt().withMessage('Item ID must be an integer'),
  body('quantity')
    .isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  body('description')
    .optional()
    .trim()
    .matches(descriptionRegex).withMessage('Description must be at most 500 characters'),
];

const transactionIdValidation = [
  param('id')
    .isInt().withMessage('Transaction ID must be an integer'),
];

const validate = (req, res, next) => {
  const errors = require('express-validator').validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map(err => err.msg);
    return res.status(400).json({
      success: false,
      message: messages.join('. '),
      payload: null,
    });
  }
  next();
};

module.exports = {
  emailRegex,
  passwordRegex,
  usernameRegex,
  phoneRegex,
  descriptionRegex,
  userRegistrationValidation,
  userUpdateValidation,
  transactionCreationValidation,
  transactionIdValidation,
  validate,
};