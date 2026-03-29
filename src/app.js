const express  = require('express');
const swaggerUi = require('swagger-ui-express');
const yaml  = require('js-yaml');
const fs   = require('fs');
const path = require('path');
const errorHandler = require('./middlewares/errorHandler');

const userRoutes = require('./routes/user.routes');
const eventRoutes = require('./routes/event.routes');
const bookingRoutes = require('./routes/booking.routes');

const app = express();
const publicDir = path.join(__dirname, '../public');

app.use(express.json());
app.use(express.static(publicDir));

// Swagger Docs
const swaggerDocument = yaml.load(
  fs.readFileSync(path.join(__dirname, '../swagger.yaml'), 'utf8')
);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/users', userRoutes);
app.use('/events', eventRoutes);
app.use('/bookings', bookingRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// Global error handler
app.use(errorHandler);

module.exports = app;