// Enhanced processDA1 function with PDF, video, and extensible metadata support
async function processDA1() {
    const { createFFmpeg, fetchFile } = FFmpeg;
    const ffmpeg = createFFmpeg({ log: true });
    
    try {
        // Show loading indicator
        document.getElementById('progress').innerHTML = "<i class='bi bi-arrow-repeat spin'></i> Loading FFmpeg...";
        await ffmpeg.load();

        // Get all input files
        const audioFiles = document.getElementById('audio-files').files;
        const videoFiles = document.getElementById('video-files').files;
        const pdfFiles = document.getElementById('pdf-files').files;
        const coverArt = document.getElementById('cover-art').files[0];

        if (audioFiles.length === 0 && videoFiles.length === 0) {
            alert("Please upload at least one audio or video file.");
            document.getElementById('progress').innerHTML = "";
            return;
        }

        document.getElementById('progress').innerHTML = "<i class='bi bi-arrow-repeat spin'></i> Processing files...";

        // Collect all metadata
        const basicMetadata = {
            title: document.getElementById('title').value || "Unknown Title",
            artist: document.getElementById('artist').value || "Unknown Artist",
            album: document.getElementById('album').value || "Unknown Album",
            genre: document.getElementById('genre').value || "Unknown Genre"
        };
        
        // Get custom metadata fields
        const customMetadata = collectCustomMetadata();

        // Create DA1XML metadata structure
        const da1xml = createDA1XML(basicMetadata, customMetadata);

        let outputFiles = [];
        let da1ManifestEntries = [];

        // Process Audio Files
        for (let file of audioFiles) {
            await processMediaFile(file, 'audio', da1xml, outputFiles, da1ManifestEntries);
        }

        // Process Video Files
        for (let file of videoFiles) {
            await processMediaFile(file, 'video', da1xml, outputFiles, da1ManifestEntries);
        }

        // Process PDF Files
        for (let file of pdfFiles) {
            const pdfFileName = file.name;
            const sanitizedName = pdfFileName.split('.')[0].replace(/[^a-z0-9]/gi, '_');
            
            document.getElementById('progress').innerHTML = `<i class='bi bi-arrow-repeat spin'></i> Processing ${pdfFileName}...`;
            
            // Write PDF to virtual filesystem
            ffmpeg.FS('writeFile', pdfFileName, await fetchFile(file));
            
            // Add to manifest
            da1ManifestEntries.push({
                type: 'pdf',
                filename: pdfFileName,
                embeddedName: `${sanitizedName}.pdf`
            });
        }

        // Create consolidated DA1 package
        await createDA1Package(da1ManifestEntries, da1xml, outputFiles);

        // Generate Download Links
        generateDownloadLinks(outputFiles);

    } catch (error) {
        document.getElementById('progress').innerHTML = `<i class='bi bi-exclamation-triangle'></i> Error: ${error.message}`;
        console.error('FFmpeg error:', error);
    }
}

// Process a single media file (audio or video)
async function processMediaFile(file, mediaType, da1xml, outputFiles, da1ManifestEntries) {
    const fileExt = file.name.split('.').pop().toLowerCase();
    const fileName = `input.${fileExt}`;
    const baseFileName = file.name.split('.')[0].replace(/[^a-z0-9]/gi, '_');
    
    // Write the input file to the virtual file system
    document.getElementById('progress').innerHTML = `<i class='bi bi-arrow-repeat spin'></i> Processing ${file.name}...`;
    ffmpeg.FS('writeFile', fileName, await fetchFile(file));
    
    // Write cover art if provided
    const coverArt = document.getElementById('cover-art').files[0];
    let coverArtName = null;
    if (coverArt) {
        coverArtName = 'cover.' + coverArt.name.split('.').pop();
        ffmpeg.FS('writeFile', coverArtName, await fetchFile(coverArt));
    }

    // Determine output formats based on media type
    let formats = [];
    if (mediaType === 'audio') {
        formats = ["mp3", "flac", "m4a", "wav"];
    } else if (mediaType === 'video') {
        formats = ["mp4", "webm"];
    }

    // Process all supported formats
    for (let format of formats) {
        document.getElementById('progress').innerHTML = `<i class='bi bi-arrow-repeat spin'></i> Creating ${format} file...`;
        const outputName = `${baseFileName}.${format}`;
        
        // Prepare FFmpeg command
        let command = await buildFFmpegCommand(fileName, outputName, format, mediaType, coverArtName, da1xml);
        
        // Run FFmpeg command
        await ffmpeg.run(...command);
        outputFiles.push(outputName);
        
        // Add to manifest for DA1 package
        da1ManifestEntries.push({
            type: mediaType,
            format: format,
            filename: outputName
        });
    }
    
    return baseFileName;
}

