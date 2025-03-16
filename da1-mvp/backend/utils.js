/**
 * ==========================================
 * DA1.FM - Utilities Module
 * ==========================================
 * 
 * This module provides utility functions used throughout the application.
 * It includes helpers for security, validation, file handling, and more.
 * 
 * @author DA1.FM Team
 * @version MVP-01
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { FILE_VALIDATION } = require('./constants');
const { promisify } = require('util');
const statAsync = promisify(fs.stat);

/**
 * Sanitizes a string for use in shell commands
 * Critical security function to prevent command injection vulnerabilities
 * 
 * @param {string} input - String to sanitize
 * @return {string} - Sanitized string safe for command line arguments
 */
function sanitizeForShell(input) {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Replace single quotes with escaped single quotes for shell safety
  // This is crucial for preventing command injection attacks
  return input.replace(/'/g, "'\\''");
}

/**
 * Sanitizes string values for XML to prevent XML injection
 * Helps protect against XXE and XML injection vulnerabilities
 * 
 * @param {string} input - String to be sanitized
 * @return {string} - XML-safe string without special characters that would break XML
 */
function sanitizeForXML(input) {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Replace special XML characters with their entity equivalents
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generates a cryptographically secure unique ID
 * Used for job IDs, session tracking, and more
 * 
 * @param {number} length - Length of the ID to generate
 * @return {string} - Secure random ID
 */
function generateSecureId(length = 16) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Simple function to detect MIME type from file extension
 * 
 * @param {string} filePath - Path to the file
 * @return {string} - Detected MIME type
 */
function detectMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  
  // Common audio types
  if (ext === '.mp3') return 'audio/mpeg';
  if (['.wav', '.wave'].includes(ext)) return 'audio/wav';
  if (ext === '.flac') return 'audio/flac';
  if (['.aiff', '.aif'].includes(ext)) return 'audio/aiff';
  if (ext === '.m4a') return 'audio/mp4';
  if (ext === '.ogg') return 'audio/ogg';
  if (ext === '.aac') return 'audio/aac';
  
  // Common image types
  if (['.jpg', '.jpeg'].includes(ext)) return 'image/jpeg';
  if (ext === '.png') return 'image/png';
  if (ext === '.gif') return 'image/gif';
  if (ext === '.webp') return 'image/webp';
  
  // Default
  return 'application/octet-stream';
}

/**
 * Validates file safety based on MIME type and file extension
 * Simplified version that doesn't depend on file-type package
 * 
 * @param {string} filePath - Path to the file
 * @param {string} mimeType - Expected MIME type
 * @return {Promise<boolean>} - Whether the file is valid
 * @throws {Error} - If file validation fails
 */
async function validateFileSignature(filePath, mimeType) {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found');
    }
    
    // Get file stats to check size
    const stats = await statAsync(filePath);
    
    // Basic extension-based validation
    const detectedMimeType = detectMimeType(filePath);
    
    // For audio files
    if (FILE_VALIDATION.allowedAudioMimeTypes.includes(mimeType)) {
      if (!FILE_VALIDATION.allowedAudioMimeTypes.includes(detectedMimeType)) {
        throw new Error(`File type mismatch: expected audio but got ${detectedMimeType}`);
      }
      return true;
    }
    
    // For image files
    if (FILE_VALIDATION.allowedImageMimeTypes.includes(mimeType)) {
      if (!FILE_VALIDATION.allowedImageMimeTypes.includes(detectedMimeType)) {
        throw new Error(`File type mismatch: expected image but got ${detectedMimeType}`);
      }
      return true;
    }
    
    throw new Error(`Unsupported MIME type: ${mimeType}`);
  } catch (error) {
    throw new Error(`File validation failed: ${error.message}`);
  }
}

/**
 * Ensures a directory exists, creating it if necessary
 * 
 * @param {string} dirPath - Path to the directory
 * @return {boolean} - Whether the directory exists/was created
 */
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  return fs.existsSync(dirPath);
}

/**
 * Calculates the SHA-256 hash of a file
 * Used for integrity verification and provenance tracking
 * 
 * @param {string} filePath - Path to the file
 * @return {Promise<string>} - SHA-256 hash as hex string
 */
function calculateFileHash(filePath) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filePath)) {
      reject(new Error(`File not found: ${filePath}`));
      return;
    }
    
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    
    stream.on('error', err => reject(err));
    stream.on('data', chunk => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
  });
}

/**
 * Copies a file from source to destination with error handling
 * 
 * @param {string} sourcePath - Path to the source file
 * @param {string} destPath - Destination path
 * @return {Promise<string>} - Path to the copied file
 */
function copyFile(sourcePath, destPath) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(sourcePath)) {
      reject(new Error(`Source file not found: ${sourcePath}`));
      return;
    }
    
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    
    const readStream = fs.createReadStream(sourcePath);
    const writeStream = fs.createWriteStream(destPath);
    
    readStream.on('error', err => reject(err));
    writeStream.on('error', err => reject(err));
    writeStream.on('finish', () => resolve(destPath));
    
    readStream.pipe(writeStream);
  });
}

/**
 * Gets file information including size, MIME type, etc.
 * 
 * @param {string} filePath - Path to the file
 * @return {Promise<Object>} - File information
 */
async function getFileInfo(filePath) {
  try {
    const stats = await statAsync(filePath);
    const basename = path.basename(filePath);
    const ext = path.extname(filePath);
    
    return {
      path: filePath,
      size: stats.size,
      mimetype: detectMimeType(filePath),
      extension: ext.slice(1),
      basename: basename,
      name: basename.replace(ext, '')
    };
  } catch (error) {
    throw new Error(`Error getting file info: ${error.message}`);
  }
}

/**
 * Generates a filename based on text, ensuring it's safe for filesystems
 * 
 * @param {string} text - Text to base filename on (e.g., title)
 * @param {string} extension - File extension
 * @param {string} suffix - Optional suffix for filename
 * @return {string} - Safe filename
 */
function generateSafeFilename(text, extension, suffix = '') {
  // Create safe filename: lowercase, replace spaces with underscores, remove special chars
  const safeText = String(text)
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 128); // Limit length
  
  return `${safeText}${suffix}.${extension}`;
}

/**
 * Logs application events with timestamps and levels
 * 
 * @param {string} message - Message to log
 * @param {string} level - Log level ('info', 'warn', 'error', 'debug')
 * @param {Object} data - Additional data to log
 */
function log(message, level = 'info', data = {}) {
  const timestamp = new Date().toISOString();
  const logData = { timestamp, level, message };
  
  if (Object.keys(data).length > 0) {
    logData.data = data;
  }
  
  // In production, we might use a proper logging library
  if (level === 'error') {
    console.error(JSON.stringify(logData));
  } else if (level === 'warn') {
    console.warn(JSON.stringify(logData));
  } else if (level === 'debug') {
    if (process.env.DEBUG) {
      console.debug(JSON.stringify(logData));
    }
  } else {
    console.log(JSON.stringify(logData));
  }
}

// Export all utility functions
module.exports = {
  sanitizeForShell,
  sanitizeForXML,
  generateSecureId,
  validateFileSignature,
  ensureDirectoryExists,
  calculateFileHash,
  copyFile,
  getFileInfo,
  generateSafeFilename,
  log
};