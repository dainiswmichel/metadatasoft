function generateCommand() {
    const audioFile = document.getElementById("audioFile").files[0];
    const albumArt = document.getElementById("albumArt").files[0];
    const title = document.getElementById("title").value;
    const artist = document.getElementById("artist").value;
    const album = document.getElementById("album").value;
    const genre = document.getElementById("genre").value;
    const outputFileBase = document.getElementById("outputFile").value || "output";

    // Get selected format
    const format = document.querySelector("#outputFormats input:checked").value;
    if (!format) {
        alert("Please select an output format.");
        return;
    }

    let command = `ffmpeg -i "${audioFile.name}" \\\n`;
    if (title) command += `-metadata title="${title}" \\\n`;
    if (artist) command += `-metadata artist="${artist}" \\\n`;
    if (album) command += `-metadata album="${album}" \\\n`;
    if (genre) command += `-metadata genre="${genre}" \\\n`;

    let outputFile = `"${outputFileBase}.${format}"`;

    if (["mp3", "flac", "m4a"].includes(format) && albumArt) {
        command += `-i "${albumArt.name}" -map 0 -map 1 -c:a copy -c:v mjpeg \\\n`;
    }

    if (format === "wav") {
        command += `-c:a copy \\\n`;
    }

    command += `${outputFile} \\\n`;

    document.getElementById("commandPreview").value = command.trim();
}

function copyCommand() {
    const commandText = document.getElementById("commandPreview").value;
    navigator.clipboard.writeText(commandText);
    alert("Command copied!");
}

// Initialize the Xterm.js Terminal
const terminal = new Terminal();
terminal.open(document.getElementById("terminal"));

function runCommand() {
    const command = document.getElementById("commandPreview").value;
    if (!command) {
        terminal.writeln("⚠️ No command generated yet!");
        return;
    }

    terminal.writeln(`💻 Running: ${command}`);
    
    fetch("/run-command", {
        method: "POST",
        body: JSON.stringify({ command }),
        headers: { "Content-Type": "application/json" }
    })
    .then(response => response.text())
    .then(output => terminal.writeln(output))
    .catch(error => terminal.writeln(`❌ Error: ${error.message}`));
}

function showEducationalContent(field) {
    const content = {
        audioFile: "Select an audio file to tag.",
        albumArt: "Select an optional album art image.",
        title: "Enter the title of the track.",
        artist: "Enter the artist's name.",
        album: "Enter the album name.",
        genre: "Enter the genre of the track.",
        outputFile: "Enter the base name for the output file."
    };

    document.getElementById("educational-content").textContent = content[field];
    document.getElementById("educational-content").style.display = "block";
}
