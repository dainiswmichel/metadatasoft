const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegStatic);

const router = express.Router();

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ 
  storage,
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB limit
});

// Health check route
router.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'DA1 Backend is running' });
});

// Compile API
router.post('/api/compile', upload.array('files'), async (req, res) => {
  try {
    const files = req.files;
    const formats = JSON.parse(req.body.formats || '[]');
    
    // Extract metadata from form if available
    const metadata = {
      title: req.body.title || '',
      artist: req.body.artist || '',
      album: req.body.album || '',
      genre: req.body.genre || ''
    };

    console.log(`✅ Files received: ${files.length}`);
    console.log(`✅ Formats selected: ${formats}`);
    console.log(`✅ Metadata:`, metadata);

    const timestamp = Date.now();
    const packageId = `package_${timestamp}`;
    const outputDir = path.join(__dirname, 'output', packageId);

    fs.mkdirSync(outputDir, { recursive: true });

    // Create DA1 Package
    const da1Filename = `DA1_Package_${timestamp}.da1`;
    const da1FilePath = path.join(outputDir, da1Filename);
    
    // Create DA1 package with metadata
    const da1Contents = `DA1 Package ID: ${packageId}
Timestamp: ${new Date().toISOString()}
Title: ${metadata.title || 'Unknown Title'}
Artist: ${metadata.artist || 'Unknown Artist'}
Album: ${metadata.album || 'Unknown Album'}
Genre: ${metadata.genre || 'Unknown Genre'}
Files:
${files.map(f => f.originalname).join('\n')}
Formats:
${formats.join('\n')}
`;
    
    fs.writeFileSync(da1FilePath, da1Contents);

    // Process files according to selected formats
    const downloadLinks = [
      { filename: da1Filename, path: `/output/${packageId}/${da1Filename}` }
    ];

    // Process audio formats
    const audioFormats = ['mp3', 'wav', 'flac', 'aiff', 'm4a', 'ogg', 'aac', 'alac'];
    
    // Track promises for parallel processing
    const processingPromises = [];

    for (const format of formats) {
      if (audioFormats.includes(format)) {
        // Process audio files for this format
        for (const file of files) {
          // Only process audio files
          if (file.mimetype.startsWith('audio/')) {
            const outputFilename = `${path.parse(file.originalname).name}_${format}_${timestamp}.${format}`;
            const outputPath = path.join(outputDir, outputFilename);
            
            // Add to processing queue
            processingPromises.push(
              processAudioFile(file.path, outputPath, format, metadata)
                .then(() => {
                  // Add to download links when complete
                  downloadLinks.push({
                    filename: outputFilename,
                    path: `/output/${packageId}/${outputFilename}`
                  });
                })
            );
          }
        }
      } else {
        // For platform-specific packages and reports
        const formatFile = `${format.toUpperCase()}_${timestamp}.txt`;
        const formatFilePath = path.join(outputDir, formatFile);
        
        let formatContents = `Format: ${format}\n`;
        formatContents += `Timestamp: ${new Date().toISOString()}\n`;
        formatContents += `Title: ${metadata.title || 'Unknown Title'}\n`;
        formatContents += `Artist: ${metadata.artist || 'Unknown Artist'}\n`;
        formatContents += `Album: ${metadata.album || 'Unknown Album'}\n`;
        formatContents += `Genre: ${metadata.genre || 'Unknown Genre'}\n\n`;
        
        // Add format-specific content
        if (format === 'isrc-sheet') {
          formatContents += `ISRC Sheet for ${metadata.title || 'Unknown'}\n`;
          formatContents += `Generated: ${new Date().toISOString()}\n`;
          formatContents += `Files:\n${files.map(f => `${f.originalname}: ISRC-PENDING-${timestamp}`).join('\n')}`;
        } else if (format === 'da1xml-export') {
          formatContents += `<?xml version="1.0" encoding="UTF-8"?>\n`;
          formatContents += `<DA1Package id="${packageId}" timestamp="${timestamp}">\n`;
          formatContents += `  <Metadata>\n`;
          formatContents += `    <Title>${escapeXml(metadata.title || 'Unknown Title')}</Title>\n`;
          formatContents += `    <Artist>${escapeXml(metadata.artist || 'Unknown Artist')}</Artist>\n`;
          formatContents += `    <Album>${escapeXml(metadata.album || 'Unknown Album')}</Album>\n`;
          formatContents += `    <Genre>${escapeXml(metadata.genre || 'Unknown Genre')}</Genre>\n`;
          formatContents += `  </Metadata>\n`;
          formatContents += `  <Files>\n`;
          files.forEach(f => {
            formatContents += `    <File name="${escapeXml(f.originalname)}" size="${f.size}" type="${f.mimetype}" />\n`;
          });
          formatContents += `  </Files>\n`;
          formatContents += `</DA1Package>`;
        } else if (format === 'spotify' || format === 'bandcamp' || format === 'youtube' || 
                   format === 'distrokid' || format === 'cdbaby') {
          formatContents += `Platform: ${format}\n`;
          formatContents += `Release Information:\n`;
          formatContents += `- Title: ${metadata.title || 'Unknown Title'}\n`;
          formatContents += `- Artist: ${metadata.artist || 'Unknown Artist'}\n`;
          formatContents += `- Album: ${metadata.album || 'Unknown Album'}\n`;
          formatContents += `- Genre: ${metadata.genre || 'Unknown Genre'}\n`;
          formatContents += `- Release Date: ${new Date().toISOString().split('T')[0]}\n`;
          formatContents += `- Files: ${files.length}\n`;
          formatContents += `\nThis package contains the properly formatted files for ${format} submission.`;
        } else {
          formatContents += `Files:\n${files.map(f => f.originalname).join('\n')}`;
        }
        
        fs.writeFileSync(formatFilePath, formatContents);
        
        downloadLinks.push({
          filename: formatFile,
          path: `/output/${packageId}/${formatFile}`
        });
      }
    }

    // Wait for all audio processing to complete
    await Promise.all(processingPromises);

    console.log('✅ All processing complete');

    res.json({
      success: true,
      message: 'Compilation successful',
      packageId,
      downloadLinks
    });

  } catch (error) {
    console.error('❌ Error processing compilation:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      details: error.message 
    });
  }
});

