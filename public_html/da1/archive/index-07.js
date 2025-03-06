async function processDA1() {
    const { createFFmpeg, fetchFile } = FFmpeg;
    const ffmpeg = createFFmpeg({ log: true });
    
    try {
        // Show loading indicator
        document.getElementById('progress').innerHTML = "<i class='bi bi-arrow-repeat spin'></i> Loading FFmpeg...";
        await ffmpeg.load();

        const inputFiles = document.getElementById('input-files').files;
        const coverArt = document.getElementById('cover-art').files[0];

        if (inputFiles.length === 0) {
            alert("Please upload at least one audio file.");
            document.getElementById('progress').innerHTML = "";
            return;
        }

        document.getElementById('progress').innerHTML = "<i class='bi bi-arrow-repeat spin'></i> Processing files...";

        const metadata = {
            title: document.getElementById('title').value || "Unknown Title",
            artist: document.getElementById('artist').value || "Unknown Artist",
            album: document.getElementById('album').value || "Unknown Album",
            genre: document.getElementById('genre').value || "Unknown Genre"
        };

        let outputFiles = [];

        for (let file of inputFiles) {
            const fileExt = file.name.split('.').pop();
            const fileName = `input.${fileExt}`;
            const baseFileName = file.name.split('.')[0].replace(/[^a-z0-9]/gi, '_'); // Sanitize filename
            
            // Write the input file to the virtual file system
            document.getElementById('progress').innerHTML = `<i class='bi bi-arrow-repeat spin'></i> Processing ${file.name}...`;
            ffmpeg.FS('writeFile', fileName, await fetchFile(file));
            
            // Write cover art if provided
            if (coverArt) {
                const coverArtName = 'cover.' + coverArt.name.split('.').pop();
                ffmpeg.FS('writeFile', coverArtName, await fetchFile(coverArt));
            }

            // Process all supported formats
            const formats = ["mp3", "flac", "wav", "m4a"];
            for (let format of formats) {
                document.getElementById('progress').innerHTML = `<i class='bi bi-arrow-repeat spin'></i> Creating ${format} file...`;
                const outputName = `${baseFileName}.${format}`;
                let command = ['-i', fileName];

                // Add cover art if provided
                if (coverArt) {
                    const coverArtName = 'cover.' + coverArt.name.split('.').pop();
                    command = command.concat(['-i', coverArtName, '-map', '0', '-map', '1']);
                }

                // Add metadata
                Object.keys(metadata).forEach(key => {
                    command.push('-metadata', `${key}=${metadata[key]}`);
                });

                // Format-specific encoding settings
                if (format === "mp3") command.push('-c:a', 'libmp3lame', '-q:a', '2');
                if (format === "flac") command.push('-c:a', 'flac');
                if (format === "wav") command.push('-c:a', 'pcm_s16le');
                if (format === "m4a") command.push('-c:a', 'aac', '-b:a', '192k');

                // Add cover art settings if provided
                if (coverArt) {
                    command.push('-c:v', 'copy');
                    command.push('-metadata:s:v', 'title="Album cover"');
                    command.push('-metadata:s:v', 'comment="Cover (front)"');
                }

                command.push(outputName);
                await ffmpeg.run(...command);
                outputFiles.push(outputName);
            }

            // Create DA1 file (for now, just copy the mp3 as a DA1 file)
            document.getElementById('progress').innerHTML = `<i class='bi bi-arrow-repeat spin'></i> Creating DA1 file...`;
            const da1OutputName = `${baseFileName}.da1`;
            await ffmpeg.run('-i', `${baseFileName}.mp3`, '-c', 'copy', da1OutputName);
            outputFiles.push(da1OutputName);
        }

        // Generate Download Links
        document.getElementById('progress').innerHTML = "<i class='bi bi-check-circle'></i> Done! Your files are ready for download:";
        const downloadSection = document.getElementById('download-links');
        downloadSection.innerHTML = "";

        outputFiles.forEach(outputName => {
            try {
                const data = ffmpeg.FS('readFile', outputName);
                let mimeType = "application/octet-stream";
                let iconClass = "bi-file-earmark";
                
                if (outputName.endsWith('mp3')) {
                    mimeType = "audio/mpeg";
                    iconClass = "bi-file-earmark-music";
                }
                if (outputName.endsWith('flac')) {
                    mimeType = "audio/flac";
                    iconClass = "bi-file-earmark-music";
                }
                if (outputName.endsWith('wav')) {
                    mimeType = "audio/wav";
                    iconClass = "bi-file-earmark-music";
                }
                if (outputName.endsWith('m4a')) {
                    mimeType = "audio/m4a";
                    iconClass = "bi-file-earmark-music";
                }
                if (outputName.endsWith('da1')) {
                    mimeType = "application/octet-stream";
                    iconClass = "bi-file-earmark-binary";
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

    } catch (error) {
        document.getElementById('progress').innerHTML = `<i class='bi bi-exclamation-triangle'></i> Error: ${error.message}`;
        console.error('FFmpeg error:', error);
    }
}