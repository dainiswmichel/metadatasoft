// index.js - DA1 Web Converter with FFmpeg.wasm Integration

const { createFFmpeg, fetchFile } = FFmpeg;
let ffmpeg = null;
let isFFmpegLoaded = false;

async function initFFmpeg() {
    if (isFFmpegLoaded) return;
    
    ffmpeg = createFFmpeg({
        log: true,
        corePath: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@latest/dist/ffmpeg-core.js'
    });
    
    console.log('Loading FFmpeg...');
    await ffmpeg.load();
    console.log('✓ FFmpeg loaded and ready!');
    isFFmpegLoaded = true;
}

window.addEventListener('load', async () => {
    await initFFmpeg();
});

async function processFile(inputFile, coverArt, metadata, outputFormats) {
    if (!isFFmpegLoaded) {
        alert("FFmpeg is still loading. Please wait.");
        return;
    }

    console.log("Processing file with metadata:", metadata);
    const inputFileName = `input${inputFile.name.split('.').pop()}`;
    ffmpeg.FS('writeFile', inputFileName, await fetchFile(inputFile));

    let coverFileName = null;
    if (coverArt) {
        coverFileName = `cover${coverArt.name.split('.').pop()}`;
        ffmpeg.FS('writeFile', coverFileName, await fetchFile(coverArt));
    }
    
    const outputFiles = [];

    for (const format of outputFormats) {
        const outputName = `output.${format}`;
        let command = ['-i', inputFileName];
        
        if (coverFileName) {
            command.push('-i', coverFileName, '-map', '0:a', '-map', '1', '-c:a', 'copy',
                '-metadata:s:v', 'title=Album cover', '-metadata:s:v', 'comment=Cover (front)');
        }
        
        Object.keys(metadata).forEach(key => {
            command.push('-metadata', `${key}=${metadata[key]}`);
        });
        
        if (format === 'mp3') {
            command.push('-c:a', 'libmp3lame', '-q:a', '2');
        } else if (format === 'flac') {
            command.push('-c:a', 'flac');
        } else if (format === 'bwf') {
            command.push('-c:a', 'pcm_s16le');
        } else if (format === 'm4a') {
            command.push('-c:a', 'aac');
        }
        
        command.push(outputName);

        console.log("Executing FFmpeg command:", command.join(" "));
        await ffmpeg.run(...command);

        const outputData = ffmpeg.FS('readFile', outputName);
        const mimeType = format === 'mp3' ? 'audio/mpeg' : format === 'flac' ? 'audio/flac' :
                         format === 'm4a' ? 'audio/mp4' : format === 'bwf' ? 'audio/wav' : 'application/octet-stream';
        
        const blob = new Blob([outputData.buffer], { type: mimeType });
        const downloadUrl = URL.createObjectURL(blob);
        outputFiles.push({ format, downloadUrl });
    }
    
    return outputFiles;
}

function log(message) {
    console.log(`[${new Date().toLocaleTimeString()}] ${message}`);
}

// Generate and display the FFmpeg command based on user inputs.
function generateCommand() {
    const audioInput = document.getElementById('input-file');
    const coverInput = document.getElementById('cover-art');
    const audioFile = audioInput.files[0];
    if (!audioFile) {
        alert("Please select an audio file.");
        return;
    }
    const coverArt = coverInput.files[0];

    const title = document.getElementById('title').value.trim();
    const artist = document.getElementById('artist').value.trim();
    const album = document.getElementById('album').value.trim();
    const genre = document.getElementById('genre').value.trim();
    const outputFilename = document.getElementById('output_filename').value.trim();
    if (!outputFilename) {
        alert("Please enter an output filename.");
        return;
    }
    const format = document.querySelector('input[name="format"]:checked').value;
    const outputName = `${outputFilename}.${format}`;

    let command = 'ffmpeg ';

    // For MP3 with cover art, add the extra input and mapping.
    if (format === 'mp3' && coverArt) {
        command += `-i "${audioFile.name}" -i "${coverArt.name}" -map 0:a -map 1 `;
        command += `-c:a libmp3lame -q:a 2 -id3v2_version 3 `;
        command += `-metadata:s:v title="Album cover" -metadata:s:v comment="Cover (front)" `;
    } else {
        command += `-i "${audioFile.name}" `;
    }

    if (title) command += `-metadata title="${title}" `;
    if (artist) command += `-metadata artist="${artist}" `;
    if (album) command += `-metadata album="${album}" `;
    if (genre) command += `-metadata genre="${genre}" `;

    if (format === 'bwf') {
        command += `-c:a pcm_s16le "${outputName}"`;
    } else if (format === 'mp3') {
        if (!coverArt) {
            command += `-c:a libmp3lame -q:a 2 "${outputName}"`;
        } else {
            command += `"${outputName}"`;
        }
    } else if (format === 'flac') {
        command += `-c:a flac "${outputName}"`;
    } else if (format === 'm4a') {
        command += `-c:a aac "${outputName}"`;
    } else {
        command += `-c:a copy "${outputName}"`;
    }

    document.getElementById('commandPreview').value = command;
}

