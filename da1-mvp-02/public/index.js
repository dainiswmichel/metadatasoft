// CONFIGURATION
// Auto-detect environment and set the correct backend URL
const BACKEND_URL = (() => {
  const hostname = window.location.hostname;
  
  // Local development environments
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://127.0.0.1:3000';
  }
  
  // Production environment
  return `https://api.${hostname.replace('www.', '')}`;
})();

console.log(`✅ Using backend URL: ${BACKEND_URL}`);

// Track upload progress
let uploadProgressInterval;

// MAIN FUNCTION
async function processDA1() {
  console.log('▶️ Starting DA1 compilation process');

  const inputElement = document.getElementById('raw-source-files');
  const progressElement = document.getElementById('progress');
  const downloadLinksContainer = document.getElementById('download-links');
  const titleInput = document.getElementById('title');
  const artistInput = document.getElementById('artist');
  const albumInput = document.getElementById('album');
  const genreInput = document.getElementById('genre');

  if (!inputElement || inputElement.files.length === 0) {
    alert('Please select at least one file.');
    return;
  }

  const selectedFormats = Array.from(document.querySelectorAll('.subfiletype-checkbox:checked'))
    .map(cb => cb.value);

  if (selectedFormats.length === 0) {
    alert('Please select at least one format.');
    return;
  }

  // Show progress spinner and text
  if (progressElement) {
    progressElement.innerHTML = '<i class="bi bi-gear spin"></i> Compiling DA1 package...';
    startProgressAnimation(progressElement);
  }

  try {
    // Check backend health before proceeding
    try {
      const healthCheck = await fetch(`${BACKEND_URL}/api/health`);
      if (!healthCheck.ok) {
        throw new Error('Backend health check failed');
      }
      console.log('✅ Backend health check passed');
    } catch (healthError) {
      console.error('❌ Backend health check failed:', healthError);
      throw new Error('Cannot connect to server. Please try again later.');
    }
    
    // Create form data with files and metadata
    const formData = new FormData();
    Array.from(inputElement.files).forEach(file => {
      formData.append('files', file);
    });
    
    // Add metadata if provided
    if (titleInput && titleInput.value.trim()) {
      formData.append('title', titleInput.value.trim());
    }
    if (artistInput && artistInput.value.trim()) {
      formData.append('artist', artistInput.value.trim());
    }
    if (albumInput && albumInput.value.trim()) {
      formData.append('album', albumInput.value.trim());
    }
    if (genreInput && genreInput.value.trim()) {
      formData.append('genre', genreInput.value.trim());
    }
    
    // Add selected formats
    formData.append('formats', JSON.stringify(selectedFormats));

    // Calculate total file size for tracking progress
    const totalFileSize = Array.from(inputElement.files)
      .reduce((sum, file) => sum + file.size, 0);
    console.log(`📊 Total upload size: ${formatFileSize(totalFileSize)}`);
    
    // Make API request
    console.log('🔄 Sending request to:', `${BACKEND_URL}/api/compile`);
    const response = await fetch(`${BACKEND_URL}/api/compile`, {
      method: 'POST',
      body: formData
    });

    // Stop the progress animation
    stopProgressAnimation();

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Server error:', response.status, errorText);
      throw new Error(`Server returned ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Compilation complete:', result);

    if (progressElement) {
      progressElement.innerHTML = '<i class="bi bi-check-circle"></i> Compilation complete!';
    }

    if (downloadLinksContainer && result.downloadLinks && result.downloadLinks.length > 0) {
      let html = '<h3>Download Files:</h3>';
      html += '<div class="download-links-grid">';
      
      // Group download links by type
      const mainPackage = result.downloadLinks.find(link => link.filename.includes('DA1_Package'));
      const audioFiles = result.downloadLinks.filter(link => 
        /\.(mp3|wav|flac|aiff|m4a|ogg|aac|alac)$/i.test(link.filename));
      const reports = result.downloadLinks.filter(link => 
        /(ISRC|XML|PRO|REPORT)/i.test(link.filename));
      const otherFiles = result.downloadLinks.filter(link => 
        !link.filename.includes('DA1_Package') && 
        !(/\.(mp3|wav|flac|aiff|m4a|ogg|aac|alac)$/i.test(link.filename)) &&
        !(/(ISRC|XML|PRO|REPORT)/i.test(link.filename)));
      
      // Add main package download
      if (mainPackage) {
        html += `
          <div class="download-card main-package">
            <div class="download-icon">
              <i class="bi bi-file-earmark-zip"></i>
            </div>
            <div class="download-info">
              <div class="download-name">DA1 Package</div>
              <a href="${BACKEND_URL}${mainPackage.path}" download class="download-link">
                <i class="bi bi-download"></i> Download
              </a>
            </div>
          </div>`;
      }
      
      // Add audio files
      audioFiles.forEach(link => {
        const extension = link.filename.split('.').pop().toLowerCase();
        const formatName = link.filename.includes('_') 
          ? link.filename.split('_')[1].toUpperCase() 
          : extension.toUpperCase();
        
        html += `
          <div class="download-card">
            <div class="download-icon">
              <i class="bi bi-file-earmark-music"></i>
            </div>
            <div class="download-info">
              <div class="download-name">${formatName}</div>
              <a href="${BACKEND_URL}${link.path}" download class="download-link">
                <i class="bi bi-download"></i> Download
              </a>
            </div>
          </div>`;
      });
      
      // Add reports
      reports.forEach(link => {
        html += `
          <div class="download-card">
            <div class="download-icon">
              <i class="bi bi-file-earmark-text"></i>
            </div>
            <div class="download-info">
              <div class="download-name">${link.filename.split('_')[0]}</div>
              <a href="${BACKEND_URL}${link.path}" download class="download-link">
                <i class="bi bi-download"></i> Download
              </a>
            </div>
          </div>`;
      });
      
      // Add other files
      otherFiles.forEach(link => {
        html += `
          <div class="download-card">
            <div class="download-icon">
              <i class="bi bi-file-earmark"></i>
            </div>
            <div class="download-info">
              <div class="download-name">${link.filename.split('_')[0]}</div>
              <a href="${BACKEND_URL}${link.path}" download class="download-link">
                <i class="bi bi-download"></i> Download
              </a>
            </div>
          </div>`;
      });
      
      html += '</div>';
      
      // Add download all button
      html += `
        <div class="download-all-container">
          <button onclick="downloadAllFiles()" class="download-all-button">
            <i class="bi bi-download"></i> Download All Files
          </button>
        </div>`;
      
      downloadLinksContainer.innerHTML = html;
      
      // Scroll to download section
      downloadLinksContainer.scrollIntoView({ behavior: 'smooth' });
    }

  } catch (error) {
    console.error('❌ Error:', error);
    stopProgressAnimation();
    
    if (progressElement) {
      progressElement.innerHTML = `<i class="bi bi-exclamation-triangle"></i> Error: ${error.message}`;
    }
  }
}

// Helper function to format file size
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' bytes';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
  else if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + ' MB';
  else return (bytes / 1073741824).toFixed(2) + ' GB';
}

// Progress animation functions
function startProgressAnimation(progressElement) {
  if (!progressElement) return;
  
  let dots = '';
  uploadProgressInterval = setInterval(() => {
    dots = dots.length >= 3 ? '' : dots + '.';
    const currentText = progressElement.innerText.replace(/\.+$/, '');
    progressElement.innerHTML = `<i class="bi bi-gear spin"></i> ${currentText}${dots}`;
  }, 500);
}

function stopProgressAnimation() {
  if (uploadProgressInterval) {
    clearInterval(uploadProgressInterval);
    uploadProgressInterval = null;
  }
}

// Download all files function
function downloadAllFiles() {
  const links = document.querySelectorAll('.download-link');
  
  // Delay each download slightly to avoid browser blocking
  links.forEach((link, index) => {
    setTimeout(() => {
      link.click();
    }, index * 500);
  });
}

// Toggle all checkboxes function
function toggleAllSubFileTypes(checkbox) {
  const isChecked = checkbox.checked;
  document.querySelectorAll('.subfiletype-checkbox').forEach(cb => {
    cb.checked = isChecked;
  });
}

// Initialize when document is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Check if backend is reachable on page load
  fetch(`${BACKEND_URL}/api/health`)
    .then(response => {
      if (response.ok) {
        console.log('✅ Backend connection established');
      } else {
        console.warn('⚠️ Backend responded with error');
      }
    })
    .catch(error => {
      console.error('❌ Cannot connect to backend:', error);
    });
});
