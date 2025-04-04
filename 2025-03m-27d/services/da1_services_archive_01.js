/**
 * DA1 Services Module
 * Version: MVP-03 Launch Ready
 * Author: Dainis Michel + AI Collaborator
 * Description: Handles audio processing, metadata embedding, and package generation
 * Location: /da1-mvp-03/services/da1_services.js
 */

// Core Node.js modules
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const { v4: uuidv4 } = require('uuid');

// Logger functions - using relative path to logger.js in same directory
const logger = require('./logger');
const createLogFilePath = logger.createLogFilePath;
const log = logger.log;

// FFmpeg binary path - relative to this file
const ffmpegStatic = path.join(__dirname, '..', 'tools', 'ffmpeg', 'ffmpeg');

// Supported audio formats and their FFmpeg settings
const AUDIO_FORMATS = {
  mp3: { codec: 'libmp3lame', bitrate: '320k', ext: '.mp3' },
  flac: { codec: 'flac', bitrate: null, ext: '.flac' },
  wav: { codec: 'pcm_s16le', bitrate: null, ext: '.wav' }
};

// Base output directory - relative to this file
const BASE_OUTPUT_DIR = path.join(__dirname, '..', 'output');

// ===========================================
// processDA1 FUNCTION
// ===========================================
async function processDA1(files, formats, metadata) {
  const originalFilename = files[0].originalname || 'da1neverblanktitle';
  const titleField = metadata.title ? metadata.title.replace(/\s+/g, '_').toLowerCase() : 'da1neverblanktitle';

  // Create log file path
  const logFilePath = createLogFilePath(originalFilename, titleField);
  log(`🟢 processDA1() STARTED`, logFilePath);
  log(`🟦 Original filename: ${originalFilename}`, logFilePath);
  log(`🟦 Title field: ${titleField}`, logFilePath);
  log(`🟦 Formats: ${JSON.stringify(formats)}`, logFilePath);

  if (!files || files.length === 0) {
    log('❌ No input files provided', logFilePath);
    throw new Error('No input files provided');
  }

  const packageTimestamp = Date.now();
  const packageDir = path.join(BASE_OUTPUT_DIR, `package_${packageTimestamp}`);
  fs.mkdirSync(packageDir, { recursive: true });

  log(`📁 Created output directory: ${packageDir}`, logFilePath);

  const manifestPath = path.join(packageDir, `DA1_Package_${packageTimestamp}.da1`);
  fs.writeFileSync(manifestPath, 'DA1 Package Manifest\n');

  log(`✅ Created manifest file: ${manifestPath}`, logFilePath);

  const outputFiles = [];
  const downloadLinks = [];

  // Add manifest file to download links
  downloadLinks.push({
    filename: path.basename(manifestPath),
    path: `/output/package_${packageTimestamp}/${path.basename(manifestPath)}`
  });

  for (const file of files) {
    const inputFilePath = file.path;

    if (!fs.existsSync(inputFilePath)) {
      log(`❌ Input file does not exist: ${inputFilePath}`, logFilePath);
      continue;
    }

    for (const format of formats) {
      const settings = AUDIO_FORMATS[format];
      if (!settings) {
        log(`❌ Unsupported format: ${format}`, logFilePath);
        continue;
      }

      const outputFilename = `${path.basename(file.originalname, path.extname(file.originalname))}_${format}_${packageTimestamp}${settings.ext}`;
      const outputFilePath = path.join(packageDir, outputFilename);

      try {
        await processAudioFile(inputFilePath, outputFilePath, format, metadata, logFilePath);
        outputFiles.push(outputFilePath);
        
        // Add to download links
        downloadLinks.push({
          filename: outputFilename,
          path: `/output/package_${packageTimestamp}/${outputFilename}`
        });
      } catch (err) {
        log(`❌ Error processing ${inputFilePath} to ${format}: ${err.message}`, logFilePath);
      }
    }
  }

  log(`✅ All processing complete`, logFilePath);

  return {
    packageDir,
    manifestPath,
    outputFiles,
    packageId: `package_${packageTimestamp}`,
    downloadLinks
  };
}

// ===========================================
// processAudioFile FUNCTION
// ===========================================
async function processAudioFile(inputPath, outputPath, format, metadata, logFilePath) {
  return new Promise(function(resolve, reject) {
    log(`🎵 processAudioFile FUNCTION CALLED`, logFilePath);
    log(`   ⮡ Input path: ${inputPath}`, logFilePath);
    log(`   ⮡ Output path: ${outputPath}`, logFilePath);
    log(`   ⮡ Format: ${format}`, logFilePath);
    log(`   ⮡ Metadata: ${JSON.stringify(metadata)}`, logFilePath);

    const settings = AUDIO_FORMATS[format];
    if (!settings) {
      const msg = `Unsupported audio format: ${format}`;
      log(`❌ ${msg}`, logFilePath);
      return reject(new Error(msg));
    }

    // Path to default cover art - relative to current file
    const coverArtPath = path.join(__dirname, '..', 'resources', 'elements', 'DA1neverBlankmetaMetaData_Cover_01.jpg');
    log(`   ⮡ Cover art path: ${coverArtPath}`, logFilePath);
    log(`   ⮡ Cover art exists: ${fs.existsSync(coverArtPath)}`, logFilePath);

    // Initialize FFmpeg command
    const command = ffmpeg(inputPath);
    
    // Set FFmpeg path
    command.setFfmpegPath(ffmpegStatic);
    
    // Set audio settings
    command.audioCodec(settings.codec);
    command.audioChannels(2);
    
    // Add bitrate if specified
    if (settings.bitrate) {
      command.outputOptions('-b:a', settings.bitrate);
    }
    
    // Add metadata tags
    command.outputOptions('-metadata', `title=${metadata.title || ''}`);
    command.outputOptions('-metadata', `artist=${metadata.artist || ''}`);
    command.outputOptions('-metadata', `album=${metadata.album || ''}`);
    command.outputOptions('-metadata', `genre=${metadata.genre || ''}`);
    command.outputOptions('-id3v2_version', '3');
    
    // Add cover art if the file exists
    if (fs.existsSync(coverArtPath)) {
      command.addInput(coverArtPath);
      command.outputOptions('-map', '0:a', '-map', '1:v');
      command.outputOptions('-c:v', 'copy');
      command.outputOptions('-metadata:s:v', 'title=Album cover');
      command.outputOptions('-metadata:s:v', 'comment=Cover (front)');
    } else {
      log(`⚠️ Cover art not found at: ${coverArtPath}`, logFilePath);
    }
    
    // Set output file
    command.output(outputPath);
    
    // Add event handlers
    command.on('start', function(cmd) {
      log(`▶️ FFMPEG Command: ${cmd}`, logFilePath);
    });
    
    command.on('end', function() {
      log(`✅ Successfully processed file: ${outputPath}`, logFilePath);
      resolve(outputPath);
    });
    
    command.on('error', function(err) {
      log(`❌ FFmpeg error: ${err.message}`, logFilePath);
      reject(err);
    });

    // Run the command
    command.run();
  });
}

// Export both functions to make them available to other modules
module.exports = {
  processDA1: processDA1,
  processAudioFile: processAudioFile
};
