/**
 * ==========================================
 * DA1.FM - Frontend Application Script
 * ==========================================
 * 
 * This script handles the user interface interactions, form submission,
 * and communication with the DA1.FM API.
 */

// ==========================================
// Configuration
// ==========================================
const API_ENDPOINTS = {
  engrave: '/api/engrave',
  download: '/download'
};

// ==========================================
// DOM Elements
// ==========================================
// Get references to important page elements
const form = document.getElementById('da1MetaForm') || document.createElement('div');
const rawSourceInput = document.getElementById('raw-source-files');
const titleInput = document.getElementById('title');
const artistInput = document.getElementById('artist');
const albumInput = document.getElementById('album');
const genreInput = document.getElementById('genre');
const progressElement = document.getElementById('progress');
const downloadLinksElement = document.getElementById('download-links');
const processButton = document.querySelector('button[onclick="processDA1()"]');

// ==========================================
// Main Processing Function
// ==========================================

/**
 * Handles the main DA1 package processing
 * Collects form data, validates it, and submits to the API
 */
function processDA1() {
  // Validate input
  if (!rawSourceInput || !rawSourceInput.files || rawSourceInput.files.length === 0) {
    showError("Please select an audio file to process");
    return;
  }
  
  const audioFile = rawSourceInput.files[0];
  
  // Disable the button to prevent multiple submissions
  if (processButton) {
    processButton.disabled = true;
    processButton.innerText = "Processing...";
  }
  
  // Show loading state
  showProgress("Preparing files...", 0);
  
  // Create FormData object
  const formData = new FormData();
  
  // Add audio file
  formData.append('raw-source-files', audioFile);
  
  // Add metadata
  if (titleInput) formData.append('title', titleInput.value);
  if (artistInput) formData.append('artist', artistInput.value);
  if (albumInput) formData.append('album', albumInput.value);
  if (genreInput) formData.append('genre', genreInput.value);
  
  // Get selected formats
  const selectedFormats = [];
  document.querySelectorAll('input[name="outputFormats"]:checked').forEach(checkbox => {
    selectedFormats.push(checkbox.value);
  });
  
  if (selectedFormats.length === 0) {
    // Default to MP3 and FLAC if nothing selected
    selectedFormats.push('mp3', 'flac');
    // Attempt to check the corresponding checkboxes
    try {
      document.querySelector('input[name="outputFormats"][value="mp3"]').checked = true;
      document.querySelector('input[name="outputFormats"][value="flac"]').checked = true;
    } catch (error) {
      console.warn("Could not auto-select MP3 and FLAC checkboxes");
    }
  }
  
  // Add formats to form data
  selectedFormats.forEach(format => {
    formData.append('outputFormats', format);
  });
  
  // Show processing message
  showProgress(`Processing audio into ${selectedFormats.join(', ')} formats...`, 10);
  
  // Send to API with progress tracking
  const xhr = new XMLHttpRequest();
  xhr.open('POST', API_ENDPOINTS.engrave, true);
  
  // Setup upload progress tracker
  xhr.upload.onprogress = function(e) {
    if (e.lengthComputable) {
      const percent = Math.round((e.loaded / e.total) * 40); // First 40% is upload
      showProgress(`Uploading files...`, percent);
    }
  };
  
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          
          if (response.success) {
            showProgress("Processing complete!", 100);
            
            // Display results
            displayResults(response);
          } else {
            showError(response.message || "An error occurred during processing");
          }
        } catch (error) {
          showError("Error parsing server response");
          console.error('Error:', error);
        }
      } else {
        showError(`Server error: ${xhr.status}`);
      }
      
      // Re-enable the button
      if (processButton) {
        processButton.disabled = false;
        processButton.innerText = "Compile DA1 Package";
      }
    }
  };
  
  // Simulate processing progression until we get actual progress from the server
  let progressPercent = 40;
  const progressInterval = setInterval(() => {
    progressPercent += 1;
    if (progressPercent < 99) {
      showProgress("Processing audio files...", progressPercent);
    } else {
      clearInterval(progressInterval);
    }
  }, 300);
  
  // Error handling
  xhr.onerror = function() {
    clearInterval(progressInterval);
    showError("Network error, please try again");
    
    // Re-enable the button
    if (processButton) {
      processButton.disabled = false;
      processButton.innerText = "Compile DA1 Package";
    }
  };
  
  // Send the data
  xhr.send(formData);
}