// Function to process audio files with metadata embedding
async function processAudioFile(inputPath, outputPath, format, metadata) {
  return new Promise((resolve, reject) => {
    console.log(`Processing ${inputPath} to ${format} format...`);
    
    let command = ffmpeg(inputPath)
      .outputFormat(format);
    
    // Add metadata based on format
    if (['mp3', 'flac', 'm4a', 'ogg', 'aac'].includes(format)) {
      command = command
        .outputOptions('-metadata', `title=${metadata.title || 'Unknown Title'}`)
        .outputOptions('-metadata', `artist=${metadata.artist || 'Unknown Artist'}`)
        .outputOptions('-metadata', `album=${metadata.album || 'Unknown Album'}`)
        .outputOptions('-metadata', `genre=${metadata.genre || 'Unknown Genre'}`);
    }
    
    // Format-specific optimizations
    if (format === 'mp3') {
      command = command
        .audioBitrate('320k')
        .audioChannels(2);
    } else if (format === 'flac') {
      command = command
        .audioQuality(5) // Range is 0-10, 5 is a good balance
        .audioChannels(2);
    } else if (format === 'wav') {
      command = command
        .audioCodec('pcm_s16le')
        .audioChannels(2);
    } else if (format === 'aac') {
      command = command
        .audioBitrate('256k')
        .audioChannels(2);
    }
    
    command
      .on('error', (err) => {
        console.error(`❌ Error processing ${format} file:`, err);
        reject(err);
      })
      .on('end', () => {
        console.log(`✅ Successfully processed ${format} file: ${outputPath}`);
        resolve();
      })
      .save(outputPath);
  });
}

// Helper function to escape XML special characters
function escapeXml(unsafe) {
  if (typeof unsafe !== 'string') return '';
  return unsafe.replace(/[<>&'"]/g, c => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

module.exports = router;