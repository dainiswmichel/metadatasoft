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

// Accordion functionality
function initializeAccordion() {
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    if (accordionHeaders.length > 0) {
        // Set first accordion item as active by default (if not already set)
        if (!document.querySelector('.accordion-header.active')) {
            accordionHeaders[0].classList.add('active');
            const firstContent = accordionHeaders[0].nextElementSibling;
            if (firstContent && firstContent.classList.contains('accordion-content')) {
                firstContent.classList.add('active');
            }
        }
        
        // Add click event to all accordion headers
        accordionHeaders.forEach(header => {
            // Remove existing event listeners by cloning and replacing
            const newHeader = header.cloneNode(true);
            header.parentNode.replaceChild(newHeader, header);
            
            newHeader.addEventListener('click', function() {
                // Close all accordion items
                accordionHeaders.forEach(h => {
                    h.classList.remove('active');
                    const content = h.nextElementSibling;
                    if (content && content.classList.contains('accordion-content')) {
                        content.classList.remove('active');
                    }
                });
                
                // Open clicked accordion item
                this.classList.add('active');
                const content = this.nextElementSibling;
                if (content && content.classList.contains('accordion-content')) {
                    content.classList.add('active');
                }
            });
        });
    }
}

// Initialize components after they're loaded
document.addEventListener('DOMContentLoaded', function() {
    // Set a timeout to initialize accordion after components are loaded
    setTimeout(initializeAccordion, 500);
});