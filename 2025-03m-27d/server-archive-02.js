// ========================
// 2025-03m-19d-12h-00m
// DA1 SERVER CONFIGURATION
// ========================

// ================================
// 1. CORE DEPENDENCIES & INITIAL SETUP
// ================================
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

// ================================
// 2. FFmpeg BINARY PATH CONFIGURATION
// ================================
ffmpeg.setFfmpegPath('/Users/dainismichel/dainisne/tools/ffmpeg/ffmpeg');
console.log('✅ FFmpeg binary set to: /Users/dainismichel/dainisne/tools/ffmpeg/ffmpeg');

// ================================
// 3. EXPRESS APP INITIALIZATION
// ================================
const app = express();

// ================================
// 4. STATIC FILE MIDDLEWARE
// ================================
app.use('/output', express.static(path.join(__dirname, 'output')));
console.log(`✅ Static files being served from: ${path.join(__dirname, 'output')}`);

// ================================
// 5. IMPORT ROUTES
// ================================
const da1Routes = require('./routes/da1_routes'); // DA1-specific API routes
app.use('/api/da1', da1Routes);

// ================================
// 6. ENVIRONMENT VARIABLES
// ================================
const PORT = process.env.PORT || 3000;

// ================================
// 7. SERVER START
// ================================
app.listen(PORT, () => {
  console.log(`✅ Dainisne Master Server is running: http://localhost:${PORT}`);
  console.log(`✅ Environment: development`);
});

// ================================
// 8. FFmpeg CAPABILITY TEST (OPTIONAL BUT RECOMMENDED)
// ================================
console.log('🔎 Checking FFmpeg capabilities...');

ffmpeg.getAvailableFormats((err, formats) => {
  if (err) {
    console.error('❌ FFmpeg direct test failed:', err.message);
  } else {
    console.log('✅ Available formats:', Object.keys(formats));
  }
});

ffmpeg.getAvailableCodecs((err, codecs) => {
  if (err) {
    console.error('❌ FFmpeg codec test failed:', err.message);
  } else {
    console.log('✅ Available audio codecs:', Object.keys(codecs));
  }
});

// ================================
// END OF FILE
// ================================
