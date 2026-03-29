const express = require('express');
const router = express.Router();
const { createUser, getUserBookings } = require('../controllers/user.controller');
const { userValidation, userBookingsValidation } = require('../validators/schemas');
const validate = require('../middlewares/validate');

router.post('/', userValidation, validate, createUser);
router.get('/:id/bookings', userBookingsValidation, validate, getUserBookings);

module.exports = router;