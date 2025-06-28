const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGOOSE_URI = process.env.MONGOOSE_URI;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Import Routes
const authRoutes = require('./routes/auth'); // Assuming auth.js has /login, /register, /me etc.
const sessionsRoutes = require('./routes/sessions'); // New: Import sessions route
const userDataRoutes = require('./routes/userData'); // Existing
const userDashboardRoutes = require('./routes/userDashboard'); // Existing
const progressRouter = require('./routes/progress');
const finalsummaryRouter = require('./routes/finalsummary');
// Mount Routes with specific base paths
app.use('/api/auth', authRoutes); // CORRECTED: Mount auth routes under /api/auth
app.use('/api', sessionsRoutes); // Mount sessions routes under /api/sessions (as defined in sessions.js)
app.use('/api', userDataRoutes); // Mount userData routes under /api/userdata (as defined in userData.js)
app.use('/api', userDashboardRoutes); // Mount userDashboard routes under /api/userstats and /api/usersessions
app.use('/api/progress', progressRouter);
app.use(finalsummaryRouter);
// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'SpeakAI Backend is running!',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware (keep this before 404 handler)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler (this should be the very last route/middleware)
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}` // Added req.originalUrl for better debugging
  });
});


// Start server
async function startServer() {
  try {
    await mongoose.connect(MONGOOSE_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await mongoose.connection.close();
  process.exit(0);
});