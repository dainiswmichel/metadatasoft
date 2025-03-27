/**
 * ============================================================
 * DA1-MVP-03 Master Server Configuration
 * File: /da1-mvp-03/server.js
 * ============================================================
 * ✅ Fully relative paths
 * ✅ Ready for rename to da1.fm and deployment
 * ✅ Education-level comments
 * ============================================================
 */

// ================================
// Imports and Configuration
// ================================
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const da1Routes = require('./routes/da1_routes.js');

// ================================
// Initialize Express App
// ================================
const app = express();
const PORT = process.env.PORT || 3000;

// ================================
// Base Path Setup (Critical for Deployment)
// ================================
// __dirname resolves to the current folder, e.g., /Users/dainismichel/dainisne/da1-mvp-03
const basePath = __dirname;

// ================================
// Middleware Setup
// ================================
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(bodyParser.json()); // Parse JSON request bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// ================================
// Ensure Required Directories Exist
// ================================
const requiredDirs = [
  path.join(basePath, 'logs'),
  path.join(basePath, 'output'),
  path.join(basePath, 'uploads')
];

requiredDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created missing directory: ${dir}`);
  }
});

// ================================
// Static Files Serving
// ================================
app.use('/', da1Routes);

// Serve Resources (fonts, icons, images, etc.)
app.use('/resources', express.static(path.join(basePath, 'resources')));

// Serve Processed DA1 Output Files
app.use('/output', express.static(path.join(basePath, 'output')));

// Serve Knowledge Base (KB) for MVP-03
app.use('/kb', express.static(path.join(basePath, 'kb')));

// Serve MVP-03 Frontend (index.html, CSS, JS, etc.)
app.use('/', express.static(basePath)); // Serves index.html by default at root

// ================================
// Logging
// ================================
// Optional: You can enable request logging here if desired
// app.use((req, res, next) => {
//   console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
//   next();
// });

// ================================
// API Routes (DA1)
// ================================
// Frontend expects /api endpoints (consistent between dev and production)
app.use('/api', da1Routes);

// ================================
// Server Start
// ================================
app.listen(PORT, () => {
  console.log('==========================================');
  console.log(`✅ Dainisne Master Server is running: http://localhost:${PORT}`);
  console.log(`✅ Environment: development`);
  console.log(`✅ Base Path: ${basePath}`);
  console.log('==========================================');

  console.log('✅ Static files served:');
  console.log(` - Resources: /resources --> ${path.join(basePath, 'resources')}`);
  console.log(` - Output: /output --> ${path.join(basePath, 'output')}`);
  console.log(` - KB: /kb --> ${path.join(basePath, 'kb')}`);
  console.log(` - Frontend Root: / --> ${basePath}`);
});
