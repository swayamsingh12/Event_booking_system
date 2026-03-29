const express  = require('express');
const router  = express.Router();
const { createBooking } = require('../controllers/booking.controller');
const { bookingValidation} = require('../validators/schemas');
const validate  = require('../middlewares/validate');

router.post('/', bookingValidation, validate, createBooking);

module.exports = router;