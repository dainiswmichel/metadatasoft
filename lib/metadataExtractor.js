// lib/metadataExtractor.js
const mm = require('music-metadata');
const fs = require('fs').promises;
const path = require('path');

/**
 * Utility class for extracting metadata from audio files
 */
class MetadataExtractor {
  /**
   * Extract metadata from an audio file
   * @param {string} filePath - Path to the audio file
   * @returns {Promise<Object>} - Extracted metadata
   */
  async extractFromFile(filePath) {
    try {
      // Check if the file exists
      try {
        await fs.access(filePath);
      } catch (error) {
        throw new Error(`File not found: ${filePath}`);
      }
      
      // Parse the file with music-metadata
      const metadata = await mm.parseFile(filePath);
      
      // Format the metadata into a more usable structure
      const formattedMetadata = this.formatMetadata(metadata);
      
      // Add file information
      const stats = await fs.stat(filePath);
      formattedMetadata.fileInfo = {
        path: filePath,
        filename: path.basename(filePath),
        extension: path.extname(filePath).replace('.', ''),
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime
      };
      
      return formattedMetadata;
    } catch (error) {
      console.error('Failed to extract metadata:', error);
      throw new Error(`Metadata extraction failed: ${error.message}`);
    }
  }
  
  /**
   * Extract metadata from a buffer or blob
   * @param {Buffer|Blob} buffer - Audio data buffer
   * @param {string} fileType - MIME type of the audio data
   * @returns {Promise<Object>} - Extracted metadata
   */
  async extractFromBuffer(buffer, fileType) {
    try {
      // Parse the buffer with music-metadata
      const metadata = await mm.parseBuffer(buffer, { mimeType: fileType });
      
      // Format the metadata
      return this.formatMetadata(metadata);
    } catch (error) {
      console.error('Failed to extract metadata from buffer:', error);
      throw new Error(`Metadata extraction from buffer failed: ${error.message}`);
    }
  }
  
  /**
   * Format raw metadata into a more usable structure
   * @param {Object} rawMetadata - Raw metadata from music-metadata
   * @returns {Object} - Formatted metadata
   */
  formatMetadata(rawMetadata) {
    const { common, format } = rawMetadata;
    
    // Structure the metadata in a more friendly format
    return {
      title: common.title || null,
      artist: common.artist || null,
      album: common.album || null,
      albumArtist: common.albumartist || null,
      genre: common.genre && common.genre.length > 0 ? common.genre[0] : null,
      year: common.year || null,
      trackNumber: common.track.no || null,
      totalTracks: common.track.of || null,
      discNumber: common.disk.no || null,
      totalDiscs: common.disk.of || null,
      duration: format.duration || null,
      comment: common.comment && common.comment.length > 0 ? common.comment[0] : null,
      composer: common.composer && common.composer.length > 0 ? common.composer[0] : null,
      publisher: common.label && common.label.length > 0 ? common.label[0] : null,
      // Additional metadata that might be useful
      bpm: common.bpm || null,
      isrc: common.isrc || null,
      movementName: common.movementName || null,
      releaseDate: common.date || null,
      // Format information
      format: {
        container: format.container || null,
        codec: format.codec || null,
        sampleRate: format.sampleRate || null,
        bitrate: format.bitrate || null,
        numberOfChannels: format.numberOfChannels || null,
        lossless: format.lossless || false,
        duration: format.duration || null
      },
      // Original raw metadata (for debugging)
      raw: {
        common, 
        format
      }
    };
  }
  
  /**
   * Generate a filename based on metadata
   * @param {Object} metadata - Extracted metadata
   * @param {string} extension - File extension (without dot)
   * @returns {string} - Generated filename
   */
  generateFilename(metadata, extension) {
    let filename = '';
    
    // If there's artist and title, use them
    if (metadata.artist && metadata.title) {
      filename = `${metadata.artist} - ${metadata.title}`;
    } 
    // If there's only title, use it
    else if (metadata.title) {
      filename = metadata.title;
    } 
    // If there's only artist, use it with "unknown title"
    else if (metadata.artist) {
      filename = `${metadata.artist} - Unknown Title`;
    } 
    // If nothing, use a timestamp
    else {
      filename = `Unknown - ${Date.now()}`;
    }
    
    // Clean up the filename (remove invalid characters)
    filename = filename
      .replace(/[<>:"/\\|?*]/g, '') // Remove invalid filename characters
      .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
      .trim();
    
    // Add the extension
    return `${filename}.${extension}`;
  }
}

module.exports = new MetadataExtractor();
