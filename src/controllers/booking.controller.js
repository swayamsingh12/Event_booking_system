const { pool } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// POST /bookings — Book a ticket (with transaction + race condition handling)
const createBooking = async (req, res, next) => {
  const connection = await pool.getConnection();
  let transactionStarted = false;

  try {
    const { user_id, event_id, tickets_count = 1 } = req.body;

    await connection.beginTransaction();
    transactionStarted = true;

    // Check user exists
    const [user] = await connection.query(
      'SELECT id FROM users WHERE id = ?', [user_id]
    );
    if (user.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'User not found',
        data:    null,
      });
    }

    // Check event exists and LOCK the row to prevent race conditions
    const [event] = await connection.query(
      'SELECT id, title, remaining_tickets FROM events WHERE id = ? FOR UPDATE',
      [event_id]
    );
    if (event.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Event not found',
        data:    null,
      });
    }

    // Check ticket availability
    if (event[0].remaining_tickets < tickets_count) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: `Only ${event[0].remaining_tickets} ticket(s) remaining`,
        data:  null,
      });
    }

    // Check if user already booked this event
    const [existing] = await connection.query(
      'SELECT id FROM bookings WHERE user_id = ? AND event_id = ?',
      [user_id, event_id]
    );
    if (existing.length > 0) {
      await connection.rollback();
      return res.status(409).json({
        success: false,
        message: 'User has already booked this event',
        data:  null,
      });
    }

    // Generate unique booking code
    const booking_code = uuidv4();

    // Insert booking
    const [booking] = await connection.query(
      `INSERT INTO bookings (user_id, event_id, tickets_count, booking_code)
       VALUES (?, ?, ?, ?)`,
      [user_id, event_id, tickets_count, booking_code]
    );

    // Deduct tickets atomically
    await connection.query(
      'UPDATE events SET remaining_tickets = remaining_tickets - ? WHERE id = ?',
      [tickets_count, event_id]
    );

    await connection.commit();
    transactionStarted = false;

    return res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully',
      data: {
        booking_id: booking.insertId,
        booking_code,
        user_id,
        event_id,
        event_title: event[0].title,
        tickets_count,
        booking_date: new Date(),
      },
    });
  } catch (error) {
    if (transactionStarted) {
      await connection.rollback();
    }

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'User has already booked this event',
        data: null,
      });
    }

    next(error);
  } finally {
    connection.release();
  }
};

module.exports = { createBooking };