// Copy the generated command to the clipboard.
function copyCommand() {
    const commandText = document.getElementById('commandPreview').value;
    if (!commandText) {
        alert("No command to copy. Please generate a command first.");
        return;
    }
    navigator.clipboard.writeText(commandText)
        .then(() => alert("Command copied to clipboard!"))
        .catch(err => alert("Failed to copy command: " + err));
}

// Run the FFmpeg command using the WebAssembly environment.
async function runCommand() {
    if (!isFFmpegLoaded) {
        alert("FFmpeg not loaded yet. Please wait.");
        return;
    }

    const audioInput = document.getElementById('input-file');
    const coverInput = document.getElementById('cover-art');
    const audioFile = audioInput.files[0];
    if (!audioFile) {
        alert("Please select an audio file.");
        return;
    }
    const coverArt = coverInput.files[0];

    const title = document.getElementById('title').value.trim();
    const artist = document.getElementById('artist').value.trim();
    const album = document.getElementById('album').value.trim();
    const genre = document.getElementById('genre').value.trim();
    const outputFilename = document.getElementById('output_filename').value.trim();
    if (!outputFilename) {
        alert("Please enter an output filename.");
        return;
    }
    const format = document.querySelector('input[name="format"]:checked').value;
    const outputName = `${outputFilename}.${format}`;

    try {
        // Write the audio file into FFmpeg's virtual filesystem.
        const audioData = await audioFile.arrayBuffer();
        const audioExt = audioFile.name.substring(audioFile.name.lastIndexOf('.'));
        const audioFileName = 'input' + audioExt;
        ffmpeg.FS('writeFile', audioFileName, new Uint8Array(audioData));
        log(`Loaded audio file: ${audioFileName}`);

        let coverFileName = null;
        if (format === 'mp3' && coverArt) {
            const coverData = await coverArt.arrayBuffer();
            const coverExt = coverArt.name.substring(coverArt.name.lastIndexOf('.'));
            coverFileName = 'cover' + coverExt;
            ffmpeg.FS('writeFile', coverFileName, new Uint8Array(coverData));
            log(`Loaded cover art file: ${coverFileName}`);
        }

        // Build the FFmpeg command arguments.
        let args = [];
        if (format === 'mp3' && coverFileName) {
            args.push('-i', audioFileName, '-i', coverFileName, '-map', '0:a', '-map', '1',
                      '-c:a', 'libmp3lame', '-q:a', '2', '-id3v2_version', '3',
                      '-metadata:s:v', 'title=Album cover', '-metadata:s:v', 'comment=Cover (front)');
        } else {
            args.push('-i', audioFileName);
        }
        if (title) args.push('-metadata', `title=${title}`);
        if (artist) args.push('-metadata', `artist=${artist}`);
        if (album) args.push('-metadata', `album=${album}`);
        if (genre) args.push('-metadata', `genre=${genre}`);
        if (format === 'bwf') {
            args.push('-c:a', 'pcm_s16le');
        } else if (format === 'mp3') {
            if (!coverFileName) args.push('-c:a', 'libmp3lame', '-q:a', '2');
        } else if (format === 'flac') {
            args.push('-c:a', 'flac');
        } else if (format === 'm4a') {
            args.push('-c:a', 'aac');
        } else {
            args.push('-c:a', 'copy');
        }
        args.push(outputName);

        log('Executing FFmpeg command:');
        log(args.join(' '));
        await ffmpeg.run(...args);
        log('Processing complete!');

        // Read the output file and create a download link.
        const outputData = ffmpeg.FS('readFile', outputName);
        let mimeType;
        if (format === 'bwf') mimeType = 'audio/wav';
        else if (format === 'mp3') mimeType = 'audio/mpeg';
        else if (format === 'flac') mimeType = 'audio/flac';
        else if (format === 'm4a') mimeType = 'audio/mp4';
        else mimeType = 'application/octet-stream';

        const blob = new Blob([outputData.buffer], { type: mimeType });
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = outputName;
        link.textContent = `Download ${outputName}`;
        link.style.display = 'block';
        link.style.marginTop = '10px';
        document.getElementById('terminal').appendChild(link);

        // Clean up files from the FFmpeg filesystem.
        ffmpeg.FS('unlink', audioFileName);
        if (coverFileName) ffmpeg.FS('unlink', coverFileName);
        ffmpeg.FS('unlink', outputName);
    } catch (error) {
        log('Error: ' + error.message, 'error');
        console.error(error);
    }
}

