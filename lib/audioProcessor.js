// lib/audioProcessor.js
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

/**
 * Audio processing utility that handles metadata embedding
 * using direct ffmpeg commands with proper error handling
 */
class AudioProcessor {
  /**
   * Process an audio file with metadata
   * @param {string} inputPath - Path to the input audio file
   * @param {string} outputPath - Path where processed file should be saved
   * @param {Object} metadata - Object containing metadata to embed
   * @returns {Promise<string>} - Path to the processed file
   */
  async processAudio(inputPath, outputPath, metadata = {}) {
    try {
      // Detect file format
      const fileExt = path.extname(inputPath).toLowerCase();
      
      // Make sure output directory exists
      const outputDir = path.dirname(outputPath);
      await fs.mkdir(outputDir, { recursive: true });
      
      // Check if file exists
      try {
        await fs.access(inputPath);
      } catch (error) {
        throw new Error(`Input file not found: ${inputPath}`);
      }
      
      // Format-specific handling for more reliable metadata embedding
      switch (fileExt) {
        case '.mp3':
          return this.processMP3(inputPath, outputPath, metadata);
        case '.wav':
          return this.processWAV(inputPath, outputPath, metadata);
        case '.flac':
          return this.processFLAC(inputPath, outputPath, metadata);
        case '.m4a':
        case '.aac':
          return this.processM4A(inputPath, outputPath, metadata);
        case '.ogg':
          return this.processOGG(inputPath, outputPath, metadata);
        default:
          // Default to generic process for other formats
          return this.processGeneric(inputPath, outputPath, metadata);
      }
    } catch (error) {
      throw new Error(`Audio processing failed: ${error.message}`);
    }
  }
  
  // MP3-specific processing (ID3v2 tags)
  async processMP3(inputPath, outputPath, metadata) {
    // Build ffmpeg arguments optimized for MP3 ID3v2 tags
    const ffmpegArgs = [
      '-i', inputPath,
      '-c:a', 'copy',  // Copy audio without re-encoding
      '-id3v2_version', '3'  // Force ID3v2.3 format for best compatibility
    ];
    
    // Add metadata with proper ID3 mapping
    const id3Mapping = {
      title: 'TIT2',
      artist: 'TPE1',
      album: 'TALB',
      genre: 'TCON',
      year: 'TYER',
      comment: 'COMM',
      composer: 'TCOM',
      publisher: 'TPUB',
      track: 'TRCK'
    };
    
    Object.entries(metadata).forEach(([key, value]) => {
      const id3Key = id3Mapping[key.toLowerCase()] || key;
      ffmpegArgs.push('-metadata', `${id3Key}=${value}`);
    });
    
    // Add output path
    ffmpegArgs.push(outputPath);
    
    // Execute ffmpeg command
    return this.executeFFmpeg(ffmpegArgs);
  }
  
  // WAV-specific processing (BWF/RIFF metadata)
  async processWAV(inputPath, outputPath, metadata) {
    // BWF/RIFF chunks need specific handling
    const ffmpegArgs = [
      '-i', inputPath,
      '-c:a', 'copy'  // Copy audio without re-encoding
    ];
    
    // Map metadata to RIFF INFO chunks
    const riffMapping = {
      title: 'INAM',
      artist: 'IART',
      album: 'IALB',
      genre: 'IGNR',
      year: 'ICRD',
      comment: 'ICMT',
      composer: 'IMUS',
      publisher: 'IPRD'
    };
    
    Object.entries(metadata).forEach(([key, value]) => {
      const riffKey = riffMapping[key.toLowerCase()] || key;
      ffmpegArgs.push('-metadata', `${riffKey}=${value}`);
    });
    
    ffmpegArgs.push(outputPath);
    
    return this.executeFFmpeg(ffmpegArgs);
  }
  
  // FLAC-specific processing (Vorbis comments)
  async processFLAC(inputPath, outputPath, metadata) {
    const ffmpegArgs = [
      '-i', inputPath,
      '-c:a', 'copy'  // Copy audio without re-encoding
    ];
    
    // Direct mapping for FLAC (uses Vorbis comments)
    Object.entries(metadata).forEach(([key, value]) => {
      ffmpegArgs.push('-metadata', `${key}=${value}`);
    });
    
    ffmpegArgs.push(outputPath);
    
    return this.executeFFmpeg(ffmpegArgs);
  }
  
  // M4A/AAC specific processing (iTunes atoms)
  async processM4A(inputPath, outputPath, metadata) {
    const ffmpegArgs = [
      '-i', inputPath,
      '-c:a', 'copy'  // Copy audio without re-encoding
    ];
    
    // iTunes atoms mapping
    const m4aMapping = {
      title: '©nam',
      artist: '©ART',
      album: '©alb',
      genre: '©gen',
      year: '©day',
      composer: '©wrt',
      comment: '©cmt',
      track: 'trkn'
    };
    
    Object.entries(metadata).forEach(([key, value]) => {
      const m4aKey = m4aMapping[key.toLowerCase()] || key;
      ffmpegArgs.push('-metadata', `${m4aKey}=${value}`);
    });
    
    ffmpegArgs.push(outputPath);
    
    return this.executeFFmpeg(ffmpegArgs);
  }
  
