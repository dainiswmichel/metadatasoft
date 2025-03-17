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
const ffmpegStatic = require('ffmpeg-static');

// ==========================================
// START SECTION 1: CONFIGURATION AND SETUP
// ==========================================

// Set ffmpeg path to the static binary provided by ffmpeg-static
ffmpeg.setFfmpegPath(ffmpegStatic);
console.log(`FFmpeg configured with path: ${ffmpegStatic}`);

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
router.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'DA1 Backend is running' });
});

/**
 * Main compilation API endpoint
 * Accepts audio files and metadata, processes files into requested formats
 */
router.post('/api/compile', upload.array('files'), async (req, res) => {
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
    const outputDir = path.join(__dirname, 'output', packageId);
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
              processAudioFile(file.path, outputPath, format, metadata)
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
async function processAudioFile(inputPath, outputPath, format, metadata) {
  return new Promise((resolve, reject) => {
    console.log(`Processing ${inputPath} to ${format} format...`);
    
    // --------------------------------
    // 3.1 Input validation and preparation
    // --------------------------------
    
    // Check if input file exists and is accessible
    if (!fs.existsSync(inputPath)) {
      console.error(`❌ Input file does not exist: ${inputPath}`);
      return reject(new Error(`Input file does not exist: ${inputPath}`));
    }
    
    // Check if output directory exists and is writable
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      console.log(`Creating output directory: ${outputDir}`);
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Check if cover art exists
    const coverArtExists = fs.existsSync(defaultCoverArtPath);
    if (coverArtExists) {
      console.log(`✅ Found cover art at: ${defaultCoverArtPath}`);
    } else {
      console.log(`⚠️ Cover art not found at: ${defaultCoverArtPath}`);
    }
    
    // Log file details for debugging
    try {
      const fileStats = fs.statSync(inputPath);
      console.log(`Input file size: ${fileStats.size} bytes`);
    } catch (err) {
      console.error(`❌ Error getting file stats: ${err.message}`);
    }
    
    // --------------------------------
    // 3.2 Create FFmpeg command
    // --------------------------------
    
    // Create basic ffmpeg command for the input file
    let command = ffmpeg(inputPath);
    
    // Set reasonable timeout for larger files (5 minutes)
    command = command.timeout(300000);
    
    // Handle cover art for supported formats
    if (coverArtExists && ['mp3', 'flac', 'm4a', 'ogg'].includes(format)) {
      // Add the cover art as an input
      command = command.addInput(defaultCoverArtPath);
      console.log(`✅ Added cover art as input`);
    }
    
    // Set output format
    command = command.outputFormat(format);
    console.log(`✅ Set output format to ${format}`);
    
    // --------------------------------
    // 3.3 Add metadata and format-specific settings
    // --------------------------------
    
    // Add metadata based on format
    if (['mp3', 'flac', 'm4a', 'ogg', 'aac'].includes(format)) {
      command = command
        .outputOptions('-metadata', `title=${metadata.title || 'Unknown Title'}`)
        .outputOptions('-metadata', `artist=${metadata.artist || 'Unknown Artist'}`)
        .outputOptions('-metadata', `album=${metadata.album || 'Unknown Album'}`)
        .outputOptions('-metadata', `genre=${metadata.genre || 'Unknown Genre'}`);
      console.log(`✅ Added metadata to output`);
      
      // Add cover art mapping for supported formats
      if (coverArtExists) {
        if (format === 'mp3') {
          // MP3 cover art settings
          command = command
            .outputOptions('-map', '0:a')
            .outputOptions('-map', '1:v')
            .outputOptions('-c:v', 'copy')
            .outputOptions('-id3v2_version', '3')
            .outputOptions('-metadata:s:v', 'title=Album cover')
            .outputOptions('-metadata:s:v', 'comment=Cover (front)');
          console.log(`✅ Added cover art mapping for MP3`);
        } else if (['flac', 'm4a', 'ogg'].includes(format)) {
          // Cover art settings for other formats
          command = command
            .outputOptions('-map', '0:a')
            .outputOptions('-map', '1:v')
            .outputOptions('-c:v', 'copy')
            .outputOptions('-disposition:v', 'attached_pic');
          console.log(`✅ Added cover art mapping for ${format}`);
        }
      }
    }
    
    // Format-specific optimizations
    console.log(`Applying format-specific optimizations for ${format}`);
    
    // Each format gets specific codec, bitrate, and channel settings
    if (format === 'mp3') {
      // MP3 format settings - 320kbps stereo
      command = command
        .audioCodec('libmp3lame')  // Explicitly set codec to ensure it works
        .audioBitrate('320k')
        .audioChannels(2);
      console.log(`✅ Applied MP3 optimizations`);
    } else if (format === 'flac') {
      // FLAC format settings - lossless with compression level 5
      command = command
        .audioQuality(5)  // Compression level (0-10)
        .audioChannels(2);
      console.log(`✅ Applied FLAC optimizations`);
    } else if (format === 'wav') {
      // WAV format settings - 16-bit PCM
      command = command
        .audioCodec('pcm_s16le')
        .audioChannels(2);
      console.log(`✅ Applied WAV optimizations`);
    } else if (format === 'm4a') {
      // M4A format settings - AAC in MP4 container
      command = command
        .outputOptions('-f', 'mp4')  // Container format
        .audioCodec('aac')          // Codec
        .audioBitrate('256k')       // Bitrate
        .audioChannels(2);
      console.log(`✅ Applied M4A optimizations`);
    } else if (format === 'aac') {
      // AAC format settings - raw AAC
      command = command
        .outputOptions('-f', 'adts') // Container format for raw AAC
        .audioCodec('aac')
        .audioBitrate('256k')
        .audioChannels(2);
      console.log(`✅ Applied AAC optimizations`);
    } else if (format === 'ogg') {
      // OGG format settings - Vorbis codec
      command = command
        .audioCodec('libvorbis')
        .audioBitrate('192k')
        .audioChannels(2);
      console.log(`✅ Applied OGG optimizations`);
    } else if (format === 'aiff') {
      // AIFF format settings - 16-bit big-endian PCM
      command = command
        .audioCodec('pcm_s16be')
        .audioChannels(2);
      console.log(`✅ Applied AIFF optimizations`);
    } else if (format === 'alac') {
      // ALAC (Apple Lossless) format settings
      command = command
        .outputOptions('-f', 'ipod') // Container similar to M4A
        .audioCodec('alac')          // Apple Lossless codec
        .audioChannels(2);
      console.log(`✅ Applied ALAC optimizations`);
    }
    
    // --------------------------------
    // 3.4 Execute command with detailed event handling
    // --------------------------------
    
    console.log(`✅ Starting ffmpeg command for ${format}`);
    
    // Add event listeners for detailed progress and error reporting
    command
      // Log the exact command being executed
      .on('start', (commandLine) => {
        console.log(`✅ ffmpeg command: ${commandLine}`);
      })
      // Log progress during processing
      .on('progress', (progress) => {
        if (progress.percent) {
          console.log(`Processing: ${Math.floor(progress.percent)}% done`);
        }
      })
      // Handle errors with detailed logging
      .on('error', (err, stdout, stderr) => {
        console.error(`❌ Error processing ${format} file:`, err.message);
        if (stderr) {
          console.error(`❌ ffmpeg stderr: ${stderr}`);
        }
        
        // Check for specific error patterns
        if (err.message.includes('not available')) {
          reject(new Error(`Output format ${format} is not available in your ffmpeg build`));
        } else if (err.message.includes('No such file')) {
          reject(new Error(`File not found or inaccessible: ${err.message}`));
        } else if (err.message.includes('Permission denied')) {
          reject(new Error(`Permission denied when accessing files: ${err.message}`));
        } else {
          reject(err);
        }
      })
      // Handle successful completion
      .on('end', () => {
        // Verify the output file exists and has content
        try {
          if (fs.existsSync(outputPath)) {
            const outStats = fs.statSync(outputPath);
            if (outStats.size > 0) {
              console.log(`✅ Successfully processed ${format} file: ${outputPath} (${outStats.size} bytes)`);
              resolve();
            } else {
              console.error(`❌ Output file exists but is empty: ${outputPath}`);
              reject(new Error('Output file is empty'));
            }
          } else {
            console.error(`❌ Output file was not created: ${outputPath}`);
            reject(new Error('Output file was not created'));
          }
        } catch (err) {
          console.error(`❌ Error verifying output file: ${err.message}`);
          reject(new Error(`Error verifying output file: ${err.message}`));
        }
      })
      // Save the output to the specified path
      .save(outputPath);
  });
}

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