// Embed using FFmpeg.wasm
async function embedUsingFFmpeg() {
    if (!isFFmpegLoaded) {
        alert("FFmpeg not loaded yet. Please wait.");
        return;
    }

    const audioInput = document.getElementById('input-file');
    const coverInput = document.getElementById('cover-art');
    const audioFile = audioInput.files[0];
    if (!audioFile) {
        alert("Please select an audio file.");
        return;
    }
    const coverArt = coverInput.files[0];

    const title = document.getElementById('title').value.trim();
    const artist = document.getElementById('artist').value.trim();
    const album = document.getElementById('album').value.trim();
    const genre = document.getElementById('genre').value.trim();
    const outputFilename = document.getElementById('output_filename').value.trim();
    if (!outputFilename) {
        alert("Please enter an output filename.");
        return;
    }
    const format = document.querySelector('input[name="format"]:checked').value;
    const outputName = `${outputFilename}.${format}`;

    try {
        // Write the audio file into FFmpeg's virtual filesystem.
        const audioData = await audioFile.arrayBuffer();
        const audioExt = audioFile.name.substring(audioFile.name.lastIndexOf('.'));
        const audioFileName = 'input' + audioExt;
        ffmpeg.FS('writeFile', audioFileName, new Uint8Array(audioData));
        log(`Loaded audio file: ${audioFileName}`);

        let coverFileName = null;
        if (format === 'mp3' && coverArt) {
            const coverData = await coverArt.arrayBuffer();
            const coverExt = coverArt.name.substring(coverArt.name.lastIndexOf('.'));
            coverFileName = 'cover' + coverExt;
            ffmpeg.FS('writeFile', coverFileName, new Uint8Array(coverData));
            log(`Loaded cover art file: ${coverFileName}`);
        }

        // Build the FFmpeg command arguments.
        let args = [];
        if (format === 'mp3' && coverFileName) {
            args.push('-i', audioFileName, '-i', coverFileName, '-map', '0:a', '-map', '1',
                      '-c:a', 'libmp3lame', '-q:a', '2', '-id3v2_version', '3',
                      '-metadata:s:v', 'title=Album cover', '-metadata:s:v', 'comment=Cover (front)');
        } else {
            args.push('-i', audioFileName);
        }
        if (title) args.push('-metadata', `title=${title}`);
        if (artist) args.push('-metadata', `artist=${artist}`);
        if (album) args.push('-metadata', `album=${album}`);
        if (genre) args.push('-metadata', `genre=${genre}`);
        if (format === 'bwf') {
            args.push('-c:a', 'pcm_s16le');
        } else if (format === 'mp3') {
            if (!coverFileName) args.push('-c:a', 'libmp3lame', '-q:a', '2');
        } else if (format === 'flac') {
            args.push('-c:a', 'flac');
        } else if (format === 'm4a') {
            args.push('-c:a', 'aac');
        } else {
            args.push('-c:a', 'copy');
        }
        args.push(outputName);

        log('Executing FFmpeg command:');
        log(args.join(' '));
        await ffmpeg.run(...args);
        log('Processing complete!');

        // Read the output file and create a download link.
        const outputData = ffmpeg.FS('readFile', outputName);
        let mimeType;
        if (format === 'bwf') mimeType = 'audio/wav';
        else if (format === 'mp3') mimeType = 'audio/mpeg';
        else if (format === 'flac') mimeType = 'audio/flac';
        else if (format === 'm4a') mimeType = 'audio/mp4';
        else mimeType = 'application/octet-stream';

        const blob = new Blob([outputData.buffer], { type: mimeType });
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = outputName;
        link.textContent = `Download ${outputName}`;
        link.style.display = 'block';
        link.style.marginTop = '10px';
        document.getElementById('terminal').appendChild(link);

        // Clean up files from the FFmpeg filesystem.
        ffmpeg.FS('unlink', audioFileName);
        if (coverFileName) ffmpeg.FS('unlink', coverFileName);
        ffmpeg.FS('unlink', outputName);
    } catch (error) {
        log('Error: ' + error.message, 'error');
        console.error(error);
    }
}