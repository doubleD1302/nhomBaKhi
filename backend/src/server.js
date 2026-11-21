require('dotenv').config();
const { validateEnvironment } = require('./config');
const { port } = validateEnvironment(process.env);
const app = require('./app');
const { pool } = require('./db');

const server = app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});

async function shutdown(signal) {
  console.log(`Received ${signal}; shutting down.`);
  server.close(async (error) => {
    try {
      await pool.end();
    } catch (closeError) {
      console.error('Failed to close the database pool.', closeError);
      process.exitCode = 1;
    }
    if (error) {
      console.error('Failed to close the HTTP server.', error);
      process.exitCode = 1;
    }
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
