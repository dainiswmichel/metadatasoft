/**
 * DA1 Logger Module
 * Version: MVP-03 Launch Ready
 * Author: Dainis Michel + AI Collaborator
 * Description: Handles logging for DA1 Media Compilation System
 * Location: /da1-mvp-03/services/logger.js
 */

// Core Node.js modules
const path = require('path');
const fs = require('fs');

// LOGS DIRECTORY - relative to this file (in /services)
const logsDirectory = path.join(__dirname, '..', 'logs');

// Ensure the logs directory exists
if (!fs.existsSync(logsDirectory)) {
  fs.mkdirSync(logsDirectory, { recursive: true });
  console.log(`✅ Created logs directory: ${logsDirectory}`);
} else {
  console.log(`✅ Logs directory exists: ${logsDirectory}`);
}

/**
 * Get formatted timestamp in YYYYy-MMm-DDd-HHh-MMm-SSs
 * @returns {string} Formatted timestamp string
 */
function getTimestampForFilename() {
  const now = new Date();

  const YYYY = now.getFullYear();
  const MM = String(now.getMonth() + 1).padStart(2, '0');
  const DD = String(now.getDate()).padStart(2, '0');
  const HH = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const SS = String(now.getSeconds()).padStart(2, '0');

  return `${YYYY}y-${MM}m-${DD}d-${HH}h-${mm}m-${SS}s`;
}

/**
 * Create log filename in the exact required format
 * @param {string} originalFilename - The uploaded file name
 * @param {string} titleField - The title metadata field (optional)
 * @returns {string} The complete log file path
 */
function createLogFilePath(originalFilename, titleField) {
  // Clean up originalFilename
  const safeOriginalFilename = originalFilename
    ? originalFilename.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()
    : 'da1unknownfilename';

  // Clean up titleField or fallback
  const safeTitle = titleField && titleField.trim() !== ''
    ? titleField.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()
    : 'da1neverblanktitle';

  const timestamp = getTimestampForFilename();

  const logFilename = `da1_${safeOriginalFilename}_${safeTitle}_${timestamp}.log`;

  const logFilePath = path.join(logsDirectory, logFilename);

  return logFilePath;
}

/**
 * Log message to file and console
 * @param {string} message - Message to log
 * @param {string} logFilePath - Path to log file
 */
function log(message, logFilePath) {
  // Create timestamp
  const timestamp = new Date().toISOString();
  
  // Format log entry
  const logEntry = `[${timestamp}] ${message}\n`;
  
  try {
    // Write to log file
    fs.appendFileSync(logFilePath, logEntry);
    
    // Also log to console
    console.log(`[LOG] ${message}`);
  } catch (error) {
    // If writing to file fails, at least log to console
    console.error(`Failed to write to log file: ${error.message}`);
    console.log(`[LOG] ${message}`);
  }
}

// Export functions to make them available to other modules
module.exports = {
  createLogFilePath: createLogFilePath,
  log: log
};
