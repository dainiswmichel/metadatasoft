# DA1.FM MVP-01

<div align="center">
  <img src="resources/elements/DA1neverBlankmetaMetaData_Cover_01.jpg" alt="DA1.FM Logo" width="300">
  <h3>Digital Audio One Format</h3>
  <p>Create comprehensive media packages with standardized metadata</p>
</div>

## 📋 Overview

DA1.FM MVP-01 is a powerful audio processing system that creates standardized DA1 packages with embedded metadata. It processes audio files into multiple formats (MP3, FLAC, WAV, etc.) while preserving critical metadata and creating a consistent folder structure.

## 🔑 Key Features

- ✅ **Complete DA1 folder structure** with proper subfolders and organization
- ✅ **DA1XML as the single source of truth** for metadata
- ✅ **Support for multiple audio formats**:
  - MP3 (high/low quality)
  - FLAC (lossless compression)
  - WAV (uncompressed)
  - AIFF (uncompressed)
  - M4A (AAC)
  - OGG (Vorbis)
  - AAC (Advanced Audio Coding)
  - ALAC (Apple Lossless)
- ✅ **Proper metadata embedding** across all formats
- ✅ **SHA-256 hashes** for integrity verification
- ✅ **Individual file downloads** for all formats
- ✅ **NO JSON anywhere** (using XML exclusively)
- ✅ **NO ZIP files** (delivering native folder structure)
- ✅ **Enhanced security** - input validation, command sanitization, rate limiting
- ✅ **Cross-platform support** - works on Windows, macOS, and Linux

## 🚀 Installation

### Prerequisites

1. **Node.js** (v16 or higher) - [Download from nodejs.org](https://nodejs.org/)
2. **FFmpeg** - Required for audio processing:
   - For Windows: [Download FFmpeg](https://www.gyan.dev/ffmpeg/builds/)
   - For macOS: `brew install ffmpeg`
   - For Ubuntu/Debian: `sudo apt install ffmpeg`
   - For other Linux distributions: Use your package manager

### Quick Start

1. Clone this repository or download the project files:
   ```bash
   git clone https://github.com/da1-fm/da1-fm-mvp-01.git
   cd da1-fm-mvp-01
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create required directories:
   ```bash
   npm run setup
   ```

4. Add the default cover art:
   - Create the directory: `mkdir -p resources/elements`
   - Add a default cover image named `DA1neverBlankmetaMetaData_Cover_01.jpg` to this directory

5. Start the server:
   ```bash
   npm start
   ```

6. Access the application in your browser:
   ```
   http://localhost:3000
   ```

### Development Mode

For development with auto-restart on file changes:
```bash
npm run dev
```

## 🛠️ Architecture

DA1.FM follows a modular service-oriented architecture for improved maintainability and scalability:

### Backend Services

- **MetadataService** - Handles metadata validation, XML generation, and cover art processing
- **EmbedService** - Manages audio conversion and metadata embedding with FFmpeg
- **PackageService** - Creates DA1 folder structures and handles file organization
- **ProcessService** - Orchestrates the entire processing workflow

### API Routes

- **POST /api/engrave** - Main endpoint for processing audio files and creating DA1 packages
- **GET /download/:jobId/:filename** - Download individual files or access DA1 folders
- **GET /download/:jobId** - List all files for a specific job

## 📁 Project Structure

```
da1-fm-mvp-01/
├── backend/
│   ├── server.js               # Express server setup
│   ├── routes.js               # API endpoints
│   ├── constants.js            # Configuration values
│   ├── utils.js                # Utility functions
│   ├── metadataService.js      # Metadata handling
│   ├── embedService.js         # FFmpeg integration
│   ├── packageService.js       # Folder structure creation
│   └── processService.js       # Processing orchestration
├── public/
│   ├── index.html              # Main HTML interface
│   ├── app.js                  # Frontend JavaScript
│   └── styles.css              # CSS styles
├── resources/
│   └── elements/
│       └── DA1neverBlankmetaMetaData_Cover_01.jpg  # Default cover art
├── temp/                       # Temporary processing files
├── output/                     # Processed DA1 packages
├── package.json                # Project configuration
└── README.md                   # Project documentation
```

## 📋 Usage Instructions

1. **Upload an audio file**
   - Select a supported audio file (WAV, MP3, or FLAC) using the file input
   - Optionally upload a cover image

2. **Fill in metadata**
   - Enter title, artist, album, etc.
   - Any fields left blank will use DA1neverBlankmetaMetaData defaults

3. **Select output formats**
   - Choose which audio formats to generate (MP3, FLAC, WAV, etc.)
   - MP3 and FLAC are selected by default

4. **Process the audio**
   - Click the "Compile DA1 Package" button
   - Wait for processing to complete (this may take a while for large files)

5. **Download results**
   - The .da1 folder will be available for browsing
   - Individual audio files can be downloaded directly

## 🔒 Security Features

DA1.FM implements numerous security measures:

- **Input validation** - Strict file and metadata validation
- **Command sanitization** - Protection against shell injection in FFmpeg commands
- **Rate limiting** - Prevents API abuse
- **Content security policy** - Implemented via Helmet.js
- **File signature validation** - Verifies actual file content matches claimed type
- **Path traversal protection** - Prevents unauthorized access via URL manipulation
- **Error sanitization** - Prevents leaking sensitive information in error messages

## 🔍 Troubleshooting

### Common Issues

1. **FFmpeg not found**
   - Ensure FFmpeg is installed and in your system PATH
   - Try running `ffmpeg -version` in your terminal

2. **Permission errors**
   - Make sure the application has permission to create and write to directories
   - Check the permissions on the `temp` and `output` directories

3. **File size limits**
   - By default, audio files are limited to 100MB and images to 10MB
   - These limits can be adjusted in `constants.js`

## 🔮 Future Development (Phase 2)

- ✅ DA1XML schema validator
- ✅ Live DA1XML preview
- ✅ Blockchain-ready UUIDs and notarization prep
- ✅ Docker container for production
- ✅ Queued job processing and concurrency scaling
- ✅ Desktop DA1 player app
- ✅ Platform-specific package exports (Spotify, Bandcamp, etc.)
- ✅ Enhanced reporting features

## 📄 License

Proprietary - All rights reserved

## 🙏 Acknowledgments

- DA1.FM Team for the vision and requirements
- FFmpeg for the powerful audio processing capabilities
- Node.js and Express for providing the foundation