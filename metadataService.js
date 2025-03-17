/**
 * ==========================================
 * DA1.FM - Metadata Service Module
 * ==========================================
 * 
 * This module handles all metadata-related operations, including:
 * - Merging user metadata with defaults
 * - Generating DA1XML documents
 * - Managing cover art
 * - Ensuring metadata consistency
 * 
 * @author DA1.FM Team
 * @version MVP-01
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const { DA1neverBlankmetaMetaData, PATHS, FOLDER_STRUCTURE } = require('./constants');
const utils = require('./utils');

/**
 * Merges user-provided metadata with default values
 * Implements the DA1neverBlankmetaMetaData principle to ensure no field is ever empty
 * 
 * @param {Object} userMetadata - User-provided metadata from the form
 * @return {Object} - Complete metadata with defaults applied where needed
 */
function mergeWithDefaults(userMetadata) {
  // Start with all default values
  const mergedMetadata = { ...DA1neverBlankmetaMetaData };
  
  // Only apply user values where provided (non-empty)
  if (userMetadata) {
    Object.keys(userMetadata).forEach(key => {
      if (userMetadata[key] && String(userMetadata[key]).trim() !== '') {
        mergedMetadata[key] = String(userMetadata[key]).trim();
      }
    });
  }
  
  // Always generate a unique identifier if not provided
  if (!mergedMetadata.da1Identifier || mergedMetadata.da1Identifier.trim() === '') {
    mergedMetadata.da1Identifier = uuidv4();
  }
  
  return mergedMetadata;
}

/**
 * Handles cover art processing - either uses the provided cover or falls back to default
 * 
 * @param {Object} coverFile - Cover file object (from multer)
 * @param {string} jobId - Unique job identifier
 * @param {string} outputDir - Directory to save processed cover
 * @return {Promise<string>} - Path to the cover art file
 */
async function processCoverArt(coverFile, jobId, outputDir) {
  // If no cover file provided, use the default
  if (!coverFile) {
    const defaultCoverPath = DA1neverBlankmetaMetaData.cover_art;
    if (!fs.existsSync(defaultCoverPath)) {
      utils.log(`Default cover not found at ${defaultCoverPath}`, 'warn');
      return null;
    }
    return defaultCoverPath;
  }
  
  try {
    // For uploaded cover art, save to output directory
    const coverExt = path.extname(coverFile.originalname) || '.jpg';
    const coverFilename = `cover_${jobId}${coverExt}`;
    const coverOutputPath = path.join(outputDir, coverFilename);
    
    // Ensure output directory exists
    utils.ensureDirectoryExists(outputDir);
    
    // Validate file signature (security)
    await utils.validateFileSignature(coverFile.path, coverFile.mimetype);
    
    // Copy cover to output dir
    await utils.copyFile(coverFile.path, coverOutputPath);
    
    return coverOutputPath;
  } catch (error) {
    utils.log(`Error processing cover art: ${error.message}`, 'error');
    // Fall back to default cover on error
    return DA1neverBlankmetaMetaData.cover_art;
  }
}

/**
 * Generates DA1XML string based on provided metadata and selected formats
 * Creates a fully compliant DA1XML document according to the DA1XML Standard 01
 * 
 * @param {Object} metadata - User metadata merged with defaults
 * @param {Array} selectedFormats - Array of format strings selected by user
 * @param {Object} fileInfo - Information about the original input file
 * @param {Object} coverInfo - Information about the cover image file (if any)
 * @return {string} - Complete DA1XML document as string
 */
