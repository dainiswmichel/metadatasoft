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
app.use(bodyParser.json());

// Parse URL-encoded payloads (from forms)
app.use(bodyParser.urlencoded({ extended: true }));

// =========================
// 4️⃣ STATIC FILE SERVING
// =========================

// Serve static files from these directories
app.use('/output', express.static(path.join(__dirname, 'output')));
app.use('/resources', express.static(path.join(__dirname, 'resources')));

// Add additional static paths if needed
app.use('/da1fm-output', express.static(path.join(__dirname, '../da1.fm/backend/output')));
app.use('/mvp-03', express.static(path.join(__dirname, '../da1-mvp-03')));
app.use('/mvp-03/kb', express.static(path.join(__dirname, '../da1-mvp-03/kb')));

// =========================
// 5️⃣ ROUTES
// =========================

// Use the DA1 routes, mapped under /api
app.use('/api', da1Routes);

// =========================
// 6️⃣ REQUIRED DIRECTORIES CREATION
// =========================

// Define directories that need to exist
const requiredDirs = [
  path.join(__dirname, 'output'),
  path.join(__dirname, 'logs'),
  path.join(__dirname, 'uploads')
];

// Check if each directory exists, and create it if missing
requiredDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  } else {
    console.log(`✅ Directory exists: ${dir}`);
  }
});

// =========================
// 7️⃣ FFmpeg BINARY CONFIGURATION LOG (Optional)
// =========================

// If you want to confirm the FFmpeg binary in logs
const ffmpegBinaryPath = path.join(__dirname, 'tools', 'ffmpeg', 'ffmpeg');
if (fs.existsSync(ffmpegBinaryPath)) {
  console.log(`✅ FFmpeg binary set to: ${ffmpegBinaryPath}`);
} else {
  console.warn(`⚠️ FFmpeg binary not found at: ${ffmpegBinaryPath}`);
}

// =========================
// 8️⃣ SERVER START
// =========================

// Define the port number (3000 for local dev)
const PORT = 3000;

// Start listening for incoming HTTP requests
app.listen(PORT, () => {
  console.log('==========================================');
  console.log(`✅ Dainisne Master Server is running: http://localhost:${PORT}`);
  console.log('✅ Environment: development');
  console.log('==========================================');
});
