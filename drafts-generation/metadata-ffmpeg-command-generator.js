function generateCommand() {
    const audioFile = document.getElementById("audioFile").files[0];
    const albumArt = document.getElementById("albumArt").files[0];
    const title = document.getElementById("title").value;
    const artist = document.getElementById("artist").value;
    const album = document.getElementById("album").value;
    const genre = document.getElementById("genre").value;
    const outputFileBase = document.getElementById("outputFile").value || "output";

    // Get selected formats
    let formats = Array.from(document.querySelectorAll("#outputFormats input:checked")).map(el => el.value);
    if (formats.length === 0) {
        alert("Please select at least one output format.");
        return;
    }

    let command = `ffmpeg -i "${audioFile.name}" \\\n`;
    if (title) command += `-metadata title="${title}" \\\n`;
    if (artist) command += `-metadata artist="${artist}" \\\n`;
    if (album) command += `-metadata album="${album}" \\\n`;
    if (genre) command += `-metadata genre="${genre}" \\\n`;

    formats.forEach(format => {
        let outputFile = `"${outputFileBase}.${format}"`;

        if (["mp3", "flac", "m4a"].includes(format) && albumArt) {
            command += `-i "${albumArt.name}" -map 0 -map 1 -c:a copy -c:v mjpeg \\\n`;
        }

        if (format === "wav") {
            command += `-c:a copy \\\n`;
        }

        command += `${outputFile} \\\n`;
    });

    document.getElementById("commandPreview").value = command.trim();
    document.getElementById("terminalOutput").textContent = `[${new Date().toLocaleTimeString()}] Command Generated:\n${command}`;
}