/**
 * Displays the results after successful processing
 * Creates download links for all generated files
 * 
 * @param {Object} data - Response data from the API
 */
function displayResults(data) {
  if (!downloadLinksElement) return;
  
  // Clear previous results
  downloadLinksElement.innerHTML = '';
  
  // Format HTML with download links
  let html = `
    <div class="result-success">
      <i class="bi bi-check-circle"></i> DA1 package created successfully!
    </div>
    
    <div class="download-section">
      <h3><i class="bi bi-folder"></i> DA1 Folder Structure</h3>
      <p>Access the complete DA1 folder structure:</p>
      <a href="${data.downloads.da1Folder}" target="_blank" class="download-link folder-link">
        <i class="bi bi-folder2-open"></i> Browse DA1 Folder
      </a>
    </div>
  `;
  
  // Add individual file downloads, grouped by format
  if (data.downloads.individualFiles && data.downloads.individualFiles.length > 0) {
    // Group files by format
    const formatGroups = {};
    
    data.downloads.individualFiles.forEach(file => {
      const format = file.format || 'other';
      if (!formatGroups[format]) {
        formatGroups[format] = [];
      }
      formatGroups[format].push(file);
    });
    
    html += `
      <div class="download-section">
        <h3><i class="bi bi-file-earmark-music"></i> Individual Audio Files</h3>
        <p>Download each generated audio file individually:</p>
    `;
    
    // Create format-grouped sections
    Object.keys(formatGroups).forEach(format => {
      const files = formatGroups[format];
      
      html += `
        <div class="format-group">
          <h4>${format.toUpperCase()}</h4>
          <div class="format-files">
      `;
      
      files.forEach(file => {
        const qualityLabel = file.quality ? ` (${file.quality})` : '';
        
        html += `
          <a href="${file.url}" download class="download-link file-link">
            <i class="bi bi-file-earmark-music"></i> ${file.filename}${qualityLabel}
          </a>
        `;
      });
      
      html += `
          </div>
        </div>
      `;
    });
    
    html += `</div>`;
  }
  
  // Add job ID reference
  html += `
    <div class="job-info">
      <p><strong>Job ID:</strong> ${data.jobId}</p>
    </div>
  `;
  
  // Update the download links container
  downloadLinksElement.innerHTML = html;
}

/**
 * Updates the progress display with a message and percentage
 * 
 * @param {string} message - Progress message to display
 * @param {number} percent - Percentage complete (0-100)
 */
function showProgress(message, percent = null) {
  if (!progressElement) return;
  
  let progressHTML = `<div class="progress-indicator">`;
  
  if (percent !== null) {
    progressHTML += `
      <div class="progress-bar-container">
        <div class="progress-bar" style="width: ${percent}%"></div>
      </div>
    `;
  } else {
    progressHTML += `<div class="progress-spinner"></div>`;
  }
  
  progressHTML += `<div class="progress-message">${message}</div></div>`;
  
  progressElement.innerHTML = progressHTML;
  progressElement.style.display = 'block';
}

/**
 * Displays an error message
 * 
 * @param {string} message - Error message to display
 */
function showError(message) {
  if (!progressElement) return;
  
  progressElement.innerHTML = `
    <div class="error-message">
      <i class="bi bi-exclamation-triangle"></i> ${message}
    </div>
  `;
  
  progressElement.style.display = 'block';
}

/**
 * Toggles all SubFileType checkboxes
 * Called from HTML when the master checkbox is clicked
 * 
 * @param {HTMLInputElement} checkbox - The master checkbox element
 */
function toggleAllSubFileTypes(checkbox) {
  const isChecked = checkbox.checked;
  document.querySelectorAll('.subfiletype-checkbox').forEach(cb => {
    cb.checked = isChecked;
  });
}

// Make functions globally available
window.processDA1 = processDA1;
window.toggleAllSubFileTypes = toggleAllSubFileTypes;

