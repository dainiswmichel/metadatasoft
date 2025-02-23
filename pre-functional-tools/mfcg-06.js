let ffmpeg = null;
let terminal = null;

function log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    terminal.writeln(`[${timestamp}] ${message}`);
}

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

window.addEventListener('load', () => {
    terminal = new Terminal();
    terminal.open(document.getElementById('terminal'));
    terminal.write('Welcome to the Audio Tagger Terminal\r\n');
    terminal.prompt = () => {
        terminal.write('\r\n$ ');
    };
    terminal.prompt();
    initFFmpeg();
});

function generateCommand() {
    const audioFile = document.getElementById('input-file').files[0];
    if (!audioFile) {
        alert('Please select an audio file.');
        return;
    }
    const coverArt = document.getElementById('cover-art').files[0];
    const title = document.getElementById('title').value;
    const artist = document.getElementById('artist').value;
    const album = document.getElementById('album').value;
    const genre = document.getElementById('genre').value;
    const outputFile = document.getElementById('output_filename').value.trim();
    const outputFormat = document.querySelector('input[name="format"]:checked').value;
    
    if (!outputFile) {
        alert('Please enter an output file name.');
        return;
    }
    
    const outputName = `${outputFile}.${outputFormat}`;
    let command = `ffmpeg -i "${audioFile.name}" `;
    if (coverArt) {
        command += `-i "${coverArt.name}" -map 0 -map 1 -c:v mjpeg `;
    }
    if (title) command += `-metadata title="${title}" `;
    if (artist) command += `-metadata artist="${artist}" `;
    if (album) command += `-metadata album="${album}" `;
    if (genre) command += `-metadata genre="${genre}" `;
    
    // Use proper audio codec based on output format
    if (outputFormat === 'wav') {
        command += `-c:a copy "${outputName}"`;
    } else if (outputFormat === 'mp3') {
        command += `-c:a libmp3lame "${outputName}"`;
    } else if (outputFormat === 'flac') {
        command += `-c:a flac "${outputName}"`;
    } else if (outputFormat === 'm4a') {
        command += `-c:a aac "${outputName}"`;
    } else {
        command += `-c:a copy "${outputName}"`;
    }
    document.getElementById('commandPreview').value = command;
}

function copyCommand() {
    const commandText = document.getElementById('commandPreview').value;
    navigator.clipboard.writeText(commandText);
    alert('Command copied!');
}

async function runCommand() {
    if (!ffmpeg) {
        log('FFmpeg not initialized. Please wait...');
        return;
    }
    
    const audioFile = document.getElementById('input-file').files[0];
    if (!audioFile) {
        alert('Please select an audio file.');
        return;
    }
    const coverArt = document.getElementById('cover-art').files[0];
    const title = document.getElementById('title').value;
    const artist = document.getElementById('artist').value;
    const album = document.getElementById('album').value;
    const genre = document.getElementById('genre').value;
    const outputFile = document.getElementById('output_filename').value.trim();
    const outputFormat = document.querySelector('input[name="format"]:checked').value;
    
    if (!outputFile) {
        alert('Please enter an output file name.');
        return;
    }
    
    const outputName = `${outputFile}.${outputFormat}`;
    
    try {
        // Write audio file into the FFmpeg file system.
        const audioData = await audioFile.arrayBuffer();
        const audioFileName = `audio${audioFile.name.substring(audioFile.name.lastIndexOf('.'))}`;
        ffmpeg.FS('writeFile', audioFileName, new Uint8Array(audioData));
        log(`Loaded audio file: ${audioFileName}`);

        // Write cover art if provided.
        let coverArtFileName = null;
        if (coverArt) {
            const coverData = await coverArt.arrayBuffer();
            coverArtFileName = `cover${coverArt.name.substring(coverArt.name.lastIndexOf('.'))}`;
            ffmpeg.FS('writeFile', coverArtFileName, new Uint8Array(coverData));
            log(`Loaded cover art file: ${coverArtFileName}`);
        }
        
        // Build the command arguments array.
        let cmd = ['-i', audioFileName];
        if (coverArtFileName) {
            cmd.push('-i', coverArtFileName, '-map', '0', '-map', '1', '-c:v', 'mjpeg');
        }
        if (title) cmd.push('-metadata', `title=${title}`);
        if (artist) cmd.push('-metadata', `artist=${artist}`);
        if (album) cmd.push('-metadata', `album=${album}`);
        if (genre) cmd.push('-metadata', `genre=${genre}`);
        
        // Choose the correct audio codec based on output format.
        if (outputFormat === 'wav') {
            cmd.push('-c:a', 'copy');
        } else if (outputFormat === 'mp3') {
            cmd.push('-c:a', 'libmp3lame');
        } else if (outputFormat === 'flac') {
            cmd.push('-c:a', 'flac');
        } else if (outputFormat === 'm4a') {
            cmd.push('-c:a', 'aac');
        } else {
            cmd.push('-c:a', 'copy');
        }
        cmd.push(outputName);

        log('Executing FFmpeg command:');
        log(cmd.join(' '));
        await ffmpeg.run(...cmd);
        log('Processing complete!', 'success');

        // Read output and create a download link.
        const outputData = ffmpeg.FS('readFile', outputName);
        const blob = new Blob([outputData.buffer], { type: 'audio/mpeg' });
        const url = URL.createObjectURL(blob);
        log(`Download link: ${url}`);
        
        // Clean up the FS.
        ffmpeg.FS('unlink', audioFileName);
        if (coverArtFileName) ffmpeg.FS('unlink', coverArtFileName);
        ffmpeg.FS('unlink', outputName);
    } catch (error) {
        log('Error: ' + error.message, 'error');
        console.error(error);
    }
}