function generateDA1XML(metadata, selectedFormats, fileInfo, coverInfo = null) {
  // Ensure we have metadata by merging with defaults if needed
  const completeMetadata = metadata.da1Identifier ? metadata : mergeWithDefaults(metadata);
  
  // Sanitize all metadata values for XML safety
  const safeMetadata = {};
  Object.keys(completeMetadata).forEach(key => {
    safeMetadata[key] = utils.sanitizeForXML(String(completeMetadata[key]));
  });
  
  // Create timestamp for generation
  const timestamp = new Date().toISOString();
  
  // Calculate input file hash for provenance if file exists
  let inputFileHash = '';
  if (fileInfo && fileInfo.path && fs.existsSync(fileInfo.path)) {
    try {
      const fileBuffer = fs.readFileSync(fileInfo.path);
      const hashSum = crypto.createHash('sha256');
      hashSum.update(fileBuffer);
      inputFileHash = hashSum.digest('hex');
    } catch (error) {
      utils.log(`Error calculating file hash: ${error.message}`, 'warn');
    }
  }
  
  // Generate a safe filename base from the title
  const safeFilenameBase = safeMetadata.title
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
  
  // Start building the XML
  let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<!-- DA1XML Standard 01 - DA1.FM MVP-01 -->
<da1Package xmlns="https://da1.fm/schema/01" version="${safeMetadata.da1Version}">
  <packageInfo>
    <identifier>${safeMetadata.da1Identifier}</identifier>
    <creator>${safeMetadata.da1Creator}</creator>
    <creationDate>${safeMetadata.da1CreationDate}</creationDate>
    <generationTimestamp>${timestamp}</generationTimestamp>
  </packageInfo>
  
  <metadata>
    <title>${safeMetadata.title}</title>
    <artist>${safeMetadata.artist}</artist>
    <album>${safeMetadata.album}</album>
    <genre>${safeMetadata.genre}</genre>
    <year>${safeMetadata.year}</year>
    <composer>${safeMetadata.composer}</composer>
    <publisher>${safeMetadata.publisher}</publisher>
    <copyright>${safeMetadata.copyright}</copyright>
    <comment>${safeMetadata.comment}</comment>
  </metadata>
  
  <sourceInfo>`;
  
  // Add source file information if available
  if (fileInfo) {
    xmlContent += `
    <originalFile>
      <filename>${utils.sanitizeForXML(path.basename(fileInfo.originalname || fileInfo.name || 'unknown'))}</filename>
      <mimeType>${utils.sanitizeForXML(fileInfo.mimetype || fileInfo.type || 'unknown')}</mimeType>
      <size>${fileInfo.size || 0}</size>
      <sha256>${inputFileHash}</sha256>
    </originalFile>`;
  }
  
  // Add cover art information if available
  if (coverInfo) {
    xmlContent += `
    <coverImage>
      <filename>${utils.sanitizeForXML(path.basename(coverInfo.originalname || coverInfo.name || 'unknown'))}</filename>
      <mimeType>${utils.sanitizeForXML(coverInfo.mimetype || coverInfo.type || 'unknown')}</mimeType>
      <size>${coverInfo.size || 0}</size>
    </coverImage>`;
  }
  
  xmlContent += `
  </sourceInfo>
  
  <encodings>`;
  
  // Add entries for each selected format
  selectedFormats.forEach(format => {
    if (format === 'mp3') {
      // MP3 has both high and low quality variants
      xmlContent += `
    <encoding>
      <format>mp3</format>
      <quality>high</quality>
      <bitrate>320k</bitrate>
      <filename>${safeFilenameBase}_high.mp3</filename>
    </encoding>
    <encoding>
      <format>mp3</format>
      <quality>low</quality>
      <bitrate>128k</bitrate>
      <filename>${safeFilenameBase}_low.mp3</filename>
    </encoding>`;
    } else {
      // All other formats
      xmlContent += `
    <encoding>
      <format>${format}</format>
      <filename>${safeFilenameBase}.${format}</filename>
    </encoding>`;
    }
  });
  
  // Complete the XML
  xmlContent += `
  </encodings>
</da1Package>`;

  return xmlContent;
}

/**
 * Writes the DA1XML content to a file
 * 
 * @param {string} outputPath - Path to write the XML file
 * @param {string} xmlContent - DA1XML content to write
 * @return {Promise<string>} - Path to the written file
 */
async function writeDA1XMLFile(outputPath, xmlContent) {
  try {
    // Ensure directory exists
    const outputDir = path.dirname(outputPath);
    utils.ensureDirectoryExists(outputDir);
    
    // Write file
    fs.writeFileSync(outputPath, xmlContent, 'utf8');
    return outputPath;
  } catch (error) {
    utils.log(`Error writing DA1XML file: ${error.message}`, 'error');
    throw new Error(`Failed to write DA1XML: ${error.message}`);
  }
}

/**
 * Extracts metadata from audio file using FFprobe if available
 * Tries to auto-detect metadata from the audio file to fill in missing fields
 * 
 * @param {string} audioFilePath - Path to the audio file
 * @return {Promise<Object>} - Extracted metadata (empty object if extraction fails)
 */
async function extractMetadataFromAudio(audioFilePath) {
  try {
    // This is a placeholder for future functionality
    // In the future, we could use FFprobe to extract metadata from audio files
    // For now, we're not implementing this as it requires additional dependencies
    
    return {};
  } catch (error) {
    utils.log(`Metadata extraction failed: ${error.message}`, 'warn');
    return {};
  }
}

/**
 * Creates a complete metadata object from user input and audio file
 * 
 * @param {Object} userMetadata - User-provided metadata
 * @param {string} audioFilePath - Path to the audio file
 * @return {Promise<Object>} - Complete metadata object
 */
async function createCompleteMetadata(userMetadata, audioFilePath) {
  try {
    // Try to extract metadata from audio file
    const extractedMetadata = await extractMetadataFromAudio(audioFilePath);
    
    // Merge in this order of precedence:
    // 1. User provided values (highest priority)
    // 2. Extracted metadata from audio file
    // 3. Default values (lowest priority)
    
    // First merge extracted with defaults
    const baseMetadata = { ...DA1neverBlankmetaMetaData, ...extractedMetadata };
    
    // Then merge user values
    const completeMetadata = mergeWithDefaults(userMetadata);
    
    // Generate a unique ID if not present
    if (!completeMetadata.da1Identifier) {
      completeMetadata.da1Identifier = uuidv4();
    }
    
    // Add current timestamp for creation date if not present
    if (!completeMetadata.da1CreationDate) {
      completeMetadata.da1CreationDate = new Date().toISOString();
    }
    
    return completeMetadata;
  } catch (error) {
    utils.log(`Error creating metadata: ${error.message}`, 'error');
    // Fall back to defaults + user metadata
    return mergeWithDefaults(userMetadata);
  }
}

/**
 * Validates metadata for completeness and correctness
 * 
 * @param {Object} metadata - Metadata to validate
 * @return {Object} - Validation result {valid: boolean, errors: Array}
 */
function validateMetadata(metadata) {
  const errors = [];
  const requiredFields = ['title', 'artist', 'album', 'genre'];
  
  // Check for required fields
  requiredFields.forEach(field => {
    if (!metadata[field] || metadata[field].trim() === '') {
      errors.push(`Missing required field: ${field}`);
    }
  });
  
  // Check for valid year format if present
  if (metadata.year && !/^\d{4}$/.test(metadata.year)) {
    errors.push('Year must be in YYYY format');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Export all functions for use in other modules
module.exports = {
  mergeWithDefaults,
  processCoverArt,
  generateDA1XML,
  writeDA1XMLFile,
  extractMetadataFromAudio,
  createCompleteMetadata,
  validateMetadata
};