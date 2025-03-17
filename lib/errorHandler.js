// lib/errorHandler.js
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

/**
 * Error Handler and Reporting System
 * Handles error logging, reporting, and user-friendly error messages
 */
class ErrorHandler {
  constructor(options = {}) {
    this.options = {
      logDirectory: options.logDirectory || path.join(process.cwd(), 'logs'),
      errorLogFile: options.errorLogFile || 'error.log',
      maxLogSize: options.maxLogSize || 10 * 1024 * 1024, // 10 MB
      maxLogFiles: options.maxLogFiles || 5,
      debug: options.debug || false,
      ...options
    };
    
    // Ensure log directory exists
    this.ensureLogDirectory();
    
    // Error codes and user-friendly messages
    this.errorCodes = {
      // File operation errors
      'FILE_NOT_FOUND': {
        code: 404,
        message: 'The specified file could not be found.',
        userMessage: 'We couldn\'t find the file you specified. Please check the path and try again.'
      },
      'FILE_ACCESS_DENIED': {
        code: 403,
        message: 'Access to the file was denied.',
        userMessage: 'You don\'t have permission to access this file. Please check your permissions and try again.'
      },
      'FILE_TOO_LARGE': {
        code: 413,
        message: 'The file is too large to process.',
        userMessage: 'The file you uploaded is too large. Please choose a smaller file (max size: {{maxSize}} MB).'
      },
      'INVALID_FILE_FORMAT': {
        code: 415,
        message: 'The file format is not supported.',
        userMessage: 'We don\'t support this file format. Please upload a file in one of the following formats: {{supportedFormats}}.'
      },
      
      // Audio processing errors
      'FFMPEG_NOT_FOUND': {
        code: 500,
        message: 'FFmpeg is not installed or not found in PATH.',
        userMessage: 'We couldn\'t process your audio file because our audio processing tool is not available. Please contact support.'
      },
      'FFMPEG_PROCESS_FAILED': {
        code: 500,
        message: 'FFmpeg process failed.',
        userMessage: 'We encountered an error while processing your audio file. Please try again with a different file.'
      },
      'METADATA_EXTRACTION_FAILED': {
        code: 500,
        message: 'Failed to extract metadata from file.',
        userMessage: 'We couldn\'t extract metadata from your file. The file may be corrupted or in an unsupported format.'
      },
      'METADATA_EMBEDDING_FAILED': {
        code: 500,
        message: 'Failed to embed metadata in file.',
        userMessage: 'We couldn\'t add metadata to your file. Please try again with a different file.'
      },
      
      // Authentication and authorization errors
      'UNAUTHORIZED': {
        code: 401,
        message: 'Authentication required.',
        userMessage: 'You need to be logged in to perform this action. Please log in and try again.'
      },
      'FORBIDDEN': {
        code: 403,
        message: 'Access denied.',
        userMessage: 'You don\'t have permission to perform this action. Please contact the administrator.'
      },
      'INVALID_API_KEY': {
        code: 401,
        message: 'Invalid API key.',
        userMessage: 'The API key you provided is invalid. Please check your API key and try again.'
      },
      
      // Server errors
      'INTERNAL_SERVER_ERROR': {
        code: 500,
        message: 'Internal server error.',
        userMessage: 'Something went wrong on our end. Please try again later or contact support if the problem persists.'
      },
      'SERVICE_UNAVAILABLE': {
        code: 503,
        message: 'Service temporarily unavailable.',
        userMessage: 'Our service is currently unavailable. Please try again later.'
      },
      
      // Default error
      'UNKNOWN_ERROR': {
        code: 500,
        message: 'An unknown error occurred.',
        userMessage: 'An unexpected error occurred. Please try again later or contact support if the problem persists.'
      }
    };
  }
  
  /**
   * Ensure log directory exists
   * @private
   */
  async ensureLogDirectory() {
    try {
      await fs.mkdir(this.options.logDirectory, { recursive: true });
    } catch (error) {
      console.error(`Failed to create log directory: ${error.message}`);
    }
  }
  
  /**
   * Log an error to the error log file
   * @param {Error|Object} error - The error to log
   * @param {Object} [context] - Additional context information
   * @returns {Promise<void>}
   */
  async logError(error, context = {}) {
    try {
      // Format the error
      const errorLog = {
        timestamp: new Date().toISOString(),
        error: {
          name: error.name || 'Error',
          message: error.message || 'Unknown error',
          stack: error.stack || null,
          code: error.code || null
        },
        context: {
          ...context,
          hostname: os.hostname(),
          platform: os.platform(),
          nodeVersion: process.version,
          memory: process.memoryUsage()
        }
      };
      
      // Convert to string
      const logEntry = JSON.stringify(errorLog) + '\n';
      
      // Write to log file
      const logPath = path.join(this.options.logDirectory, this.options.errorLogFile);
      await fs.appendFile(logPath, logEntry);
      
      // Rotate logs if necessary
      await this.rotateLogsIfNeeded();
      
      // Debug log
      if (this.options.debug) {
        console.error('Error logged:', errorLog);
      }
    } catch (logError) {
      console.error(`Failed to log error: ${logError.message}`);
      console.error('Original error:', error);
    }
  }
  
