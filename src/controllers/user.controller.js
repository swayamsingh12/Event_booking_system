const { pool } = require('../config/db');

// POST /users — Create a new user
const createUser = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ?', [email]
    );
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email already exists',
        data:    null,
      });
    }

    const [result] = await pool.query(
      'INSERT INTO users (name, email) VALUES (?, ?)',
      [name, email]
    );

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data:    { id: result.insertId, name, email },
    });
  } catch (error) {
    next(error);
  }
};

// GET /users/:id/bookings — Get all bookings for a user
const getUserBookings = async (req, res, next) => {
  try {
    const userId = Number(req.params.id);

    const [user] = await pool.query(
      'SELECT id, name, email FROM users WHERE id = ?', [userId]
    );
    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        data:  null,
      });
    }

    const [bookings] = await pool.query(
      `SELECT
         b.id AS booking_id,
         b.booking_code,
         b.tickets_count,
         b.booking_date,
         e.id AS event_id,
         e.title AS event_title,
         e.description AS event_description,
         e.date AS event_date,
         e.total_capacity,
         e.remaining_tickets
       FROM bookings b
       JOIN events e ON b.event_id = e.id
       WHERE b.user_id = ?
       ORDER BY b.booking_date DESC`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      message: 'User bookings retrieved successfully',
      data: {
        user:     user[0],
        bookings,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createUser, getUserBookings };