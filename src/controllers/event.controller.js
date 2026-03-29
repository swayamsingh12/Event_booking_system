const { pool } = require('../config/db');

const toMySqlDateTime = (input) => {
  const parsedDate = new Date(input);
  if (Number.isNaN(parsedDate.getTime())) {
    const error = new Error('Invalid date value');
    error.statusCode = 400;
    throw error;
  }
  return parsedDate.toISOString().slice(0, 19).replace('T', ' ');
};

// GET /events — List all upcoming events
const getAllEvents = async (req, res, next) => {
  try {
    const [events] = await pool.query(
      `SELECT id, title, description, date,
              total_capacity, remaining_tickets, created_at
       FROM events
       WHERE date > NOW()
       ORDER BY date ASC`
    );

    return res.status(200).json({
      success: true,
      message: 'Upcoming events retrieved successfully',
      data:    events,
    });
  } catch (error) {
    next(error);
  }
};

// POST /events — Create a new event
const createEvent = async (req, res, next) => {
  try {
    const { title, description, date, total_capacity } = req.body;
    const mysqlEventDate = toMySqlDateTime(date);

    const [result] = await pool.query(
      `INSERT INTO events
         (title, description, date, total_capacity, remaining_tickets)
       VALUES (?, ?, ?, ?, ?)`,
      [title, description || null, mysqlEventDate, total_capacity, total_capacity]
    );

    return res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: {
        id:  result.insertId,
        title,
        description: description || null,
        date,
        total_capacity,
        remaining_tickets: total_capacity,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllEvents, createEvent };