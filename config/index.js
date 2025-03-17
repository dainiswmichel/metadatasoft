// config/index.js - Environment configuration for DA1 development environment
module.exports = {
    development: {
      masterPort: 8000,
      audioProcessor: {
        outputDir: '/Users/dainismichel/dainisne/tmp/audio',
        ffmpegPath: 'ffmpeg', // Uses system ffmpeg
        concurrency: 2, // Number of concurrent audio processing jobs
        cleanupInterval: 86400000 // 24 hours in milliseconds
      },
      queue: {
        redisUrl: 'redis://127.0.0.1:6379', // Redis connection for Bull queue
        concurrency: 2, // Default concurrent jobs
        jobTTL: 3600000 // 1 hour job TTL
      },
      googleProtection: true,
      security: {
        secretKey: 'da1-dev-secret-key', // For development only
        tokenExpiry: '1d',
        maxLoginAttempts: 5,
        lockoutTime: 15 * 60 * 1000 // 15 minutes in milliseconds
      },
      projects: {
        'da1-mvp': {
          path: '/Users/dainismichel/dainisne/da1-mvp',
          port: 3000,
          apiBase: 'http://localhost:3000/api'
        },
        'da1-mvp-02': {
          path: '/Users/dainismichel/dainisne/da1-mvp-02',
          port: 3002,
          apiBase: 'http://localhost:3002/api'
        },
        'da1.fm': {
          path: '/Users/dainismichel/dainisne/da1.fm',
          port: 3001,
          apiBase: 'http://localhost:3001/api'
        }
      },
      upload: {
        maxFileSize: 500 * 1024 * 1024, // 500MB max file size
        allowedFileTypes: [
          'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav',
          'audio/flac', 'audio/x-flac', 'audio/aac', 'audio/m4a',
          'audio/ogg', 'video/mp4', 'video/webm', 'video/quicktime',
          'application/pdf', 'image/jpeg', 'image/png', 'image/gif'
        ],
        tempDir: '/Users/dainismichel/dainisne/tmp/uploads'
      },
      logging: {
        level: 'debug', // debug, info, warn, error
        directory: '/Users/dainismichel/dainisne/logs',
        maxSize: 10 * 1024 * 1024, // 10MB
        maxFiles: 5
      }
    },
    
    staging: {
      masterPort: 8000,
      audioProcessor: {
        outputDir: '/Users/dainismichel/dainisne/tmp/audio',
        ffmpegPath: 'ffmpeg',
        concurrency: 4
      },
      queue: {
        redisUrl: 'redis://127.0.0.1:6379',
        concurrency: 4
      },
      googleProtection: true,
      security: {
        secretKey: process.env.DA1_SECRET_KEY || 'da1-staging-secret-key',
        tokenExpiry: '1d'
      },
      projects: {
        'da1-mvp': {
          path: '/Users/dainismichel/dainisne/da1-mvp',
          port: 3000,
          apiBase: 'https://staging.da1.fm/api'
        },
        'da1-mvp-02': {
          path: '/Users/dainismichel/dainisne/da1-mvp-02',
          port: 3002,
          apiBase: 'https://staging-02.da1.fm/api'
        },
        'da1.fm': {
          path: '/Users/dainismichel/dainisne/da1.fm',
          port: 3001,
          apiBase: 'https://staging.da1.fm/api'
        }
      },
      upload: {
        maxFileSize: 1024 * 1024 * 1024, // 1GB max file size
        allowedFileTypes: [
          'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav',
          'audio/flac', 'audio/x-flac', 'audio/aac', 'audio/m4a',
          'audio/ogg', 'video/mp4', 'video/webm', 'video/quicktime',
          'application/pdf', 'image/jpeg', 'image/png', 'image/gif'
        ],
        tempDir: '/var/www/staging.da1.fm/tmp/uploads'
      },
      logging: {
        level: 'info',
        directory: '/var/www/staging.da1.fm/logs',
        maxSize: 50 * 1024 * 1024, // 50MB
        maxFiles: 10
      }
    },
    
    production: {
      audioProcessor: {
        outputDir: '/var/www/da1.fm/audio',
        ffmpegPath: '/usr/bin/ffmpeg',
        concurrency: 8
      },
      queue: {
        redisUrl: process.env.REDIS_URL || 'redis://redis:6379',
        concurrency: 8
      },
      googleProtection: false,
      security: {
        secretKey: process.env.DA1_SECRET_KEY,
        tokenExpiry: '7d'
      },
      projects: {
        'da1-mvp': {
          path: '/Users/dainismichel/dainisne/da1-mvp',
          apiBase: 'https://da1-mvp.da1.fm/api'
        },
        'da1-mvp-02': {
          path: '/Users/dainismichel/dainisne/da1-mvp-02',
          apiBase: 'https://v2.da1.fm/api'
        },
        'da1.fm': {
          path: '/Users/dainismichel/dainisne/da1.fm',
          apiBase: 'https://da1.fm/api'
        }
      },
      upload: {
        maxFileSize: 2 * 1024 * 1024 * 1024, // 2GB max file size
        allowedFileTypes: [
          'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav',
          'audio/flac', 'audio/x-flac', 'audio/aac', 'audio/m4a',
          'audio/ogg', 'video/mp4', 'video/webm', 'video/quicktime',
          'application/pdf', 'image/jpeg', 'image/png', 'image/gif'
        ],
        tempDir: '/var/www/da1.fm/tmp/uploads'
      },
      logging: {
        level: 'warn',
        directory: '/var/www/da1.fm/logs',
        maxSize: 100 * 1024 * 1024, // 100MB
        maxFiles: 20
      }
    }
  };