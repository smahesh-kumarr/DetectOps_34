const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const authRoutes = require('./routes/authRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

// CORS — allow any origin in development
app.use(cors({
  origin: ['https://stackhut.shop', 'http://localhost:5173'],
  credentials: true
}));

// Request logging
app.use(morgan('dev'));

// JSON body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running', timestamp: new Date() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);

// Phase 4.5+ routes
app.use('/api/reports', reportRoutes);

// Phase 8+ routes:
// app.use('/api/stats', dashboardRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/notify', notifyRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;
