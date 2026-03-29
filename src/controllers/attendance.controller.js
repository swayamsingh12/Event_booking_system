const { pool } = require('../config/db');

// POST /events/:id/attendance
const recordAttendance = async (req, res, next) => {
  const connection = await pool.getConnection();
  let transactionStarted = false;

  try {
    const event_id = Number(req.params.id);
    const { booking_code } = req.body;

    await connection.beginTransaction();
    transactionStarted = true;

    // Check event exists
    const [event] = await connection.query(
      'SELECT id, title FROM events WHERE id = ?', [event_id]
    );
    if (event.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Event not found',
        data: null,
      });
    }

    // Validate booking code belongs to this event
    const [booking] = await connection.query(
      `SELECT b.id, b.user_id, b.event_id, b.tickets_count, b.booking_code
       FROM bookings b
       WHERE b.booking_code = ? AND b.event_id = ?`,
      [booking_code, event_id]
    );
    if (booking.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Invalid booking code for this event',
        data: null,
      });
    }

    // Check if already checked in
    const [alreadyCheckedIn] = await connection.query(
      'SELECT id FROM event_attendance WHERE booking_id = ?',
      [booking[0].id]
    );
    if (alreadyCheckedIn.length > 0) {
      await connection.rollback();
      return res.status(409).json({
        success: false,
        message: 'This booking has already been checked in',
        data: null,
      });
    }

    // Record attendance
    await connection.query(
      `INSERT INTO event_attendance (user_id, event_id, booking_id)
       VALUES (?, ?, ?)`,
      [booking[0].user_id, event_id, booking[0].id]
    );

    await connection.commit();
    transactionStarted = false;

    return res.status(200).json({
      success: true,
      message: 'Attendance recorded successfully',
      data: {
        event_id,
        event_title: event[0].title,
        booking_code,
        tickets_booked: booking[0].tickets_count,
        entry_time: new Date(),
      },
    });
  } catch (error) {
    if (transactionStarted) {
      await connection.rollback();
    }

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'This booking has already been checked in',
        data: null,
      });
    }

    next(error);
  } finally {
    connection.release();
  }
};

module.exports = { recordAttendance };