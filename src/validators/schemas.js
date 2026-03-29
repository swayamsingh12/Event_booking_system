const { body, param } = require('express-validator');

const userValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name must be under 100 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address'),
];

const eventValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 200 }).withMessage('Title must be under 200 characters'),

  body('description')
    .optional()
    .trim(),

  body('date')
    .notEmpty().withMessage('Date is required')
    .isISO8601().withMessage('Date must be a valid ISO8601 format (YYYY-MM-DD HH:MM:SS)')
    .custom(value => {
      if (new Date(value) <= new Date()) {
        throw new Error('Event date must be in the future');
      }
      return true;
    }),

  body('total_capacity')
    .notEmpty().withMessage('Total capacity is required')
    .isInt({ min: 1 }).withMessage('Capacity must be a positive number'),
];

const bookingValidation = [
  body('user_id')
    .notEmpty().withMessage('user_id is required')
    .isInt({ min: 1 }).withMessage('user_id must be a positive integer'),

  body('event_id')
    .notEmpty().withMessage('event_id is required')
    .isInt({ min: 1 }).withMessage('event_id must be a positive integer'),

  body('tickets_count')
    .optional()
    .isInt({ min: 1 }).withMessage('tickets_count must be at least 1'),
];

const userBookingsValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('User ID must be a positive integer'),
];

const attendanceValidation = [
  body('booking_code')
    .trim()
    .notEmpty().withMessage('booking_code is required')
    .isUUID().withMessage('booking_code must be a valid UUID'),

  param('id')
    .isInt({ min: 1 }).withMessage('Event ID must be a positive integer'),
];

module.exports = {
  userValidation,
  eventValidation,
  bookingValidation,
  userBookingsValidation,
  attendanceValidation,
};