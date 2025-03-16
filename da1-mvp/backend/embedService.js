/**
 * ==========================================
 * DA1.FM - Embed Service Module
 * ==========================================
 * 
 * This module handles all audio processing operations, including:
 * - Converting between audio formats
 * - Embedding metadata using FFmpeg
 * - Managing audio quality settings
 * - Parallel processing for performance
 * 
 * @author DA1.FM Team
 * @version MVP-01
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { SUPPORTED_FORMATS, PATHS } = require('./constants');
const utils = require('./utils');

/**
 * Generates a filename based on the title and format
 * Creates consistent, sanitized filenames across all generated files
 * 
 * @param {string} title - Track title
 * @param {string} format - Audio format (mp3, flac, etc.)
 * @param {string} suffix - Additional suffix (_high, _low, etc.)
 * @return {string} - Generated safe filename
 */
function generateFilename(title, format, suffix = '') {
  return utils.generateSafeFilename(title, format, suffix);
}

/**
 * Executes FFmpeg command to embed metadata and convert audio
 * Core function that handles the actual audio processing with security measures
 * 
 * @param {string} inputPath - Path to input audio file
 * @param {string} outputPath - Path for the output file
 * @param {string} coverPath - Path to cover image (optional)
 * @param {Object} metadata - Audio metadata to embed
 * @param {Object} formatOptions - Encoding options for the specific format
 * @return {Promise} - Resolves when conversion completes with output info
 */
function runFFmpegCommand(inputPath, outputPath, coverPath, metadata, formatOptions) {
  return new Promise((resolve, reject) => {
    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    utils.ensureDirectoryExists(outputDir);
    
    // Base FFmpeg arguments
    const args = ['-y']; // Overwrite output files without asking
    
    // Input validation
    if (!fs.existsSync(inputPath)) {
      return reject(new Error(`Input file not found: ${inputPath}`));
    }
    
    // Add input file
    args.push('-i', inputPath);
    
    // Add cover art if provided and file exists
    let hasCoverArt = false;
    if (coverPath && fs.existsSync(coverPath)) {
      args.push('-i', coverPath);
      args.push('-map', '0:0', '-map', '1:0'); // Map audio from first input, image from second
      args.push('-metadata:s:v', 'title=Album cover', '-metadata:s:v', 'comment=Cover (front)');
      hasCoverArt = true;
    } else {
      args.push('-map', '0:0'); // Just map audio from input
    }
    
    // Add encoding parameters based on format
    if (formatOptions.codec) {
      args.push('-c:a', formatOptions.codec);
    }
    
    if (formatOptions.bitrate) {
      args.push('-b:a', formatOptions.bitrate);
    }
    
    if (formatOptions.compression) {
      args.push('-compression_level', formatOptions.compression);
    }
    
    if (formatOptions.quality) {
      args.push('-q:a', formatOptions.quality);
    }
    
    // For MP3, ensure ID3v2 version is set
    if (formatOptions.extension === 'mp3') {
      args.push('-id3v2_version', '3');
    }
    
    // Add all metadata as key-value pairs
    Object.keys(metadata).forEach(key => {
      // Skip non-string values and internal properties
      if (metadata[key] && 
          typeof metadata[key] === 'string' && 
          metadata[key].trim() !== '' &&
          !key.startsWith('da1') &&  // Skip DA1-specific metadata
          key !== 'cover_art') {     // Skip cover_art path
        
        // Sanitize both key and value
        const safeKey = utils.sanitizeForShell(key);
        const safeValue = utils.sanitizeForShell(metadata[key]);
        
        args.push('-metadata', `${safeKey}=${safeValue}`);
      }
    });
    
    // Output file
    args.push(outputPath);
    
    utils.log(`Running FFmpeg with command: ffmpeg ${args.join(' ')}`, 'debug');
    
    // Spawn FFmpeg process - using spawn for security instead of exec
    const ffmpeg = spawn('ffmpeg', args);
    
    let stdoutData = '';
    let stderrData = '';
    
    ffmpeg.stdout.on('data', (data) => {
      stdoutData += data;
    });
    
    ffmpeg.stderr.on('data', (data) => {
      stderrData += data;
      // Uncomment for detailed FFmpeg logs
      // utils.log(`FFmpeg: ${data}`, 'debug');
    });
    
    ffmpeg.on('close', (code) => {
      if (code === 0) {
        resolve({
          success: true,
          outputPath,
          hasCoverArt,
          format: formatOptions.extension,
          quality: formatOptions.suffix ? formatOptions.suffix.replace('_', '') : 'standard'
        });
      } else {
        reject(new Error(`FFmpeg process exited with code ${code}: ${stderrData}`));
      }
    });
    
    ffmpeg.on('error', (err) => {
      reject(new Error(`Failed to start FFmpeg process: ${err.message}`));
    });
  });
}

/**
 * Processes an audio file into a specific format
 * Handles the creation of a single format variant
 * 
 * @param {string} inputFile - Path to input audio file
 * @param {string} outputDir - Directory for output files
 * @param {string} coverFile - Path to cover image (optional)
 * @param {Object} metadata - Audio metadata to embed
 * @param {string} format - Format to convert to (mp3, flac, etc.)
 * @return {Promise<Array>} - Resolves with array of paths to generated files
 */
