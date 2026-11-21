const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const studentRoutes = require('./routes/students');
const employerRoutes = require('./routes/employers');
const shiftRoutes = require('./routes/shifts');
const adminRoutes = require('./routes/admin');
const { notFound, errorHandler } = require('./middleware/errors');
const { truyVan } = require('./db');

const app = express();
if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);
const allowedOrigins = process.env.CORS_ORIGIN === '*'
  ? true
  : (process.env.CORS_ORIGIN || '').split(',').map((origin) => origin.trim()).filter(Boolean);

app.use(helmet());
app.use(cors({ origin: allowedOrigins === true ? true : (allowedOrigins.length ? allowedOrigins : false) }));
app.use(express.json({ limit: '1mb' }));
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));
app.get('/ready', async (req, res) => {
  try {
    await truyVan('SELECT 1 FROM nguoi_dung LIMIT 1');
    res.json({ status: 'ready', database: 'ok' });
  } catch {
    res.status(503).json({ status: 'not_ready', database: 'unavailable' });
  }
});
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 30 }), authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/employer', employerRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/admin', adminRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
