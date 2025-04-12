/**
 * DA1 Master Server
 * Version: MVP Launch 1.0
 * Author: Dainis Michel + AI Collaborator
 * Description: Primary Express server for the DA1 Media Compilation System.
 */

// =========================
// 1️⃣ CORE MODULES AND IMPORTS
// =========================

// Import core Node.js modules
const fs = require('fs');
const path = require('path');

// Import 3rd-party libraries
const express = require('express');
const cors = require('cors'); // Enable Cross-Origin Resource Sharing
const bodyParser = require('body-parser'); // Parse JSON & URL-encoded data
// const ffmpeg = require('fluent-ffmpeg'); // removed for proper separation of concerns
const multer = require('multer'); // For handling file uploads

// Import custom route handlers
const da1Routes = require('./routes/da1_routes');

// =========================
// 2️⃣ INITIALIZE EXPRESS APP
// =========================

const app = express(); // Create a new Express application instance

// =========================
// 3️⃣ MIDDLEWARE SETUP
// =========================

// Enable CORS to allow frontend requests (different origin/port)
app.use(cors());

// Parse incoming JSON payloads (application/json)
app.use(bodyParser.json({ limit: '50mb' }));

// Parse URL-encoded payloads (from forms)
app.use(bodyParser.urlencoded({ extended: true }));


/*
// =========================
// 4️⃣ FFmpeg CONFIGURATION
// =========================

// Set path to local FFmpeg binary
const ffmpegBinaryPath = path.join(__dirname, 'tools', 'ffmpeg', 'ffmpeg');

// Configure FFmpeg to use our local binary
ffmpeg.setFfmpegPath(ffmpegBinaryPath);

// Log FFmpeg configuration status
if (fs.existsSync(ffmpegBinaryPath)) {
  console.log(`✅ FFmpeg binary configured at: ${ffmpegBinaryPath}`);
} else {
  console.warn(`⚠️ FFmpeg binary not found at: ${ffmpegBinaryPath}`);
  console.warn(`⚠️ Audio processing functionality may not work correctly!`);
}

// Test FFmpeg capabilities
console.log('🔎 Checking FFmpeg capabilities...');
ffmpeg.getAvailableFormats(function(err, formats) {
  if (err) {
    console.error('❌ FFmpeg format check failed:', err.message);
  } else {
    console.log('✅ Available formats detected');
  }
});

ffmpeg.getAvailableCodecs(function(err, codecs) {
  if (err) {
    console.error('❌ FFmpeg codec check failed:', err.message);
  } else {
    console.log('✅ Available audio codecs detected');
  }
});
*/ 

// =========================
// 5️⃣ STATIC FILE SERVING
// =========================

// Serve static files from these directories
app.use('/output', express.static(path.join(__dirname, 'output')));
app.use('/resources', express.static(path.join(__dirname, 'resources')));

// Add additional static paths if needed
app.use('/da1fm-output', express.static(path.join(__dirname, '../da1.fm/backend/output')));
app.use('/mvp-03', express.static(path.join(__dirname, '../da1-mvp-03')));
app.use('/mvp-03/kb', express.static(path.join(__dirname, '../da1-mvp-03/kb')));

// Serve the new knowledge base
app.use('/knowledge-base', express.static(path.join(__dirname, '../da1.fm/knowledge-base')));
// Serve the entire da1.fm directory
app.use('/da1fm', express.static(path.join(__dirname, '../da1.fm')));

console.log('✅ Static file directories configured');

// =========================
// 6️⃣ ROUTES
// =========================

// Use the DA1 routes, mapped under /api
app.use('/api', da1Routes);

// Add health check endpoint
app.get('/health', function(req, res) {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    server: 'DA1 Media Compilation System'
  });
});

// =========================
// 7️⃣ REQUIRED DIRECTORIES CREATION
// =========================

// Define directories that need to exist
const requiredDirs = [
  path.join(__dirname, 'output'),
  path.join(__dirname, 'logs'),
  path.join(__dirname, 'uploads')
];

// Check if each directory exists, and create it if missing
requiredDirs.forEach(function(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  } else {
    console.log(`✅ Directory exists: ${dir}`);
  }
});

// =========================
// 8️⃣ ERROR HANDLING
// =========================

// Global error handler for unhandled exceptions
app.use(function(err, req, res, next) {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

// Process error handlers
process.on('uncaughtException', function(err) {
  console.error('Uncaught Exception:', err);
  // Keep the server running despite errors
});

process.on('unhandledRejection', function(reason, promise) {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Keep the server running despite rejections
});

// =========================
// 9️⃣ SERVER START
// =========================

// Define the port number (3000 for local dev)
const PORT = process.env.PORT || 3000;

// Start listening for incoming HTTP requests
app.listen(PORT, function() {
  console.log('==========================================');
  console.log(`✅ Dainisne Master Server is running: http://localhost:${PORT}`);
  console.log('✅ Environment: development');
  console.log('==========================================');
});