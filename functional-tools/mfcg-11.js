let ffmpeg = null;
let terminal = null;
let commandBuffer = '';

// Log a message with a timestamp to the terminal.
function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  terminal.writeln(`[${timestamp}] ${message}`);
}

// Initialize FFmpeg using the core from unpkg (or your local copy)
async function initFFmpeg() {
  try {
    const { createFFmpeg, fetchFile } = FFmpeg;
    ffmpeg = createFFmpeg({
      log: true,
      corePath: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/ffmpeg-core.js'
    });
    log('Loading FFmpeg...');
    await ffmpeg.load();
    log('✓ FFmpeg loaded and ready!', 'success');
  } catch (error) {
    log('Error loading FFmpeg: ' + error.message, 'error');
    console.error(error);
  }
}

// Terminal input handler (for interactive commands, if needed)
function handleTerminalInput(data) {
  for (let i = 0; i < data.length; i++) {
    const char = data[i];
    if (char === '\r') {
      terminal.write('\r\n');
      executeCommand(commandBuffer.trim());
      commandBuffer = '';
      terminal.prompt();
    } else if (char === '\u007F') {
      if (commandBuffer.length > 0) {
        commandBuffer = commandBuffer.slice(0, -1);
        terminal.write('\b \b');
      }
    } else {
      commandBuffer += char;
      terminal.write(char);
    }
  }
}

function executeCommand(command) {
  if (command === 'clear') {
    terminal.clear();
  } else {
    terminal.write(`Command not recognized: ${command}`);
  }
}

// Process file: reads the input, adds metadata, builds the FFmpeg command,
// runs it, and logs the result. (Note: the download link code has been removed.)
async function processFile() {
  if (!ffmpeg) {
    log('Error: FFmpeg not initialized. Please wait or reload the page.', 'error');
    return;
  }

  const processBtn = document.getElementById('process-btn');
  processBtn.disabled = true;

  try {
    // Get input file from the file input element
    const fileInput = document.getElementById('input-file');
    const file = fileInput.files[0];
    if (!file) throw new Error('Please select an audio file.');

    // Read the input file and write it to FFmpeg's virtual filesystem
    const data = await file.arrayBuffer();
    const inputFileName = 'input' + file.name.substring(file.name.lastIndexOf('.'));
    ffmpeg.FS('writeFile', inputFileName, new Uint8Array(data));
    log(`Input file loaded: ${inputFileName}`);

    // Get metadata from the form fields
    const metadata = {
      title: document.getElementById('title').value,
      artist: document.getElementById('artist').value,
      album: document.getElementById('album').value,
      genre: document.getElementById('genre').value,
      date: document.getElementById('release_date') ? document.getElementById('release_date').value : '',
      track: document.getElementById('track_number') ? document.getElementById('track_number').value : '',
      disc: document.getElementById('disc_number') ? document.getElementById('disc_number').value : '',
      copyright: document.getElementById('copyright') ? document.getElementById('copyright').value : '',
      language: document.getElementById('language') ? document.getElementById('language').value : ''
      // Add additional metadata fields as needed
    };

    // Determine output format and filename
    const outputFormat = document.querySelector('input[name="format"]:checked').value;
    let outputFilename = document.getElementById('output_filename').value.trim();
    if (!outputFilename) {
      outputFilename = file.name.substring(0, file.name.lastIndexOf('.'));
    }
    // Sanitize filename (optional)
    outputFilename = outputFilename.replace(/[^a-zA-Z0-9-_]/g, '_');
    const outputName = `${outputFilename}.${outputFormat}`;

    // Build the FFmpeg command array.
    // For simplicity, we use a basic command that copies audio and attaches metadata.
    const ffmpegCommand = [
      '-i', inputFileName,
      '-c', 'copy'
    ];

    // Append metadata flags
    Object.entries(metadata).forEach(([key, value]) => {
      if (value) {
        ffmpegCommand.push('-metadata', `${key}=${value}`);
      }
    });

    ffmpegCommand.push(outputName);

    // Log the constructed command in the terminal
    log('Executing FFmpeg command:');
    log(ffmpegCommand.join(' '));

    // Run the command with FFmpeg
    await ffmpeg.run(...ffmpegCommand);
    log('Processing complete! Output file created in FFmpeg FS.', 'success');

    // (Download link code has been intentionally removed.)
    // Optionally, you might add code here to handle the output file further.
    
    // Clean up: remove the files from the virtual filesystem
    ffmpeg.FS('unlink', inputFileName);
    ffmpeg.FS('unlink', outputName);

  } catch (error) {
    log('Error: ' + error.message, 'error');
    console.error('Full error:', error);
  } finally {
    processBtn.disabled = false;
  }
}

// Initialize terminal and FFmpeg on page load
window.addEventListener('load', () => {
  terminal = new Terminal();
  terminal.open(document.getElementById('terminal'));
  terminal.write('Welcome to the Audio File Tagger Terminal\r\n');
  terminal.prompt = () => {
    terminal.write('\r\n$ ');
  };
  terminal.prompt();
  terminal.onData(e => {
    handleTerminalInput(e);
  });
  initFFmpeg();
});
