async function processDA1() {
    const { createFFmpeg, fetchFile } = FFmpeg;
    const ffmpeg = createFFmpeg({ log: true });
    await ffmpeg.load();

    const inputFiles = document.getElementById('input-files').files;
    const coverArt = document.getElementById('cover-art').files[0];

    if (inputFiles.length === 0) {
        alert("Please upload at least one audio file.");
        return;
    }

    document.getElementById('progress').innerText = "Processing...";

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
        ffmpeg.FS('writeFile', fileName, await fetchFile(file));

        const formats = ["mp3", "flac", "bwf", "m4a"];
        for (let format of formats) {
            const outputName = `output.${format}`;
            let command = ['-i', fileName];

            Object.keys(metadata).forEach(key => {
                command.push('-metadata', `${key}=${metadata[key]}`);
            });

            command.push(outputName);
            await ffmpeg.run(...command);
            outputFiles.push(outputName);
        }
    }

    // Generate download links
    document.getElementById('progress').innerText = "Done!";
    const downloadSection = document.getElementById('download-links');
    downloadSection.innerHTML = "";

    outputFiles.forEach(outputName => {
        const data = ffmpeg.FS('readFile', outputName);
        const blob = new Blob([data.buffer], { type: "audio/mpeg" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = outputName;
        link.innerText = `Download ${outputName}`;
        downloadSection.appendChild(link);
        downloadSection.appendChild(document.createElement('br'));
    });
}
