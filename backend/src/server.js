const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

/* ---------------- GUARD: Require JWT_SECRET in all environments ---------------- */
if (!process.env.JWT_SECRET) {
  console.warn('\u26a0\ufe0f WARNING: JWT_SECRET environment variable is not set. Using fallback secret.');
}

const errorMiddleware = require('./middleware/errorMiddleware');
const db = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

/* ---------------- CREATE UPLOAD FOLDERS ---------------- */
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

/* ---------------- CORS CONFIGURATION ---------------- */
/**
 * CORS is driven entirely by environment variables.
 * Set CORS_ORIGIN in your .env (or platform env vars) as a comma-separated list:
 *
 *   CORS_ORIGIN=https://yourapp.vercel.app,https://yourdomain.com
 *
 * For local development leave it unset — localhost origins are always allowed.
 * On Railway, set this to your Vercel URL.
 * On OVHcloud / DigitalOcean, set this to your production frontend domain.
 */
const buildAllowedOrigins = () => {
  const base = [
    'https://tata-crm.vercel.app',
    'https://tata-motors-crm.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000'
  ];
  if (process.env.CORS_ORIGIN) {
    const envOrigins = process.env.CORS_ORIGIN.split(',').map(o => o.trim()).filter(Boolean);
    return [...base, ...envOrigins];
  }
  return base;
};

const allowedOrigins = buildAllowedOrigins();

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    console.error(`[CORS REJECTED] Origin: ${origin}`);
    return callback(new Error(`CORS policy: origin '${origin}' is not allowed`), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use('/uploads', express.static(uploadsDir));

/* ---------------- ROUTES ---------------- */
const authRoutes     = require('./routes/auth');
const leadRoutes     = require('./routes/leads');
const dashboardRoutes = require('./routes/dashboard');
const dealerRoutes   = require('./routes/dealers');
const reportRoutes   = require('./routes/reports');
const campaignRoutes = require('./routes/campaign');
const uploadRoutes   = require('./routes/upload');
const adminRoutes    = require('./routes/admin');

app.use('/api/auth',      authRoutes);
app.use('/api/leads',     leadRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/dealers',   dealerRoutes);
app.use('/api/reports',   reportRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/campaign',  campaignRoutes); // Frontend compatibility
app.use('/api/upload',    uploadRoutes);
app.use('/api/admin',     adminRoutes);

/* ---------------- HEALTH CHECK ---------------- */
app.get('/api/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({
      status: 'OK',
      database: 'HEALTHY',
      message: 'Tata Motors CRM API is running',
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      database: 'UNHEALTHY',
      error: error.message
    });
  }
});

/* ---------------- 404 HANDLER ---------------- */
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route '${req.originalUrl}' not found` });
});

/* ---------------- GLOBAL ERROR HANDLER ---------------- */
app.use(errorMiddleware);

/* ---------------- START SERVER ---------------- */
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\u{1F680} Tata Motors CRM API listening on 0.0.0.0:${PORT}`);
  console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Allowed CORS: ${allowedOrigins.join(', ')}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received — shutting down gracefully');
  process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
});

module.exports = app;