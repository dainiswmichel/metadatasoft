document.getElementById('taggerForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const inputFile = document.getElementById('input_file').files[0];
    const outputFileName = document.getElementById('output_file_name').value;
    const outputFormats = Array.from(document.querySelectorAll('input[name="format"]:checked')).map(el => el.value);
    
    if (!inputFile) {
        alert('Please select an input file.');
        return;
    }
    
    if (!outputFileName) {
        alert('Please specify an output file name.');
        return;
    }
    
    if (outputFormats.length === 0) {
        alert('Please select at least one output format.');
        return;
    }
    
    checkDependencies().then(dependencies => {
        if (!dependencies.ffmpeg) {
            alert('FFmpeg is not installed. Please install FFmpeg to use this application.');
            return;
        }
        if (!dependencies.node) {
            alert('Node.js is not installed. Please install Node.js to use this application.');
            return;
        }
        
        const formData = new FormData();
        formData.append('input_file', inputFile);
        formData.append('output_file_name', outputFileName);
        formData.append('output_formats', JSON.stringify(outputFormats));
        
        fetch('/process', {
            method: 'POST',
            body: formData
        }).then(response => response.json()).then(data => {
            if (data.success) {
                alert('Files processed successfully.');
            } else {
                alert('Error processing files: ' + data.error);
            }
        }).catch(error => {
            console.error('Error:', error);
            alert('Error processing files.');
        });
    }).catch(error => {
        console.error('Error checking dependencies:', error);
        alert('Error checking dependencies.');
    });
});

function checkDependencies() {
    return fetch('/check-dependencies')
        .then(response => response.json())
        .catch(error => {
            console.error('Error checking dependencies:', error);
            return { ffmpeg: false, node: false };
        });
}

document.addEventListener('DOMContentLoaded', checkDependencies);