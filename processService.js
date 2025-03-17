/**
 * ==========================================
 * DA1.FM - Process Service Module
 * ==========================================
 * 
 * This module orchestrates the entire processing pipeline:
 * - Coordinates between metadata, embed, and package services
 * - Handles input validation and file checking
 * - Manages job progress and tracking
 * - Provides a unified interface for the API
 * 
 * @author DA1.FM Team
 * @version MVP-01
 */

const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const statAsync = promisify(fs.stat);
const { FILE_VALIDATION, SUPPORTED_FORMATS, PATHS } = require('./constants');
const metadataService = require('./metadataService');
const embedService = require('./embedService');
const packageService = require('./packageService');
const utils = require('./utils');

/**
 * Validates an input file based on size and MIME type
 * Critical security function to prevent malicious uploads
 * 
 * @param {Object} file - File object from multer
 * @param {string} fileType - Type of file ('audio' or 'image')
 * @return {Promise<boolean>} - Whether file is valid
 * @throws {Error} - If file is invalid
 */
async function validateFile(file, fileType) {
  // Check if file exists (audio is required, image is optional)
  if (!file) {
    return fileType === 'audio' ? false : true;
  }
  
  // Check if file path exists
  const filePath = file.path || file.filepath || (file.file && file.file.path);
  if (!filePath || !fs.existsSync(filePath)) {
    throw new Error(`${fileType} file not found on disk`);
  }
  
  // Check file size
  const maxSize = fileType === 'audio' 
    ? FILE_VALIDATION.maxAudioSize 
    : FILE_VALIDATION.maxImageSize;
  
  const fileSize = file.size || (await statAsync(filePath)).size;
  
  if (fileSize > maxSize) {
    throw new Error(`${fileType} file exceeds maximum size of ${maxSize / (1024 * 1024)}MB`);
  }
  
  // Check MIME type
  const fileMimeType = file.mimetype || file.type;
  const allowedMimeTypes = fileType === 'audio'
    ? FILE_VALIDATION.allowedAudioMimeTypes
    : FILE_VALIDATION.allowedImageMimeTypes;
  
  if (fileMimeType && !allowedMimeTypes.includes(fileMimeType)) {
    throw new Error(`Invalid ${fileType} file type: ${fileMimeType}`);
  }
  
  // Enhanced security: validate file signature (actual content type)
  try {
    await utils.validateFileSignature(filePath, fileMimeType);
  } catch (error) {
    throw new Error(`File signature validation failed: ${error.message}`);
  }
  
  return true;
}

/**
 * Generates a unique job ID for tracking processing
 * 
 * @return {string} - Unique job identifier
 */
function generateJobId() {
  return `job_${Date.now()}_${utils.generateSecureId(8)}`;
}

/**
 * Ensures requested formats are valid and supported
 * 
 * @param {Array} requestedFormats - Array of format strings
 * @return {Array} - Array of validated formats
 */
function validateFormats(requestedFormats) {
  if (!requestedFormats || !Array.isArray(requestedFormats) || requestedFormats.length === 0) {
    // Default to MP3 and FLAC if no formats specified
    return ['mp3', 'flac'];
  }
  
  // Filter out any unsupported formats
  return requestedFormats.filter(format => 
    typeof format === 'string' && 
    SUPPORTED_FORMATS.hasOwnProperty(format.toLowerCase())
  ).map(format => format.toLowerCase());
}

/**
 * Processes an audio file to create a complete DA1 package
 * Main entry point for the DA1.FM processing workflow
 * 
 * @param {Object} options - Processing options
 * @param {Object} options.audioFile - Audio file object
 * @param {Object} options.coverFile - Cover image file object (optional)
 * @param {Object} options.metadata - User-provided metadata
 * @param {Array} options.formats - Array of selected audio formats
 * @param {string} options.outputDir - Directory for output files (optional)
 * @param {function} options.progressCallback - Function to call with progress updates (optional)
 * @return {Promise<Object>} - Information about created files and paths
 */
