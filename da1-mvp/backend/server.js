const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./routes');

const app = express();

// ENVIRONMENT VARIABLES
const PORT = process.env.PORT || 3000;
const FRONTEND_ORIGINS = (process.env.FRONTEND_ORIGINS || 'http://127.0.0.1:5500,http://localhost:5500')
  .split(',')
  .map(origin => origin.trim());

console.log('✅ Allowed Origins:', FRONTEND_ORIGINS);

// Enhanced CORS configuration
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);
    
    if (FRONTEND_ORIGINS.indexOf(origin) === -1) {
      const msg = 'CORS policy does not allow access from this origin.';
      console.warn(`⚠️ CORS blocked request from: ${origin}`);
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true,
  optionsSuccessStatus: 204
}));

// Enable parsing larger request bodies
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/', routes);

// Serve output directory for downloads
const outputPath = path.join(__dirname, 'output');
console.log(`✅ Serving output files from: ${outputPath}`);
app.use('/output', express.static(outputPath));

// Health check route
app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ DA1 Backend running at http://127.0.0.1:${PORT}`);
  console.log(`✅ Health check available at http://127.0.0.1:${PORT}/healthz`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  // Keep the server running despite the error
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // Keep the server running despite the error
});