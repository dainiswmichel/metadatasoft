// ==========================================================
// 📂: /dainisne/server.js
// 🔥 Version: March 18, 2025
// 📅 🕒: 2025-03m-18d-12h-31m-14s
// ==========================================================

/* ==========================================================
   1. CORE DEPENDENCIES & INITIAL SETUP
========================================================== */
global.ReadableStream = require('stream/web').ReadableStream;
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const bodyParser = require('body-parser');
const cheerio = require('cheerio');
const ffmpeg = require('fluent-ffmpeg');
const { v4: uuidv4 } = require('uuid');


// Import Routes
const da1Routes = require('./routes/da1_routes'); // ✅ Corrected path!

// Express app initialization
const app = express();

// ========================
// STATIC FILE MIDDLEWARE
// ========================
app.use('/output', express.static(path.join(__dirname, 'output')));
console.log(`Static files being served from: ${path.join(__dirname, 'output')}`);


// Environment variables
const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV || 'development';

/* ==========================================================
   2. DIRECTORY PATHS & VALIDATION
========================================================== */

// Core directories
const DA1_OUTPUT_DIR       = path.join(__dirname, './output');
const DA1_FM_OUTPUT_DIR    = path.join(__dirname, '../da1.fm/backend/output');
const DA1_MVP_03_DIR       = path.join(__dirname, '../da1-mvp-03');
const DA1_MVP_03_KB_DIR    = path.join(DA1_MVP_03_DIR, 'kb');

// Ensure essential directories exist
[
  DA1_OUTPUT_DIR,
  DA1_FM_OUTPUT_DIR,
  DA1_MVP_03_KB_DIR
].forEach(dir => {
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    } catch (error) {
      console.error(`❌ Failed to create directory ${dir}:`, error);
    }
  }
});

/* ==========================================================
   3. MIDDLEWARE CONFIGURATION
========================================================== */
// Serve output files statically
const outputPath = path.join(__dirname, 'output');
app.use('/output', express.static(outputPath));
console.log(`Static files being served from: ${outputPath}`);

// ✅ CORS Setup
const allowedOrigins = [
  'http://127.0.0.1:5500',
  'http://localhost:5500',
  'http://localhost:3000',
  'http://localhost:3002'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy violation: ' + origin));
    }
  }
}));

// ✅ Body Parsing
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Add static file serving for output directory
const outputDirPath = path.join(__dirname, 'output');
app.use('/output', express.static(outputDirPath));
console.log(`✅ Serving static files from: ${outputDirPath}`);

// Test FFmpeg directly to verify it's working
const { execSync } = require('child_process');
try {
  console.log('🧪 Testing FFmpeg directly:');
  const ffmpegOutput = execSync(`${ffmpegStatic} -version`).toString().slice(0, 100);
  console.log(`✅ FFmpeg test successful: ${ffmpegOutput}...`);
} catch (error) {
  console.error('❌ FFmpeg direct test failed:', error.message);
  console.error('This may prevent audio processing from working correctly!');
}

/* ==========================================================
   4. ROUTES: API ROUTES, STATIC FILES, KNOWLEDGE BASE
========================================================== */

// ✅ API Routes - (v1)
app.use('/api', da1Routes);

// ✅ Static Files - Resources, Outputs, and Knowledge Base
app.use('/resources', express.static(path.join(__dirname, '../resources')));
app.use('/output', express.static(DA1_OUTPUT_DIR));
app.use('/output/da1-fm', express.static(DA1_FM_OUTPUT_DIR));
app.use('/da1-mvp-03', express.static(DA1_MVP_03_DIR));
app.use('/da1-mvp-03/kb', express.static(DA1_MVP_03_KB_DIR));

console.log(`✅ Static files served:
 - Resources: ../resources
 - DA1 Output: ${DA1_OUTPUT_DIR}
 - DA1 FM Output: ${DA1_FM_OUTPUT_DIR}
 - MVP-03 Frontend: ${DA1_MVP_03_DIR}
 - MVP-03 KB: ${DA1_MVP_03_KB_DIR}
`);

/* ==========================================================
   5. KNOWLEDGE BASE INDEX GENERATION (AUTO-GENERATE)
========================================================== */

// Generates the index.html for KB directory
function generateKbIndex() {
  try {
    console.log('🔄 Generating KB index...');

    const files = fs.readdirSync(DA1_MVP_03_KB_DIR).filter(file =>
      file.endsWith('.html') && file !== 'index.html'
    );

    const listItems = files.map(file => {
      const filePath = path.join(DA1_MVP_03_KB_DIR, file);
      const metadata = extractMetadata(filePath);

      const headingsHtml = metadata.headings.map(h =>
        `<li class="${h.tag}"><${h.tag}>${h.text}</${h.tag}></li>`
      ).join('');

      return `
        <li class="file-block">
          <a href="./${file}">${metadata.title}</a>
          <p>${metadata.ogTitle}</p>
          <p>${metadata.ogDescription}</p>
          <ul class="headings-list">${headingsHtml}</ul>
        </li>
      `;
    }).join('');

    const htmlContent = buildKbIndexHtml(listItems);
    fs.writeFileSync(path.join(DA1_MVP_03_KB_DIR, 'index.html'), htmlContent, 'utf-8');
    console.log(`✅ KB index.html updated`);
  } catch (err) {
    console.error(`❌ Failed to generate KB index:`, err);
  }
}

// Extract metadata from KB HTML files
function extractMetadata(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const $ = cheerio.load(content);

  return {
    title: $('title').text() || path.basename(filePath),
    ogTitle: $('meta[property="og:title"]').attr('content') || '',
    ogDescription: $('meta[property="og:description"]').attr('content') || '',
    headings: $('h1, h2, h3').map((_, el) => ({
      tag: el.name,
      text: $(el).text()
    })).get()
  };
}

// Builds full index HTML page (simplified here)
function buildKbIndexHtml(listItems) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>DA1 Knowledge Base</title>
</head>
<body>
  <h1>DA1 Knowledge Base</h1>
  <ul>${listItems}</ul>
</body>
</html>
  `;
}

// ✅ Auto-regen KB index on file changes
fs.watch(DA1_MVP_03_KB_DIR, (eventType, filename) => {
  if (filename && filename !== 'index.html') {
    console.log(`📝 KB file changed: ${filename}`);
    generateKbIndex();
  }
});
generateKbIndex(); // initial load

/* ==========================================================
   6. UTILITY ROUTES & HEALTHCHECK
========================================================== */

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    environment: ENV,
    timestamp: new Date().toISOString()
  });
});

// Root: simple dashboard
app.get('/', (req, res) => {
  res.send(`
    <h1>DA1 Development Server</h1>
    <p>✅ Running on port ${PORT}</p>
    <p>✅ Environment: ${ENV}</p>
    <p><a href="/kb">📖 Knowledge Base</a></p>
  `);
});

/* ==========================================================
   7. ERROR HANDLING & SHUTDOWN
========================================================== */

// Central error handler
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err);
  res.status(500).json({ error: true, message: err.message });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down server...');
  process.exit(0);
});

/* ==========================================================
   8. START SERVER
========================================================== */
// ✅ Embed API POST route
app.post('/api/embed', (req, res) => {
  console.log('✅ POST /api/embed request received:', req.body);

  // Return a simple success response immediately
  res.json({ success: true, message: '✅ Embed data processed.' });
});

app.listen(PORT, () => {
  console.log('==========================================');
  console.log(`✅ Dainisne Master Server is running: http://localhost:${PORT}`);
  console.log(`✅ Environment: ${ENV}`);
  console.log('==========================================\n');
});
