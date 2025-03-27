const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { processDA1 } = require('../services/da1_services');
const router = express.Router();

// TEMP UPLOAD DESTINATION
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    const safeName = file.originalname.replace(/\s+/g, '_');
    cb(null, `${uniqueSuffix}-${safeName}`);
  }
});

const upload = multer({ storage: storage });

// POST: Compile DA1 Package
router.post('/api/compile', upload.array('files'), async (req, res) => {
  try {
    const files = req.files;
    const { outputFormats, ...metadata } = req.body;

    const selectedFormats = Array.isArray(outputFormats)
      ? outputFormats
      : [outputFormats];

    const result = await processDA1(files, selectedFormats, metadata);

      res.json({
      success: true,
      message: 'DA1 Package created successfully',
      outputFiles: result.outputFiles,
      packageDir: result.packageDir,
      manifest: result.manifestPath,
      downloadLinks: result.downloadLinks
    });

  } catch (error) {
    console.error('❌ Error in /api/compile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during DA1 compilation',
      error: error.message
    });
  }
});

module.exports = router;
