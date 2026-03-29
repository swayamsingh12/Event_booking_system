require('dotenv').config();

const app = require('./app');
const { ensureDatabaseConnection } = require('./config/db');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await ensureDatabaseConnection();
    console.log('Database connection successful');

    app.listen(PORT, () => {
      console.log('Server running on port ' + PORT);
      console.log('Swagger docs: http://localhost:' + PORT + '/api-docs');
    });
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

startServer();
