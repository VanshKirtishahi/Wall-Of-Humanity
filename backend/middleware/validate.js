const { body, validationResult } = require('express-validator');

const validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
  
  body('email')
    .trim()
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail({
      gmail_remove_dots: false,
      gmail_remove_subaddress: false,
      all_lowercase: true
    }),
  
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
    .matches(/\d/).withMessage('Password must contain at least one number')
    .matches(/[a-zA-Z]/).withMessage('Password must contain at least one letter'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: errors.array()[0].msg,
        errors: errors.array() 
      });
    }
    next();
  }
];

const validateLogin = [
  body('email')
    .trim()
    .isEmail().withMessage('Please enter a valid email')
    .customSanitizer(value => value.toLowerCase()),
  
  body('password')
    .notEmpty().withMessage('Password is required'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: errors.array()[0].msg,
        errors: errors.array() 
      });
    }
    next();
  }
];

module.exports = {
  validateRegister,
  validateLogin,
}; 