// Build FFmpeg command based on file type and options
async function buildFFmpegCommand(inputFile, outputFile, format, mediaType, coverArtName, da1xml) {
    let command = ['-i', inputFile];
    
    // Add cover art if provided
    if (coverArtName) {
        command = command.concat(['-i', coverArtName, '-map', '0', '-map', '1']);
    }
    
    // Add basic metadata
    Object.keys(da1xml.basicMetadata).forEach(key => {
        command.push('-metadata', `${key}=${da1xml.basicMetadata[key]}`);
    });
    
    // Add DA1XML as custom metadata
    command.push('-metadata', `DA1XML=${JSON.stringify(da1xml)}`);
    
    // Format-specific encoding settings
    if (mediaType === 'audio') {
        if (format === "mp3") command.push('-c:a', 'libmp3lame', '-q:a', '2');
        if (format === "flac") command.push('-c:a', 'flac');
        if (format === "wav") command.push('-c:a', 'pcm_s16le');
        if (format === "m4a") command.push('-c:a', 'aac', '-b:a', '192k');
    } else if (mediaType === 'video') {
        if (format === "mp4") command.push('-c:v', 'libx264', '-c:a', 'aac');
        if (format === "webm") command.push('-c:v', 'libvpx', '-c:a', 'libvorbis');
    }
    
    // Add cover art settings if provided
    if (coverArtName) {
        command.push('-c:v', 'copy');
        command.push('-metadata:s:v', 'title="Album cover"');
        command.push('-metadata:s:v', 'comment="Cover (front)"');
    }
    
    command.push(outputFile);
    return command;
}

// Create the DA1XML metadata structure
function createDA1XML(basicMetadata, customMetadata) {
    return {
        version: "1.0",
        basicMetadata: basicMetadata,
        customMetadata: customMetadata,
        embeddedFiles: [],  // Will be populated during processing
        created: new Date().toISOString(),
        processingInfo: {
            software: "DA1 Automated Audio Compilation",
            version: "0.7"
        }
    };
}

// Collect custom metadata from the UI
function collectCustomMetadata() {
    const customMetadataContainer = document.getElementById('custom-metadata-fields');
    let customMetadata = {};
    
    if (!customMetadataContainer) return customMetadata;
    
    const fields = customMetadataContainer.querySelectorAll('.custom-metadata-field');
    
    fields.forEach(field => {
        const key = field.querySelector('.metadata-key').value.trim();
        const value = field.querySelector('.metadata-value').value.trim();
        
        if (key && value) {
            customMetadata[key] = value;
        }
    });
    
    return customMetadata;
}

