/**
 * routes.js - Main API routes for DA1 Media Compiler
 * 
 * This file contains all the routes for handling audio file processing and compilation
 * including file uploads, audio conversion, and metadata management.
 */

const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const da1Service = require('../services/da1_services.js');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

// ==========================================
// START SECTION 1: CONFIGURATION AND SETUP
// ==========================================

// Path to default cover art - this will be embedded in audio files when applicable
const defaultCoverArtPath = path.join(__dirname, '..', 'resources', 'elements', 'DA1neverBlankmetaMetaData_Cover_01.jpg');

// Create router instance
const router = express.Router();

// Multer configuration for file uploads
// This defines where uploaded files are stored and how they're named
const storage = multer.diskStorage({
  // The destination defines where uploaded files will be saved - moved to project root
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'uploads');
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
      console.log(`✅ Created uploads directory at ${uploadPath}`);
    }
    cb(null, uploadPath);
  },
  // The filename function controls how the uploaded files will be named
  filename: (req, file, cb) => {
    // Use timestamp to ensure unique filenames
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Create multer upload middleware with storage configuration
// 500MB file size limit allows for large audio files
const upload = multer({ 
  storage,
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB limit
});

// end section 1: configuration and setup

// ==========================================
// START SECTION 2: ROUTE DEFINITIONS
// ==========================================

/**
 * Health check route
 * Used to verify that the server is running and responsive
 */
router.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'DA1 Backend is running' });
});

/**
 * Main compilation API endpoint
 * Accepts audio files and metadata, processes files into requested formats
 */
router.post('/compile', upload.array('files'), async (req, res) => {
  try {
    // Extract uploaded files
    const files = req.files;
    
    // Parse requested output formats from JSON string
    // Default to empty array if not provided
    const formats = JSON.parse(req.body.formats || '[]');
    
    // Extract metadata from form if available
    const metadata = {
      title: req.body.title || '',
      artist: req.body.artist || '',
      album: req.body.album || '',
      genre: req.body.genre || ''
    };

    // Log received data for debugging
    console.log(`✅ Files received: ${files.length}`);
    console.log(`✅ Formats selected: ${formats}`);
    console.log(`✅ Metadata:`, metadata);

    // Process files using da1Service
    const result = await da1Service.processDA1(files, formats, metadata);

    // Return success response with all download links
    res.json({
      success: true,
      message: 'Compilation successful',
      packageId: result.packageId,
      downloadLinks: result.downloadLinks
    });

  } catch (error) {
    // Handle any other errors in the overall process
    console.error('❌ Error processing compilation:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal Server Error', 
      details: error.message 
    });
  }
});

/**
 * Primary metadata embedding endpoint
 */
router.post('/embed', upload.array('mediaFiles'), async (req, res) => {
  console.log('[DA1] Received embed request');
  console.log(`[DA1] Files received: ${req.files ? req.files.length : 0}`);
  
  try {
    // Validate that files were uploaded
    if (!req.files || req.files.length === 0) {
      console.error('[DA1] No files were uploaded');
      return res.status(400).json({
        success: false,
        message: 'No files were uploaded'
      });
    }
    
    // Log upload paths for debugging
    req.files.forEach((file, index) => {
      console.log(`[DA1] File ${index + 1}: ${file.originalname} → ${file.path} (exists: ${fs.existsSync(file.path)})`);
    });
    
    // Extract metadata from request body
    const metadata = {
      title: req.body.title || '',
      artist: req.body.artist || '',
      album: req.body.album || '',
      genre: req.body.genre || ''
    };
    
    // Parse formats from request
    let formats = ['mp3']; // Default to MP3 if no formats specified
    
    // Check both output formats (from frontend) and formats (API standard)
    if (req.body.outputFormats) {
      try {
        formats = JSON.parse(req.body.outputFormats);
      } catch (e) {
        formats = req.body.outputFormats.split(',').map(f => f.trim());
      }
    } else if (req.body.formats) {
      try {
        formats = JSON.parse(req.body.formats);
      } catch (e) {
        formats = req.body.formats.split(',').map(f => f.trim());
      }
    }
    
    console.log(`[DA1] Processing formats: ${formats}`);
    console.log(`[DA1] Metadata: ${JSON.stringify(metadata)}`);
    
    // Process the files using the DA1 service
    const result = await da1Service.processDA1(req.files, formats, metadata);
    
    // Return success response with download links
    res.json({
      success: true,
      message: 'Files processed successfully',
      packageId: result.packageId,
      downloadLinks: result.downloadLinks
    });

  } catch (error) {
    console.error('[DA1] Error processing files:', error);
    console.error('[DA1] Complete error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Error processing files',
      error: error.message
    });
  }
});

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Escapes special characters in XML content
 */
function escapeXml(unsafe) {
  if (typeof unsafe !== 'string') return '';
  return unsafe.replace(/[<>&'"]/g, c => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

module.exports = router;
