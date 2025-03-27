const path = require('path');
const fs = require('fs');

// LOGS DIRECTORY
const logsDirectory = path.join(__dirname, '..', 'logs');

// Ensure logs directory exists
if (!fs.existsSync(logsDirectory)) {
  fs.mkdirSync(logsDirectory, { recursive: true });
  console.log(`✅ Created logs directory: ${logsDirectory}`);
} else {
  console.log(`✅ Logs directory exists: ${logsDirectory}`);
}

/**
 * Create timestamp for filenames
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
 * Generate log file path using uploaded filename and title metadata
 */
function createLogFilePath(originalFilename, titleField = 'untitled') {
  const safeFilename = originalFilename.replace(/\\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
  const timestamp = getTimestampForFilename();
  const filename = `${timestamp}--${safeFilename}--${titleField}.log`;
  return path.join(logsDirectory, filename);
}

/**
 * Append a log entry to the given file path
 */
function log(message, filePath) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${message}\n`;
  try {
    fs.appendFileSync(filePath, line, 'utf8');
  } catch (err) {
    console.error(`❌ Failed to write to log: ${err.message}`);
  }
}

module.exports = {
  createLogFilePath,
  log
};
