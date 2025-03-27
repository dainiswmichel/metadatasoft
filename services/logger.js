const path = require('path');
const fs = require('fs');

// LOGS DIRECTORY
const logsDirectory = path.join(__dirname, '../logs');

// Ensure the logs directory exists
if (!fs.existsSync(logsDirectory)) {
  fs.mkdirSync(logsDirectory, { recursive: true });
}

/**
 * Get formatted timestamp in YYYYy-MMm-DDd-HHh-MMm-SSs
 * @returns {string}
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
 * @param {string} titleField - The title metadata field
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

module.exports = {
  createLogFilePath
};