async function processFormat(inputFile, outputDir, coverFile, metadata, format) {
  try {
    utils.log(`Processing format: ${format}`, 'info');
    
    // Validate inputs
    if (!fs.existsSync(inputFile)) {
      throw new Error(`Input file not found: ${inputFile}`);
    }
    
    // Ensure output directory exists
    utils.ensureDirectoryExists(outputDir);
    
    const results = [];
    const formatConfig = SUPPORTED_FORMATS[format];
    
    if (!formatConfig) {
      throw new Error(`Unsupported format: ${format}`);
    }
    
    // Handle MP3 specially since it has high and low quality variants
    if (format === 'mp3') {
      // High quality MP3
      const highQualityConfig = formatConfig.highQuality;
      const highQualityFilename = generateFilename(metadata.title, highQualityConfig.extension, highQualityConfig.suffix);
      const highQualityOutputPath = path.join(outputDir, highQualityFilename);
      
      const highQualityResult = await runFFmpegCommand(
        inputFile,
        highQualityOutputPath,
        coverFile,
        metadata,
        highQualityConfig
      );
      
      results.push({
        format: 'mp3',
        quality: 'high',
        filePath: highQualityOutputPath,
        filename: highQualityFilename,
        ...highQualityResult
      });
      
      // Low quality MP3
      const lowQualityConfig = formatConfig.lowQuality;
      const lowQualityFilename = generateFilename(metadata.title, lowQualityConfig.extension, lowQualityConfig.suffix);
      const lowQualityOutputPath = path.join(outputDir, lowQualityFilename);
      
      const lowQualityResult = await runFFmpegCommand(
        inputFile,
        lowQualityOutputPath,
        coverFile,
        metadata,
        lowQualityConfig
      );
      
      results.push({
        format: 'mp3',
        quality: 'low',
        filePath: lowQualityOutputPath,
        filename: lowQualityFilename,
        ...lowQualityResult
      });
    } else {
      // All other formats - single quality
      const filename = generateFilename(metadata.title, formatConfig.extension, formatConfig.suffix);
      const outputPath = path.join(outputDir, filename);
      
      const result = await runFFmpegCommand(
        inputFile,
        outputPath,
        coverFile,
        metadata,
        formatConfig
      );
      
      results.push({
        format,
        filePath: outputPath,
        filename,
        ...result
      });
    }
    
    return results;
  } catch (error) {
    utils.log(`Error processing format ${format}: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Processes an audio file into multiple formats in parallel
 * Uses Promise.all for improved performance over sequential processing
 * 
 * @param {string} inputFile - Path to input audio file
 * @param {string} outputDir - Directory for output files
 * @param {string} coverFile - Path to cover image (optional)
 * @param {Object} metadata - Audio metadata to embed
 * @param {Array} formats - Array of formats to process
 * @return {Promise<Array>} - Resolves with array of results for all formats
 */
async function processFormatsParallel(inputFile, outputDir, coverFile, metadata, formats) {
  // Validate formats
  const validFormats = formats.filter(format => SUPPORTED_FORMATS.hasOwnProperty(format));
  
  if (validFormats.length === 0) {
    throw new Error('No valid formats selected for processing');
  }
  
  utils.log(`Processing ${validFormats.length} formats in parallel: ${validFormats.join(', ')}`, 'info');
  
  // Create an array of promises, one for each format
  const formatPromises = validFormats.map(format => 
    processFormat(inputFile, outputDir, coverFile, metadata, format)
  );
  
  // Process all formats in parallel
  try {
    const results = await Promise.all(formatPromises);
    
    // Flatten the array of arrays
    return results.flat();
  } catch (error) {
    utils.log(`Error in parallel format processing: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Gets a detailed description of the metadata embedded in a format
 * Provides human-readable information about embedded metadata fields
 * 
 * @param {string} format - Audio format
 * @return {string} - Description of embedded metadata
 */
function getFormatDescription(format) {
  if (format === 'mp3') {
    return SUPPORTED_FORMATS.mp3.highQuality.description;
  } else if (SUPPORTED_FORMATS[format] && SUPPORTED_FORMATS[format].description) {
    return SUPPORTED_FORMATS[format].description;
  }
  
  // Default descriptions if not found in constants
  const descriptions = {
    flac: "Lossless audio format with Vorbis Comments metadata",
    wav: "Uncompressed audio with BWF/RIFF metadata chunks",
    aiff: "Uncompressed audio with ID3 tags",
    m4a: "AAC audio in MP4 container with iTunes metadata atoms",
    ogg: "Vorbis audio with Vorbis Comments metadata",
    aac: "Advanced Audio Coding with embedded metadata",
    alac: "Apple Lossless Audio Codec with iTunes metadata"
  };
  
  return descriptions[format] || `${format.toUpperCase()} format with embedded metadata`;
}

/**
 * Validates if FFmpeg is installed and available
 * 
 * @return {Promise<boolean>} - Whether FFmpeg is available
 */
async function validateFFmpegInstallation() {
  return new Promise((resolve) => {
    const ffmpeg = spawn('ffmpeg', ['-version']);
    
    ffmpeg.on('close', (code) => {
      resolve(code === 0);
    });
    
    ffmpeg.on('error', () => {
      resolve(false);
    });
  });
}

// Export all functions for use in other modules
module.exports = {
  generateFilename,
  processFormat,
  processFormatsParallel,
  getFormatDescription,
  validateFFmpegInstallation
};