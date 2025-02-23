document.getElementById('generateCommand').addEventListener('click', function() {
    const audioFile = document.getElementById('audioFile').files[0];
    const albumArt = document.getElementById('albumArt').files[0];
    const title = document.getElementById('title').value.trim();
    const artist = document.getElementById('artist').value.trim();
    const album = document.getElementById('album').value.trim();
    const genre = document.getElementById('genre').value.trim();
    const outputFile = document.getElementById('outputFile').value.trim();
    
    if (!audioFile || !outputFile) {
        alert('Audio file and output file name are required.');
        return;
    }

    let outputFormats = [];
    document.querySelectorAll('.format-options input:checked').forEach(input => {
        outputFormats.push(input.value);
    });

    if (outputFormats.length === 0) {
        alert('Please select at least one output format.');
        return;
    }

    let command = `ffmpeg -i "${audioFile.name}"`;

    if (albumArt) {
        command += ` -i "${albumArt.name}" -map 0 -map 1 -c:v mjpeg`;
    }

    if (title) command += ` -metadata title="${title}"`;
    if (artist) command += ` -metadata artist="${artist}"`;
    if (album) command += ` -metadata album="${album}"`;
    if (genre) command += ` -metadata genre="${genre}"`;

    outputFormats.forEach(format => {
        command += ` -c:a copy "${outputFile}.${format}"`;
    });

    document.getElementById('commandPreview').value = command;
});

document.getElementById('copyCommand').addEventListener('click', function() {
    const command = document.getElementById('commandPreview');
    command.select();
    document.execCommand('copy');
    alert('Command copied to clipboard!');
});

document.getElementById('runTerminal').addEventListener('click', function() {
    const command = document.getElementById('commandPreview').value;
    if (!command) {
        alert('Generate a command first.');
        return;
    }

    fetch('/run-command', { // Needs backend for execution
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command })
    })
    .then(response => response.text())
    .then(output => {
        document.getElementById('terminalOutput').innerText = output;
    })
    .catch(error => {
        document.getElementById('terminalOutput').innerText = "Error: " + error;
    });
});