// Create a consolidated DA1 package
async function createDA1Package(manifestEntries, da1xml, outputFiles) {
    document.getElementById('progress').innerHTML = `<i class='bi bi-arrow-repeat spin'></i> Creating DA1 package...`;
    
    // Update DA1XML with embedded file information
    da1xml.embeddedFiles = manifestEntries;
    
    // Create manifest JSON file
    const manifestJSON = JSON.stringify({
        da1xml: da1xml,
        files: manifestEntries
    }, null, 2);
    
    ffmpeg.FS('writeFile', 'da1manifest.json', manifestJSON);
    
    // Create a package name based on metadata
    const packageName = (da1xml.basicMetadata.artist && da1xml.basicMetadata.title) ? 
        `${da1xml.basicMetadata.artist.replace(/[^a-z0-9]/gi, '_')}_${da1xml.basicMetadata.title.replace(/[^a-z0-9]/gi, '_')}` : 
        `da1package_${new Date().getTime()}`;
    
    // For now, we'll use a zip-like approach, but this could be enhanced with a custom container format
    // In a production implementation, this would create a proper DA1 format specification
    
    // For demo purposes, we'll just create a marker file that indicates this is a DA1 package
    const da1MarkerContent = `DA1 Package Format v1.0\nCreated: ${new Date().toISOString()}\nFile count: ${manifestEntries.length}\n`;
    ffmpeg.FS('writeFile', 'da1marker.txt', da1MarkerContent);
    
    // In a real implementation, you would combine all files into a single container
    // For now, we'll just add the marker and manifest to the output files
    outputFiles.push('da1manifest.json');
    outputFiles.push('da1marker.txt');
    
    // Create a DA1 extension file that references the manifest
    // This is a placeholder for a real DA1 container format
    const da1OutputName = `${packageName}.da1`;
    await ffmpeg.run('-i', manifestEntries[0].filename, '-attach', 'da1manifest.json', '-metadata:s:t', 'mimetype=application/json', '-c', 'copy', da1OutputName);
    
    outputFiles.push(da1OutputName);
}

// Generate download links for all output files
function generateDownloadLinks(outputFiles) {
    document.getElementById('progress').innerHTML = "<i class='bi bi-check-circle'></i> Done! Your files are ready for download:";
    const downloadSection = document.getElementById('download-links');
    downloadSection.innerHTML = "";

    outputFiles.forEach(outputName => {
        try {
            const data = ffmpeg.FS('readFile', outputName);
            let mimeType = "application/octet-stream";
            let iconClass = "bi-file-earmark";
            
            // Set appropriate MIME type and icon based on file extension
            if (outputName.endsWith('mp3')) {
                mimeType = "audio/mpeg";
                iconClass = "bi-file-earmark-music";
            } else if (outputName.endsWith('flac')) {
                mimeType = "audio/flac";
                iconClass = "bi-file-earmark-music";
            } else if (outputName.endsWith('wav')) {
                mimeType = "audio/wav";
                iconClass = "bi-file-earmark-music";
            } else if (outputName.endsWith('m4a')) {
                mimeType = "audio/m4a";
                iconClass = "bi-file-earmark-music";
            } else if (outputName.endsWith('mp4')) {
                mimeType = "video/mp4";
                iconClass = "bi-file-earmark-play";
            } else if (outputName.endsWith('webm')) {
                mimeType = "video/webm";
                iconClass = "bi-file-earmark-play";
            } else if (outputName.endsWith('pdf')) {
                mimeType = "application/pdf";
                iconClass = "bi-file-earmark-pdf";
            } else if (outputName.endsWith('da1')) {
                mimeType = "application/octet-stream";
                iconClass = "bi-file-earmark-binary";
            } else if (outputName.endsWith('json')) {
                mimeType = "application/json";
                iconClass = "bi-file-earmark-code";
            }
            
            const blob = new Blob([data.buffer], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = outputName;
            link.className = "download-link";
            link.innerHTML = `<i class="bi ${iconClass}"></i> ${outputName}`;
            downloadSection.appendChild(link);
            downloadSection.appendChild(document.createElement('br'));
        } catch (error) {
            console.error(`Error creating download for ${outputName}:`, error);
        }
    });
}

// UI function to add a custom metadata field
function addCustomMetadataField() {
    const container = document.getElementById('custom-metadata-fields');
    const fieldDiv = document.createElement('div');
    fieldDiv.className = 'custom-metadata-field form-group';
    
    fieldDiv.innerHTML = `
        <div class="metadata-row">
            <input type="text" class="metadata-key" placeholder="Key">
            <input type="text" class="metadata-value" placeholder="Value">
            <button type="button" class="remove-field" onclick="removeCustomMetadataField(this)">
                <i class="bi bi-x-circle"></i>
            </button>
        </div>
    `;
    
    container.appendChild(fieldDiv);
}

// UI function to remove a custom metadata field
function removeCustomMetadataField(button) {
    const fieldDiv = button.closest('.custom-metadata-field');
    fieldDiv.remove();
}