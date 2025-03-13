// Cover art preview functionality
document.addEventListener('DOMContentLoaded', function() {
    const coverArtInput = document.getElementById('cover-art');
    if (coverArtInput) {
        coverArtInput.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const previewContainer = document.getElementById('cover-preview');
                    if (previewContainer) {
                        previewContainer.innerHTML = `<img src="${e.target.result}" alt="Cover preview">`;
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }
});

// Function to process DA1 files
function processDA1() {
    const inputFiles = document.getElementById('input-files').files;
    const coverArt = document.getElementById('cover-art')?.files[0];
    const customXML = document.getElementById('custom-xml')?.files[0];
    
    // Get metadata values
    const title = document.getElementById('title')?.value || '';
    const artist = document.getElementById('artist')?.value || '';
    const album = document.getElementById('album')?.value || '';
    const genre = document.getElementById('genre')?.value || '';
    
    // Get options
    const excludeNeverBlank = document.getElementById('exclude-never-blank')?.checked || false;
    const createNewXML = document.getElementById('create-new-xml')?.checked || false;
    
    // Check if files are selected
    if (!inputFiles || inputFiles.length === 0) {
        alert('Please select at least one file to process.');
        return;
    }
    
    // Update progress
    const progressElement = document.getElementById('progress');
    if (progressElement) {
        progressElement.innerHTML = '<i class="bi bi-gear spin"></i> Processing your files...';
    }
    
    // Simulate processing (replace with actual processing logic)
    setTimeout(() => {
        // Generate random filename for demo
        const timestamp = new Date().getTime();
        const filename = `DA1_Package_${timestamp}.da1`;
        
        // Update progress and show download links
        if (progressElement) {
            progressElement.innerHTML = '<i class="bi bi-check-circle"></i> Processing complete!';
        }
        
        const downloadLinks = document.getElementById('download-links');
        if (downloadLinks) {
            downloadLinks.innerHTML = `
                <p><a href="#" download="${filename}"><i class="bi bi-file-earmark-arrow-down"></i> ${filename}</a> (Complete DA1 package)</p>
                <p><a href="#" download="metadata_${timestamp}.xml"><i class="bi bi-file-earmark-code"></i> metadata_${timestamp}.xml</a> (Extracted metadata)</p>
            `;
        }
    }, 3000);
}

/**
 * Function: toggleAllSubFileTypes
 * Master control to check/uncheck all SubFileType checkboxes.
 *
 * @param {HTMLElement} checkbox - The master checkbox element.
 */
function toggleAllSubFileTypes(checkbox) {
    // Get all subfiletype checkboxes inside the document
    const subfiletypeCheckboxes = document.querySelectorAll('.subfiletype-checkbox');
  
    // Iterate and set each checkbox's state to match the master checkbox
    subfiletypeCheckboxes.forEach((cb) => {
      cb.checked = checkbox.checked;
    });
  }
  