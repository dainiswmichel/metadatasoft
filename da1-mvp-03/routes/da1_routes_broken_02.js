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

// Set ffmpeg path to the static binary provided by ffmpeg-static
// ffmpeg.setFfmpegPath(ffmpegStatic);
// console.log(`FFmpeg configured with path: ${ffmpegStatic}`);
// no more ffmpeg-static! 

// Path to default cover art - this will be embedded in audio files when applicable
const defaultCoverArtPath = path.join(__dirname, '..', 'resources', 'elements', 'DA1neverBlankmetaMetaData_Cover_01.jpg');

// Create router instance
const router = express.Router();

// Multer configuration for file uploads
// This defines where uploaded files are stored and how they're named
const storage = multer.diskStorage({
  // The destination defines where uploaded files will be saved
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads');
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
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

    // Generate unique timestamp and package ID for this operation
    const timestamp = Date.now();
    const packageId = `package_${timestamp}`;
    
    // Create output directory for this package
    const outputDir = path.join(__dirname, '..', 'output', packageId); 
    fs.mkdirSync(outputDir, { recursive: true });

    // --------------------------------
    // 2.1 Create package manifest file
    // --------------------------------
    
    // Create DA1 Package manifest file
    const da1Filename = `DA1_Package_${timestamp}.da1`;
    const da1FilePath = path.join(outputDir, da1Filename);
    
    // Create DA1 package content with metadata
    const da1Contents = `DA1 Package ID: ${packageId}
Timestamp: ${new Date().toISOString()}
Title: ${metadata.title || 'Unknown Title'}
Artist: ${metadata.artist || 'Unknown Artist'}
Album: ${metadata.album || 'Unknown Album'}
Genre: ${metadata.genre || 'Unknown Genre'}
Files:
${files.map(f => f.originalname).join('\n')}
Formats:
${formats.join('\n')}
`;
    
    // Write package manifest to file
    fs.writeFileSync(da1FilePath, da1Contents);

    // Array to store links to all generated files for downloading
    const downloadLinks = [
      { filename: da1Filename, path: `/output/${packageId}/${da1Filename}` }
    ];

    // --------------------------------
    // 2.2 Process audio formats
    // --------------------------------
    
    // List of supported audio formats
    const audioFormats = ['mp3', 'wav', 'flac', 'aiff', 'm4a', 'ogg', 'aac', 'alac'];
    
    // Array to collect promises for parallel processing
    const processingPromises = [];

    // Process each requested format
    for (const format of formats) {
      if (audioFormats.includes(format)) {
        // This is an audio format - process each uploaded file
        for (const file of files) {
          // Only process files with audio MIME types
          if (file.mimetype.startsWith('audio/')) {
            const outputFilename = `${path.parse(file.originalname).name}_${format}_${timestamp}.${format}`;
            const outputPath = path.join(outputDir, outputFilename);
            
           // Add to processing queue with promise tracking
processingPromises.push(
  da1Service.processAudioFile(file.path, outputPath, format, metadata)
    .then(() => {
      // After successful processing, add to download links
      downloadLinks.push({
        filename: outputFilename,
        path: `/output/${packageId}/${outputFilename}`
      });
    })
    .catch(err => {
      // Log error but continue processing other files/formats
      console.error(`❌ Error processing ${file.originalname} to ${format}:`, err.message);
      // Continue without failing the entire operation
      return Promise.resolve();
    })
);
          }
        }
      } else {
        // --------------------------------
        // 2.3 Handle non-audio formats (documentation, etc.)
        // --------------------------------
        
        // Create format-specific documentation file
        const formatFile = `${format.toUpperCase()}_${timestamp}.txt`;
        const formatFilePath = path.join(outputDir, formatFile);
        
        // Start with common header metadata
        let formatContents = `Format: ${format}\n`;
        formatContents += `Timestamp: ${new Date().toISOString()}\n`;
        formatContents += `Title: ${metadata.title || 'Unknown Title'}\n`;
        formatContents += `Artist: ${metadata.artist || 'Unknown Artist'}\n`;
        formatContents += `Album: ${metadata.album || 'Unknown Album'}\n`;
        formatContents += `Genre: ${metadata.genre || 'Unknown Genre'}\n\n`;
        
        // Add format-specific content based on format type
        if (format === 'isrc-sheet') {
          // ISRC sheet format - Provides ISRC codes for each track
          formatContents += `ISRC Sheet for ${metadata.title || 'Unknown'}\n`;
          formatContents += `Generated: ${new Date().toISOString()}\n`;
          formatContents += `Files:\n${files.map(f => `${f.originalname}: ISRC-PENDING-${timestamp}`).join('\n')}`;
        } else if (format === 'da1xml-export') {
          // XML export format - Structured metadata in XML format
          formatContents += `<?xml version="1.0" encoding="UTF-8"?>\n`;
          formatContents += `<DA1Package id="${packageId}" timestamp="${timestamp}">\n`;
          formatContents += `  <Metadata>\n`;
          formatContents += `    <Title>${escapeXml(metadata.title || 'Unknown Title')}</Title>\n`;
          formatContents += `    <Artist>${escapeXml(metadata.artist || 'Unknown Artist')}</Artist>\n`;
          formatContents += `    <Album>${escapeXml(metadata.album || 'Unknown Album')}</Album>\n`;
          formatContents += `    <Genre>${escapeXml(metadata.genre || 'Unknown Genre')}</Genre>\n`;
          formatContents += `  </Metadata>\n`;
          formatContents += `  <Files>\n`;
          files.forEach(f => {
            formatContents += `    <File name="${escapeXml(f.originalname)}" size="${f.size}" type="${f.mimetype}" />\n`;
          });
          formatContents += `  </Files>\n`;
          formatContents += `</DA1Package>`;
        } else if (format === 'spotify' || format === 'bandcamp' || format === 'youtube' || 
                   format === 'distrokid' || format === 'cdbaby') {
          // Distribution platform documentation
          formatContents += `Platform: ${format}\n`;
          formatContents += `Release Information:\n`;
          formatContents += `- Title: ${metadata.title || 'Unknown Title'}\n`;
          formatContents += `- Artist: ${metadata.artist || 'Unknown Artist'}\n`;
          formatContents += `- Album: ${metadata.album || 'Unknown Album'}\n`;
          formatContents += `- Genre: ${metadata.genre || 'Unknown Genre'}\n`;
          formatContents += `- Release Date: ${new Date().toISOString().split('T')[0]}\n`;
          formatContents += `- Files: ${files.length}\n`;
          formatContents += `\nThis package contains the properly formatted files for ${format} submission.`;
        } else {
          // Generic format - just list the files
          formatContents += `Files:\n${files.map(f => f.originalname).join('\n')}`;
        }
        
        // Write the format-specific file
        fs.writeFileSync(formatFilePath, formatContents);
        
        // Add to download links
        downloadLinks.push({
          filename: formatFile,
          path: `/output/${packageId}/${formatFile}`
        });
      }
    }

    // Wait for all audio processing to complete
    // Promise.all will reject if any promise rejects, so we need to handle errors
    try {
      await Promise.all(processingPromises);
      console.log('✅ All processing complete');
    } catch (error) {
      console.error('❌ Error during audio processing:', error);
      // Continue with successful conversions
    }

    // Return success response with all download links
    res.json({
      success: true,
      message: 'Compilation successful',
      packageId,
      downloadLinks
    });

  } catch (error) {
    // Handle any other errors in the overall process
    console.error('❌ Error processing compilation:', error);
    res.status(500).json({ 
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
  console.log(`[DA1] Request body formats: ${req.body.formats || 'none'}`);
  
  try {
    // Validate that files were uploaded
    if (!req.files || req.files.length === 0) {
      console.error('[DA1] No files were uploaded');
      return res.status(400).json({
        success: false,
        message: 'No files were uploaded'
      });
      const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '../output');

// GET route to list files in the output directory
router.get('/download-links', (req, res) => {
  fs.readdir(OUTPUT_DIR, (err, files) => {
    if (err) {
      console.error('❌ Error reading output directory:', err);
      return res.status(500).json({ error: 'Failed to read output directory' });
    }

    const links = files.map(file => ({
      filename: file,
      url: `/downloads/${file}`
    }));

    res.json({ files: links });
  });
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
      genre: req.body.genre || '',
      composer: req.body.composer || '',
      year: req.body.year || '',
      comment: req.body.comment || ''
    };
    
    // Parse formats from request or use default
    let formats = ['mp3']; // Default to MP3 if no formats specified
    if (req.body.formats) {
      try {
        // Try to parse JSON array of formats
        formats = JSON.parse(req.body.formats);
      } catch (e) {
        // If parsing fails, treat as comma-separated string
        formats = req.body.formats.split(',').map(f => f.trim());
      }
    }
    
    // Process the files using the DA1 service
    const result = await da1Service.processDA1(req.files, metadata, formats);
    
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
    
    // Check for specific error types
    if (error.message.includes('ffmpeg')) {
      console.error('[DA1] FFmpeg error detected - check FFmpeg installation and permissions');
    } else if (error.message.includes('ENOENT')) {
      console.error('[DA1] File not found error - check paths and file existence');
    } else if (error.message.includes('permission')) {
      console.error('[DA1] Permission error - check file/directory permissions');
    }
    
    res.status(500).json({
      success: false,
      message: 'Error processing files',
      error: error.message
    });
  }



});

// end section 2: route definitions

// ==========================================
// START SECTION 3: AUDIO PROCESSING FUNCTIONS
// ==========================================

/**
 * Process an audio file with ffmpeg
 * 
 * @param {string} inputPath - Path to the input audio file
 * @param {string} outputPath - Path for the converted output file
 * @param {string} format - Target audio format (mp3, wav, etc.)
 * @param {object} metadata - Audio metadata (title, artist, etc.)
 * @returns {Promise} - Resolves when processing is complete
 */

// ==========================================
// START SECTION 4: UTILITY FUNCTIONS
// ==========================================

/**
 * Escapes special characters in XML content
 * 
 * @param {string} unsafe - The string containing potentially unsafe XML characters
 * @returns {string} - The XML-safe string with escaped characters
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

/**
 * Check available FFmpeg capabilities
 * This helps diagnose format and codec issues
 */
function checkFFmpegCapabilities() {
  console.log('Checking FFmpeg capabilities...');
  
  // Check available formats
  ffmpeg.getAvailableFormats((err, formats) => {
    if (err) {
      console.error('Error checking formats:', err);
      return;
    }
    console.log('Available formats:', Object.keys(formats));
  });
  
  // Check available codecs
  ffmpeg.getAvailableCodecs((err, codecs) => {
    if (err) {
      console.error('Error checking codecs:', err);
      return;
    }
    console.log('Available audio codecs:', 
      Object.entries(codecs)
        .filter(([, c]) => c.type === 'audio' && c.canEncode)
        .map(([name]) => name)
    );
  });
}

// Run capability check when server starts
checkFFmpegCapabilities();

// Additional error handler for unexpected issues
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  // Keep the process running
});

// end section 4: utility functions

module.exports = router;