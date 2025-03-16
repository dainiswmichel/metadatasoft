/**
 * ==========================================
 * DA1.FM - Configuration Module
 * ==========================================
 * 
 * This module centralizes all configuration values for the DA1.FM application.
 * It serves as the single source of truth for default values, file configurations,
 * format specifications, and directory structures.
 * 
 * @author DA1.FM Team
 * @version MVP-01
 */

const path = require('path');
const fs = require('fs');

/**
 * Application paths for file operations and directory structures
 */
const PATHS = {
  temp: path.resolve('./temp'),
  output: path.resolve('./output'),
  resources: path.resolve('./resources/elements'),
  uploads: path.resolve('./temp/uploads'),
  public: path.resolve('./public')
};

/**
 * DA1neverBlankmetaMetaData - Default values for metadata when user input is missing
 * These values ensure we NEVER have blank/missing fields in any metadata
 */
const DA1neverBlankmetaMetaData = {
  // ---- Core Track Information ----
  title: "DA1:Title ~255 Characters The title of the work",
  artist: "DA1:Artist ~255 Characters The name of the artist(s)",
  album: "DA1:Album ~255 Characters The album or project title",
  genre: "DA1:Genre ~255 Characters Comma-separated descriptive genre information",
  
  // ---- Extended Metadata ----
  year: new Date().getFullYear().toString(),
  composer: "DA1:Composer ~255 Characters The composer(s) of the work",
  publisher: "DA1.FM",
  copyright: `©${new Date().getFullYear()} DA1.FM`,
  comment: "Created with DA1.FM MVP-01",
  
  // ---- DA1-specific Metadata ----
  da1Version: "01",
  da1Creator: "DA1.FM MVP-01",
  da1CreationDate: new Date().toISOString(),
  da1Identifier: "", // Will be generated dynamically
  
  // ---- Default Resources ----
  cover_art: path.join(PATHS.resources, 'DA1neverBlankmetaMetaData_Cover_01.jpg')
};

/**
 * SUPPORTED_FORMATS - Configuration for all audio formats supported by DA1.FM
 * Each format includes necessary encoding parameters, naming conventions and descriptions
 */
const SUPPORTED_FORMATS = {
  mp3: {
    highQuality: {
      codec: "libmp3lame",
      bitrate: "320k",
      extension: "mp3",
      suffix: "_high",
      description: "ID3v2 tagging with TIT2 (Title), TPE1 (Artist), TALB (Album), TCON (Genre), APIC (Cover Art). Industry-standard legacy support."
    },
    lowQuality: {
      codec: "libmp3lame",
      bitrate: "128k", 
      extension: "mp3",
      suffix: "_low",
      description: "Lower bitrate MP3 with same ID3v2 tags for bandwidth-efficient delivery."
    }
  },
  flac: {
    codec: "flac",
    compression: "8", // High compression
    extension: "flac",
    suffix: "",
    description: "Vorbis Comments: TITLE, ARTIST, ALBUM, GENRE, PICTURE (Cover Art). Lossless + efficient."
  },
  wav: {
    codec: "pcm_s16le", // Standard 16-bit WAV
    extension: "wav",
    suffix: "",
    description: "BWF / RIFF INFO chunks including INAM (Title), IART (Artist), IALB (Album), IGNR (Genre). Broadcast and archival ready."
  },
  aiff: {
    codec: "pcm_s16be",
    extension: "aiff",
    suffix: "",
    description: "ID3 tags and AIFF metadata chunks. Pro-grade high-res audio with metadata."
  },
  m4a: {
    codec: "aac",
    bitrate: "256k",
    extension: "m4a",
    suffix: "",
    description: "iTunes atoms: ©nam, ©ART, ©alb, ©gen + covr (Cover Art). Streaming-ready format."
  },
  ogg: {
    codec: "libvorbis",
    quality: "7", // Range 0-10
    extension: "ogg",
    suffix: "",
    description: "Vorbis Comments optimized for open-source platforms. TITLE, ARTIST, ALBUM, GENRE."
  },
  aac: {
    codec: "aac",
    bitrate: "256k",
    extension: "aac",
    suffix: "",
    description: "Efficient, high-quality lossy audio format widely used for streaming. Supports metadata embedding."
  },
  alac: {
    codec: "alac",
    extension: "alac",
    suffix: "",
    description: "Lossless compression format optimized for Apple devices. Fully supports metadata tagging."
  }
};

/**
 * FILE_VALIDATION - Constants for validating uploaded files
 * Enforces size limits and restricts to allowed MIME types for security
 */
const FILE_VALIDATION = {
  maxAudioSize: 100 * 1024 * 1024, // 100MB
  maxImageSize: 10 * 1024 * 1024,  // 10MB
  allowedAudioMimeTypes: [
    'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/wave', 'audio/x-wav',
    'audio/flac', 'audio/x-flac', 'audio/aiff', 'audio/x-aiff',
    'audio/mp4', 'audio/m4a', 'audio/x-m4a', 'audio/ogg', 'audio/vorbis'
  ],
  allowedImageMimeTypes: [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'
  ],
  // Regexes for safe filenames
  safeFilenameRegex: /^[a-zA-Z0-9_\-\.]+$/,
  sanitizeFilename: (filename) => {
    return filename
      .replace(/[^a-zA-Z0-9_\-\.]/g, '_')
      .replace(/_{2,}/g, '_');
  }
};

/**
 * FOLDER_STRUCTURE - Definition of the DA1 folder structure
 * Ensures consistent folder naming and organization across all DA1 packages
 */
const FOLDER_STRUCTURE = {
  mediaFolder: "media",
  audioFolder: "audio",
  imagesFolder: "images",
  docsFolder: "docs",
  extrasFolder: "extras",
  metadataFile: "da1metadata.xml",
  hashesFile: "hashes.txt"
};

/**
 * API_CONFIG - Configuration for API endpoints and rate limiting
 */
const API_CONFIG = {
  routes: {
    engrave: '/api/engrave',
    download: '/download'
  },
  rateLimits: {
    standard: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // 100 requests per windowMs
    },
    engrave: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 10 // 10 requests per windowMs
    }
  }
};

/**
 * PLATFORM_PACKAGES - Configuration for platform-specific packages
 * Maps platform identifiers to their specific processing requirements
 */
const PLATFORM_PACKAGES = {
  spotify: {
    name: "Spotify Package",
    description: "Prepares your files and metadata to meet Spotify's guidelines for loudness, artwork, and metadata standards.",
    formats: ["mp3", "wav"],
    isImplemented: false // Phase 2 feature
  },
  bandcamp: {
    name: "Bandcamp Package",
    description: "Optimized audio files, naming conventions, and artwork specs matching Bandcamp requirements.",
    formats: ["mp3", "flac", "wav"],
    isImplemented: false // Phase 2 feature
  }
  // Other platforms can be added here in Phase 2
};

// Create required directories if they don't exist
Object.values(PATHS).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Export all constants for use throughout the application
module.exports = {
  PATHS,
  DA1neverBlankmetaMetaData,
  SUPPORTED_FORMATS,
  FILE_VALIDATION,
  FOLDER_STRUCTURE,
  API_CONFIG,
  PLATFORM_PACKAGES
};
