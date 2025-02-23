document.getElementById('generateBtn').addEventListener('click', () => {
    const audioInput = document.getElementById('audioFile');
    const coverInput = document.getElementById('coverArt');
    const title = document.getElementById('title').value;
    const artist = document.getElementById('artist').value;
    const album = document.getElementById('album').value;
    const genre = document.getElementById('genre').value;
    const outputFilename = document.getElementById('outputFilename').value.trim();
    const format = document.querySelector('input[name="format"]:checked').value;
    
    if (!audioInput.files[0]) {
      alert('Select an audio file.');
      return;
    }
    if (!outputFilename) {
      alert('Enter an output filename.');
      return;
    }
    
    const audioName = audioInput.files[0].name;
    let command = `ffmpeg -i "${audioName}" `;
    
    // If MP3 is chosen and cover art is provided, include the cover art.
    if (format === 'mp3' && coverInput.files[0]) {
      const coverName = coverInput.files[0].name;
      command = `ffmpeg -i "${audioName}" -i "${coverName}" -map 0:a -map 1 `;
      command += `-c:a libmp3lame -q:a 2 -id3v2_version 3 `;
      command += `-metadata:s:v title="Album cover" -metadata:s:v comment="Cover (front)" `;
    }
    
    if (title) command += `-metadata title="${title}" `;
    if (artist) command += `-metadata artist="${artist}" `;
    if (album) command += `-metadata album="${album}" `;
    if (genre) command += `-metadata genre="${genre}" `;
    
    const outputName = `${outputFilename}.${format}`;
    if (format === 'wav') {
      command += `-c:a copy "${outputName}"`;
    } else if (format === 'mp3') {
      if (!(format === 'mp3' && coverInput.files[0])) {
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
  });
  
  document.getElementById('copyBtn').addEventListener('click', () => {
    const commandText = document.getElementById('commandPreview').value;
    navigator.clipboard.writeText(commandText)
      .then(() => alert('Command copied to clipboard!'));
  });
  