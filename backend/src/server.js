const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://tatacrm-production.up.railway.app'
  ],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/uploads', express.static(uploadsDir));

/* ---------------- ROOT ROUTE ---------------- */
app.get('/', (req, res) => {
  res.json({
    message: 'Tata Motors CRM Backend Running Successfully 🚀',
    health: '/api/health'
  });
});

/* ---------------- API ROUTES ---------------- */
app.use('/api/auth', require('./routes/auth'));
app.use('/api/leads', require('./routes/leads'));
app.use('/api/dealers', require('./routes/dealers'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/campaign', require('./routes/campaign'));
app.use('/api/admin', require('./routes/admin'));

/* ---------------- HEALTH CHECK ---------------- */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Tata Motors CRM API is running',
    time: new Date()
  });
});

/* ---------------- ERROR HANDLER ---------------- */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

/* ---------------- START SERVER ---------------- */
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Tata Motors CRM Server running on port ${PORT}`);
});

module.exports = app;