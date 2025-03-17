// ==========================================================
// 📂 Dainisne Master Server (Super Well-Commented)
// 🔥 Version: March 16, 2025
// ==========================================================

// ==========================================================
// ✅ Dependencies
// ==========================================================
const express = require('express');               // Web framework for Node.js
const cors = require('cors');                     // Enable CORS (Cross-Origin Resource Sharing)
const path = require('path');                     // Node.js utility for handling file paths
const fs = require('fs');                         // Node.js file system module

// ==========================================================
// ✅ Configuration (Edit These As Needed)
// ==========================================================
const PORT = 3000;                                           // Master server port
const ENVIRONMENT = process.env.NODE_ENV || 'development';   // Environment variable (development / production)

// Define output folders for different projects
const DA1_MVP_OUTPUT_DIR = path.join(__dirname, 'da1-mvp/backend/output');
const DA1_FM_OUTPUT_DIR = path.join(__dirname, 'da1.fm/backend/output'); // You can remove this if you're not using it anymore

// Define allowed CORS origins (frontends that can call this server)
const allowedOrigins = [
  'http://127.0.0.1:5500',
  'http://localhost:5500',
  // Add your production domain later, e.g.:
  // 'https://yourdomain.com'
];

// ==========================================================
// ✅ Initialize Express App
// ==========================================================
const app = express();

// ==========================================================
// ✅ Middlewares
// ==========================================================
app.use(express.json({ limit: '50mb' }));            // Parse incoming JSON with a 50MB size limit
app.use(express.urlencoded({ extended: true }));     // Parse URL-encoded bodies
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy violation: ' + origin));
    }
  }
}));

// ==========================================================
// ✅ Serve Static Output Files For Download
// ==========================================================
// This exposes the processed files to be downloadable in the browser
if (fs.existsSync(DA1_MVP_OUTPUT_DIR)) {
  app.use('/output/da1-mvp', express.static(DA1_MVP_OUTPUT_DIR));
}

if (fs.existsSync(DA1_FM_OUTPUT_DIR)) {
  app.use('/output/da1-fm', express.static(DA1_FM_OUTPUT_DIR));
}

// ==========================================================
// ✅ Import and Register Routes For Each Project
// ==========================================================
const da1MvpRoutes = require('./routes/da1-mvp.routes');

// Register each project's API under a namespace route
app.use('/api/da1-mvp', da1MvpRoutes);
// app.use('/api/da1-fm', da1FmRoutes); // You can comment/remove if unused

// ==========================================================
// ✅ Health Check Endpoint
// ==========================================================
app.get('/healthz', (req, res) => {
  res.status(200).json({
    status: 'Healthy',
    environment: ENVIRONMENT,
    timestamp: new Date().toISOString()
  });
});

// ==========================================================
// ✅ Start Master Server
// ==========================================================
app.listen(PORT, () => {
  console.log('==========================================');
  console.log(`✅ Dainisne Master Server running at http://localhost:${PORT}`);
  console.log(`✅ Environment: ${ENVIRONMENT}`);
  console.log(`✅ Allowed Origins:`, allowedOrigins);

  if (fs.existsSync(DA1_MVP_OUTPUT_DIR)) {
    console.log(`✅ Serving DA1-MVP output files from: ${DA1_MVP_OUTPUT_DIR}`);
  }
  if (fs.existsSync(DA1_FM_OUTPUT_DIR)) {
    console.log(`✅ Serving DA1.FM output files from: ${DA1_FM_OUTPUT_DIR}`);
  }

  console.log('==========================================\n');
});

// ==========================================================
// ✅ Optional Debug / Diagnostics (FFmpeg, etc.)
// ==========================================================
// Here you can add FFmpeg diagnostics, or other project-specific checks
// Example:
// const ffmpegPath = require('ffmpeg-static');
// console.log(`FFmpeg configured with path: ${ffmpegPath}`);
// Run diagnostics on startup if needed!

// ==========================================================
// ✅ Project Roadmap:
// ==========================================================
// - Add authentication (JWT or OAuth)
// - Implement centralized logging (Winston or Bunyan)
// - Health monitoring with PM2 or systemctl
// - Auto-restart on crash (Nodemon or PM2 for dev / production)
// - Deployment automation (Chemicloud, Docker, etc.)

// ==========================================================
// ✅ End of Master Server File
// ==========================================================