async function processAudio(options) {
  // Extract options with defaults
  const { 
    audioFile, 
    coverFile = null, 
    metadata = {}, 
    formats = ['mp3', 'flac'],
    outputDir = PATHS.output,
    progressCallback = null
  } = options;
  
  // Optional progress reporting function
  const reportProgress = (message, percent = null) => {
    if (progressCallback && typeof progressCallback === 'function') {
      progressCallback({ message, percent });
    }
    utils.log(message, 'info');
  };
  
  try {
    reportProgress('Starting audio processing...', 0);
    
    // Step 1: Validate input files
    reportProgress('Validating input files...', 5);
    await validateFile(audioFile, 'audio');
    if (coverFile) {
      await validateFile(coverFile, 'image');
    }
    
    // Step 2: Create job-specific output directory
    const jobId = generateJobId();
    const jobOutputDir = path.join(outputDir, jobId);
    utils.ensureDirectoryExists(jobOutputDir);
    
    reportProgress('Creating job workspace...', 10);
    
    // Step 3: Merge metadata with defaults
    reportProgress('Processing metadata...', 15);
    const completeMetadata = await metadataService.createCompleteMetadata(metadata, audioFile.path);
    
    // Step 4: Process cover art
    reportProgress('Processing cover art...', 20);
    const coverFilePath = await metadataService.processCoverArt(
      coverFile, 
      jobId, 
      path.join(jobOutputDir, 'temp')
    );
    
    // Step 5: Validate formats
    reportProgress('Validating selected formats...', 25);
    const validatedFormats = validateFormats(formats);
    if (validatedFormats.length === 0) {
      throw new Error('No valid formats selected for processing');
    }
    
    // Step 6: Generate DA1XML
    reportProgress('Generating DA1XML metadata...', 30);
    const xmlContent = metadataService.generateDA1XML(
      completeMetadata,
      validatedFormats,
      audioFile,
      coverFile
    );
    
    // Step 7: Process audio for each selected format in parallel
    reportProgress(`Processing audio into ${validatedFormats.length} formats...`, 35);
    const tempOutputDir = path.join(jobOutputDir, 'temp');
    utils.ensureDirectoryExists(tempOutputDir);
    
    const processedFiles = await embedService.processFormatsParallel(
      audioFile.path,
      tempOutputDir,
      coverFilePath,
      completeMetadata,
      validatedFormats
    );
    
    reportProgress('Audio processing complete', 75);
    
    if (processedFiles.length === 0) {
      throw new Error('Failed to process any audio formats');
    }
    
    // Step 8: Build DA1 package
    reportProgress('Building DA1 folder structure...', 80);
    const packageResult = await packageService.buildDA1Package({
      outputDir: jobOutputDir,
      title: completeMetadata.title,
      xmlContent,
      audioFiles: processedFiles,
      coverFile: coverFilePath
    });
    
    reportProgress('Generating integrity hashes...', 90);
    
    // Step 9: Get package information
    const packageInfo = await packageService.getPackageInfo(packageResult.da1FolderPath);
    
    // Step 10: Clean up temporary files
    reportProgress('Cleaning up temporary files...', 95);
    if (fs.existsSync(tempOutputDir)) {
      // In production, we would delete the temp directory here
      // For development, we'll keep it for debugging
      // fs.rmSync(tempOutputDir, { recursive: true, force: true });
    }
    
    reportProgress('DA1 package creation complete!', 100);
    
    // Return comprehensive result object
    return {
      success: true,
      jobId,
      outputDir: jobOutputDir,
      da1Folder: packageResult.da1FolderPath,
      da1FolderName: path.basename(packageResult.da1FolderPath),
      metadataFile: packageResult.metadataPath,
      hashesFile: packageResult.hashesPath,
      formats: validatedFormats,
      processedFormats: [...new Set(processedFiles.map(file => file.format))],
      processedFiles: processedFiles.length,
      packageInfo,
      individualFiles: processedFiles.map(file => ({
        format: file.format,
        quality: file.quality,
        filename: file.filename,
        path: path.join(jobOutputDir, file.filename)
      }))
    };
  } catch (error) {
    utils.log(`Error in audio processing: ${error.message}`, 'error');
    throw error;
  }
}

// Export functions for use in other modules
module.exports = {
  processAudio,
  validateFile,
  validateFormats,
  generateJobId
};