// /Users/dainismichel/dainisne/da1-mvp-03/services/da1_services.js

const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const { v4: uuidv4 } = require('uuid');

// Logger functions
const { createLogFilePath, log } = require('./logger');

// Supported audio formats and their FFmpeg settings
const AUDIO_FORMATS = {
  mp3: { codec: 'libmp3lame', bitrate: '320k', ext: '.mp3' },
  flac: { codec: 'flac', bitrate: null, ext: '.flac' },
  wav: { codec: 'pcm_s16le', bitrate: null, ext: '.wav' }
};

// Base output directory
const BASE_OUTPUT_DIR = path.join(__dirname, '..', 'output');

// ===========================================
// processDA1 FUNCTION
// ===========================================
async function processDA1(files, formats, metadata) {
  const originalFilename = files[0].originalname || 'da1neverblanktitle';
  const titleField = metadata.title ? metadata.title.replace(/\s+/g, '_').toLowerCase() : 'da1neverblanktitle';

  // Create log file path
  const logFilePath = createLogFilePath(originalFilename, titleField);
  log(`🟢 processDA1() STARTED`, logFilePath);
  log(`🟦 Original filename: ${originalFilename}`, logFilePath);
  log(`🟦 Title field: ${titleField}`, logFilePath);
  log(`🟦 Formats: ${JSON.stringify(formats)}`, logFilePath);

  if (!files || files.length === 0) {
    log('❌ No input files provided', logFilePath);
    throw new Error('No input files provided');
  }

  const packageTimestamp = Date.now();
  const packageDir = path.join(BASE_OUTPUT_DIR, `package_${packageTimestamp}`);
  fs.mkdirSync(packageDir, { recursive: true });

  log(`📁 Created output directory: ${packageDir}`, logFilePath);

  const manifestPath = path.join(packageDir, `DA1_Package_${packageTimestamp}.da1`);
  fs.writeFileSync(manifestPath, 'DA1 Package Manifest\n');

  log(`✅ Created manifest file: ${manifestPath}`, logFilePath);

  const outputFiles = [];
  const downloadLinks = [];

  // Add manifest file to download links
  downloadLinks.push({
    filename: path.basename(manifestPath),
    path: `/output/package_${packageTimestamp}/${path.basename(manifestPath)}`
  });

  for (const file of files) {
    const inputFilePath = file.path;

    if (!fs.existsSync(inputFilePath)) {
      log(`❌ Input file does not exist: ${inputFilePath}`, logFilePath);
      continue;
    }

    for (const format of formats) {
      const settings = AUDIO_FORMATS[format];
      if (!settings) {
        log(`❌ Unsupported format: ${format}`, logFilePath);
        continue;
      }

      const outputFilename = `${path.basename(file.originalname, path.extname(file.originalname))}_${format}_${packageTimestamp}${settings.ext}`;
      const outputFilePath = path.join(packageDir, outputFilename);

      try {
        await processAudioFile(inputFilePath, outputFilePath, format, metadata, logFilePath);
        outputFiles.push(outputFilePath);
        
        // Add to download links
        downloadLinks.push({
          filename: outputFilename,
          path: `/output/package_${packageTimestamp}/${outputFilename}`
        });
      } catch (err) {
        log(`❌ Error processing ${inputFilePath} to ${format}: ${err.message}`, logFilePath);
      }
    }
  }

  log(`✅ All processing complete`, logFilePath);

  return {
    packageDir,
    manifestPath,
    outputFiles,
    packageId: `package_${packageTimestamp}`,
    downloadLinks
  };
}

// ===========================================
// processAudioFile FUNCTION
// ===========================================
async function processAudioFile(inputPath, outputPath, format, metadata, logFilePath) {
  return new Promise((resolve, reject) => {
    log(`🎵 processAudioFile FUNCTION CALLED`, logFilePath);
    log(`   ⮡ Input path: ${inputPath}`, logFilePath);
    log(`   ⮡ Output path: ${outputPath}`, logFilePath);
    log(`   ⮡ Format: ${format}`, logFilePath);
    log(`   ⮡ Metadata: ${JSON.stringify(metadata)}`, logFilePath);

    const settings = AUDIO_FORMATS[format];
    if (!settings) {
      const msg = `Unsupported audio format: ${format}`;
      log(`❌ ${msg}`, logFilePath);
      return reject(new Error(msg));
    }

    const coverArtPath = path.join(__dirname, '..', 'resources', 'elements', 'DA1neverBlankmetaMetaData_Cover_01.jpg');

    const command = ffmpeg(inputPath)
      .setFfmpegPath(ffmpegStatic)
      .audioCodec(settings.codec)
      .audioChannels(2)
      .outputOptions('-b:a', settings.bitrate || '')
      .outputOptions('-metadata', `title=${metadata.title || ''}`)
      .outputOptions('-metadata', `artist=${metadata.artist || ''}`)
      .outputOptions('-metadata', `album=${metadata.album || ''}`)
      .outputOptions('-metadata', `genre=${metadata.genre || ''}`)
      .outputOptions('-id3v2_version', '3')
      .addInput(coverArtPath)
      .outputOptions('-map', '0:a', '-map', '1:v')
      .outputOptions('-c:v', 'copy')
      .outputOptions('-metadata:s:v', 'title=Album cover')
      .outputOptions('-metadata:s:v', 'comment=Cover (front)')
      .output(outputPath)
      .on('start', (cmd) => {
        log(`▶️ FFMPEG Command: ${cmd}`, logFilePath);
      })
      .on('end', () => {
        log(`✅ Successfully processed file: ${outputPath}`, logFilePath);
        resolve(outputPath);
      })
      .on('error', (err) => {
        log(`❌ FFmpeg error: ${err.message}`, logFilePath);
        reject(err);
      });

    command.run();
  });
}

module.exports = {
  processDA1,
  processAudioFile
};