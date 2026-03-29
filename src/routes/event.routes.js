const express = require('express');
const router = express.Router();
const { getAllEvents, createEvent } = require('../controllers/event.controller');
const { recordAttendance }  = require('../controllers/attendance.controller');
const { eventValidation, attendanceValidation } = require('../validators/schemas');
const validate   = require('../middlewares/validate');

router.get('/', getAllEvents);
router.post('/',eventValidation, validate, createEvent);
router.post('/:id/attendance', attendanceValidation, validate, recordAttendance);

module.exports = router;