  /**
   * Rotate log files if current log is too large
   * @private
   * @returns {Promise<void>}
   */
  async rotateLogsIfNeeded() {
    try {
      const logPath = path.join(this.options.logDirectory, this.options.errorLogFile);
      
      // Check if log file exists
      try {
        const stats = await fs.stat(logPath);
        
        // If file is larger than max size, rotate logs
        if (stats.size > this.options.maxLogSize) {
          // Get list of existing log files
          const files = await fs.readdir(this.options.logDirectory);
          const logFiles = files
            .filter(file => file.startsWith(this.options.errorLogFile))
            .sort()
            .reverse();
          
          // Rotate log files
          for (let i = logFiles.length - 1; i >= 0; i--) {
            const file = logFiles[i];
            const match = file.match(/\.(\d+)$/);
            if (match) {
              const index = parseInt(match[1], 10);
              if (index >= this.options.maxLogFiles - 1) {
                // Delete oldest log file
                await fs.unlink(path.join(this.options.logDirectory, file));
              } else {
                // Rename log file
                await fs.rename(
                  path.join(this.options.logDirectory, file),
                  path.join(this.options.logDirectory, `${this.options.errorLogFile}.${index + 1}`)
                );
              }
            }
          }
          
          // Rename current log file
          await fs.rename(
            logPath,
            path.join(this.options.logDirectory, `${this.options.errorLogFile}.1`)
          );
          
          // Create new log file
          await fs.writeFile(logPath, '');
        }
      } catch (error) {
        // File doesn't exist, no need to rotate
        if (error.code !== 'ENOENT') {
          throw error;
        }
      }
    } catch (error) {
      console.error(`Failed to rotate logs: ${error.message}`);
    }
  }
  
  /**
   * Get a user-friendly error message for a specific error code
   * @param {string} errorCode - The error code
   * @param {Object} [params] - Parameters to replace in the message
   * @returns {Object} - Error information including code, message, and user message
   */
  getErrorInfo(errorCode, params = {}) {
    // Get error info or use default
    const errorInfo = this.errorCodes[errorCode] || this.errorCodes.UNKNOWN_ERROR;
    
    // Replace parameters in user message
    let userMessage = errorInfo.userMessage;
    
    // Replace all {{param}} with actual values
    Object.entries(params).forEach(([key, value]) => {
      userMessage = userMessage.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
    
    return {
      code: errorInfo.code,
      message: errorInfo.message,
      userMessage
    };
  }
  
  /**
   * Create an error response for API endpoints
   * @param {string} errorCode - The error code
   * @param {Object} [params] - Parameters to replace in the message
   * @param {Object} [additionalInfo] - Additional information to include in the response
   * @returns {Object} - Error response object
   */
  createErrorResponse(errorCode, params = {}, additionalInfo = {}) {
    const errorInfo = this.getErrorInfo(errorCode, params);
    
    return {
      error: true,
      code: errorInfo.code,
      message: errorInfo.userMessage,
      errorCode,
      ...additionalInfo
    };
  }
  
  /**
   * Create an Express error handler middleware
   * @returns {Function} - Express middleware function
   */
  createExpressErrorHandler() {
    return async (err, req, res, next) => {
      // Log the error
      await this.logError(err, {
        url: req.url,
        method: req.method,
        headers: req.headers,
        query: req.query,
        ip: req.ip
      });
      
      // Determine error code
      let errorCode = 'UNKNOWN_ERROR';
      
      // Map common error types to error codes
      if (err.code === 'ENOENT') errorCode = 'FILE_NOT_FOUND';
      if (err.code === 'EACCES') errorCode = 'FILE_ACCESS_DENIED';
      if (err.message && err.message.includes('FFmpeg')) {
        errorCode = err.message.includes('not found') ? 'FFMPEG_NOT_FOUND' : 'FFMPEG_PROCESS_FAILED';
      }
      
      // Create error response
      const errorResponse = this.createErrorResponse(errorCode);
      
      // Send response
      res.status(errorResponse.code).json(errorResponse);
    };
  }
  
  /**
   * Register error handlers in an Express app
   * @param {Object} app - Express app
   */
  registerWithExpress(app) {
    // Catch 404 errors
    app.use((req, res, next) => {
      const err = new Error('Not Found');
      err.status = 404;
      next(err);
    });
    
    // Handle errors
    app.use(this.createExpressErrorHandler());
  }
}

module.exports = ErrorHandler;
