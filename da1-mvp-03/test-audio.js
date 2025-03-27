// test-audio.js - Quick test script for audio processing functionality
const path = require('path');
const os = require('os');
const fs = require('fs').promises;

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

/**
 * Test audio processing with a given file
 * @param {string} inputFile - Path to audio file for testing
 */
async function testAudioProcessing(inputFile) {
  console.log(`${colors.blue}Testing audio processing for: ${colors.cyan}${inputFile}${colors.reset}`);
  
  try {
    // Try to load the audio processor
    let audioProcessor;
    try {
      audioProcessor = require('./lib/audioProcessor');
    } catch (error) {
      console.error(`${colors.red}Failed to load audio processor: ${error.message}${colors.reset}`);
      console.error(`${colors.yellow}Make sure lib/audioProcessor.js exists and is valid${colors.reset}`);
      process.exit(1);
    }
    
    // Create output path in temp directory
    const outputDir = path.join(os.tmpdir(), 'da1-test');
    await fs.mkdir(outputDir, { recursive: true });
    const outputPath = path.join(outputDir, `test-output-${Date.now()}${path.extname(inputFile)}`);
    
    console.log(`${colors.blue}Output will be saved to: ${colors.cyan}${outputPath}${colors.reset}`);
    
    // Define test metadata
    const metadata = {
      title: 'DA1 Test Title',
      artist: 'DA1 Test Artist',
      album: 'DA1 Test Album',
      year: '2025',
      comment: 'This metadata was added by DA1 test script'
    };
    
    console.log(`${colors.blue}Adding metadata:${colors.reset}`);
    console.log(metadata);
    
    // Process the file
    console.log(`${colors.yellow}Processing file...${colors.reset}`);
    const start = Date.now();
    
    const result = await audioProcessor.processAudio(inputPath, outputPath, metadata);
    
    const end = Date.now();
    console.log(`${colors.green}✓ Processing complete in ${end - start}ms${colors.reset}`);
    console.log(`${colors.green}✓ Output saved to: ${colors.cyan}${result}${colors.reset}`);
    
    // Verify metadata was written correctly
    console.log(`${colors.blue}Verifying metadata...${colors.reset}`);
    const writtenMetadata = await audioProcessor.extractMetadata(outputPath);
    console.log(`${colors.blue}Extracted metadata:${colors.reset}`);
    console.log(writtenMetadata);
    
    // Check if metadata fields were written
    const verificationResults = Object.entries(metadata).map(([key, value]) => {
      // Find corresponding key in written metadata (case insensitive)
      const matchedKey = Object.keys(writtenMetadata).find(
        k => k.toLowerCase() === key.toLowerCase() || 
             k.includes(key.toLowerCase()) || 
             key.toLowerCase().includes(k.toLowerCase())
      );
      
      if (matchedKey) {
        const writtenValue = writtenMetadata[matchedKey];
        return {
          field: key,
          expected: value,
          actual: writtenValue,
          mapped_to: matchedKey,
          success: typeof writtenValue === 'string' && writtenValue.includes(value)
        };
      }
      
      return {
        field: key,
        expected: value,
        actual: null,
        mapped_to: null,
        success: false
      };
    });
    
    // Display verification results
    console.log(`${colors.blue}Metadata verification results:${colors.reset}`);
    verificationResults.forEach(result => {
      if (result.success) {
        console.log(`${colors.green}✓ ${result.field}: ${result.expected}${colors.reset}`);
      } else {
        console.log(`${colors.red}✗ ${result.field}: Expected "${result.expected}" but got ${result.actual ? `"${result.actual}"` : 'nothing'} ${result.mapped_to ? `(mapped to ${result.mapped_to})` : ''}${colors.reset}`);
      }
    });
    
    // Overall result
    const successCount = verificationResults.filter(r => r.success).length;
    if (successCount === verificationResults.length) {
      console.log(`${colors.green}✓ All metadata fields were written correctly!${colors.reset}`);
    } else {
      console.log(`${colors.yellow}⚠ ${successCount}/${verificationResults.length} metadata fields were written correctly${colors.reset}`);
    }
    
    // Try to load metadata extractor if available
    try {
      const metadataExtractor = require('./lib/metadataExtractor');
      console.log(`\n${colors.blue}Additional test: Using metadataExtractor${colors.reset}`);
      
      // Extract metadata from the output file
      const extractedMetadata = await metadataExtractor.extractFromFile(outputPath);
      
      console.log(`${colors.green}✓ Metadata extracted successfully with metadataExtractor${colors.reset}`);
      console.log('Title:', extractedMetadata.title);
      console.log('Artist:', extractedMetadata.artist);
      console.log('Album:', extractedMetadata.album);
      
      // Test filename generation
      const generatedFilename = metadataExtractor.generateFilename(extractedMetadata, path.extname(outputPath).replace('.', ''));
      console.log(`${colors.blue}Generated filename: ${colors.cyan}${generatedFilename}${colors.reset}`);
    } catch (error) {
      console.log(`${colors.yellow}⚠ metadataExtractor not available or failed: ${error.message}${colors.reset}`);
    }
    
  } catch (error) {
    console.error(`${colors.red}✗ Error: ${error.message}${colors.reset}`);
    console.error(error);
  }
}

// Main execution
async function main() {
  try {
    // First check if FFmpeg is installed
    const audioProcessor = require('./lib/audioProcessor');
    const ffmpegInstalled = await audioProcessor.validateFFmpegInstallation();
    if (!ffmpegInstalled) {
      console.error(`${colors.red}✗ FFmpeg is not installed or not in PATH${colors.reset}`);
      console.error(`${colors.yellow}Please install FFmpeg before running this test${colors.reset}`);
      console.error(`${colors.yellow}Installation instructions:${colors.reset}`);
      console.error(`${colors.yellow}  macOS:    brew install ffmpeg${colors.reset}`);
      console.error(`${colors.yellow}  Ubuntu:   sudo apt install ffmpeg${colors.reset}`);
      console.error(`${colors.yellow}  Windows:  choco install ffmpeg${colors.reset}`);
      process.exit(1);
    }
    
    console.log(`${colors.green}✓ FFmpeg is installed${colors.reset}`);
    
    // Get input file from command line argument or use default
    const inputPath = process.argv[2];
    
    if (!inputPath) {
      console.error(`${colors.red}✗ Error: No input file specified${colors.reset}`);
      console.error(`${colors.yellow}Usage: node test-audio.js /path/to/audio-file.mp3${colors.reset}`);
      process.exit(1);
    }
    
    // Check if file exists
    try {
      await fs.access(inputPath);
    } catch (error) {
      console.error(`${colors.red}✗ Error: File not found: ${inputPath}${colors.reset}`);
      process.exit(1);
    }
    
    // Run the test
    await testAudioProcessing(inputPath);
    
  } catch (error) {
    console.error(`${colors.red}✗ Unhandled error: ${error.message}${colors.reset}`);
    console.error(error);
    process.exit(1);
  }
}

// Run the main function
main().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