  // OGG specific processing (Vorbis comments)
  async processOGG(inputPath, outputPath, metadata) {
    const ffmpegArgs = [
      '-i', inputPath,
      '-c:a', 'copy'  // Copy audio without re-encoding
    ];
    
    // Ogg uses standard key/value pairs but uppercase keys traditionally
    Object.entries(metadata).forEach(([key, value]) => {
      ffmpegArgs.push('-metadata', `${key.toUpperCase()}=${value}`);
    });
    
    ffmpegArgs.push(outputPath);
    
    return this.executeFFmpeg(ffmpegArgs);
  }
  
  // Generic processing for other formats
  async processGeneric(inputPath, outputPath, metadata) {
    const ffmpegArgs = [
      '-i', inputPath,
      '-c:a', 'copy'  // Copy audio without re-encoding
    ];
    
    // Add metadata generically
    Object.entries(metadata).forEach(([key, value]) => {
      ffmpegArgs.push('-metadata', `${key}=${value}`);
    });
    
    ffmpegArgs.push(outputPath);
    
    return this.executeFFmpeg(ffmpegArgs);
  }
  
  // Common FFmpeg execution function
  async executeFFmpeg(ffmpegArgs) {
    return new Promise((resolve, reject) => {
      console.log('Executing FFmpeg command:', 'ffmpeg', ffmpegArgs.join(' '));
      
      const ffmpeg = spawn('ffmpeg', ffmpegArgs);
      
      let stderr = '';
      
      ffmpeg.stderr.on('data', (data) => {
        stderr += data.toString();
        console.log('FFmpeg progress:', data.toString());
      });
      
      ffmpeg.on('close', (code) => {
        if (code === 0) {
          console.log('FFmpeg process completed successfully');
          resolve(ffmpegArgs[ffmpegArgs.length - 1]); // Return output path
        } else {
          console.error('FFmpeg process failed:', stderr);
          reject(new Error(`FFmpeg process exited with code ${code}. Error: ${stderr}`));
        }
      });
      
      ffmpeg.on('error', (err) => {
        console.error('Failed to start FFmpeg process:', err);
        reject(new Error(`Failed to start FFmpeg process: ${err.message}`));
      });
    });
  }
  
  /**
   * Validate that FFmpeg is installed and working correctly
   * @returns {Promise<boolean>} - True if FFmpeg is working
   */
  async validateFFmpegInstallation() {
    try {
      return new Promise((resolve, reject) => {
        const ffmpeg = spawn('ffmpeg', ['-version']);
        
        ffmpeg.on('close', (code) => {
          resolve(code === 0);
        });
        
        ffmpeg.on('error', () => {
          resolve(false);
        });
      });
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Get audio file information using ffprobe
   * @param {string} filePath - Path to the audio file
   * @returns {Promise<Object>} - Audio file information
   */
  async getAudioInfo(filePath) {
    try {
      const { stdout } = await exec(`ffprobe -v quiet -print_format json -show_format -show_streams "${filePath}"`);
      return JSON.parse(stdout);
    } catch (error) {
      throw new Error(`Failed to get audio info: ${error.message}`);
    }
  }
  
  /**
   * Extract existing metadata from audio file
   * @param {string} filePath - Path to the audio file
   * @returns {Promise<Object>} - Extracted metadata
   */
  async extractMetadata(filePath) {
    try {
      const audioInfo = await this.getAudioInfo(filePath);
      return audioInfo.format.tags || {};
    } catch (error) {
      console.warn(`Warning: Could not extract metadata from ${filePath}: ${error.message}`);
      return {};
    }
  }
  
  /**
   * Test audio processing with minimal metadata
   * @param {string} inputPath - Path to test audio file
   * @returns {Promise<Object>} - Test results
   */
  async testProcessing(inputPath) {
    try {
      // Create temp output path
      const outputDir = path.join(os.tmpdir(), 'da1-test');
      await fs.mkdir(outputDir, { recursive: true });
      const outputPath = path.join(outputDir, `test-output-${Date.now()}${path.extname(inputPath)}`);
      
      // Process with minimal metadata
      const testMetadata = {
        title: 'Test Title',
        artist: 'Test Artist'
      };
      
      // Process the file
      await this.processAudio(inputPath, outputPath, testMetadata);
      
      // Verify metadata was written
      const extractedMetadata = await this.extractMetadata(outputPath);
      
      // Clean up
      await fs.unlink(outputPath).catch(() => {});
      
      return {
        success: true,
        outputPath,
        metadataWritten: extractedMetadata,
        inputPath
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        inputPath
      };
    }
  }
}

module.exports = new AudioProcessor();
