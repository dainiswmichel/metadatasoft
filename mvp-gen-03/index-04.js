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

    document.getElementById('progress').innerHTML = "<i class='fa fa-spinner fa-spin'></i> Processing...";

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
            const outputName = `${file.name.split('.')[0]}.${format}`;
            let command = ['-i', fileName];

            Object.keys(metadata).forEach(key => {
                command.push('-metadata', `${key}=${metadata[key]}`);
            });

            if (format === "mp3") command.push('-c:a', 'libmp3lame', '-q:a', '2');
            if (format === "flac") command.push('-c:a', 'flac');
            if (format === "bwf") command.push('-c:a', 'pcm_s16le');
            if (format === "m4a") command.push('-c:a', 'aac');

            command.push(outputName);
            await ffmpeg.run(...command);
            outputFiles.push(outputName);
        }
    }

    // Generate DA1 File
    const da1Output = "output.da1";
    await ffmpeg.run('-i', outputFiles[0], '-c', 'copy', da1Output);
    outputFiles.push(da1Output);

    // Generate Download Links
    document.getElementById('progress').innerHTML = "<i class='fa fa-check'></i> Done!";
    const downloadSection = document.getElementById('download-links');
    downloadSection.innerHTML = "";

    outputFiles.forEach(outputName => {
        const data = ffmpeg.FS('readFile', outputName);
        const blob = new Blob([data.buffer], { type: "application/octet-stream" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = outputName;
        link.innerHTML = `<i class="fa fa-download"></i> Download ${outputName}`;
        downloadSection.appendChild(link);
        downloadSection.appendChild(document.createElement('br'));
    });
}
