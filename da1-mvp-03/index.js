// ==========================================================
// 📂: /dainisne/da1-mvp-03/index.js
// 🔥 Version: March 18, 2025
// 📅 🕒: 2025-03m-18d-11h-01m-17s
// ==========================================================

/*---------------------------------
  START 1. COVER ART PREVIEW (AUTO-DETECT FROM RAW FILES)
---------------------------------*/

// Wait for DOM
document.addEventListener('DOMContentLoaded', function() {
  
  const rawSourceInput = document.getElementById('raw-source-files');
  const previewContainer = document.getElementById('cover-preview'); // Ensure you have this container!

  if (rawSourceInput) {
    rawSourceInput.addEventListener('change', function(event) {
      const files = Array.from(event.target.files);

      // Find the cover art file (supports .jpg and .png for now)
      const coverArtFile = files.find(file => 
        /da1_coverart_.+\.(jpg|jpeg|png)$/i.test(file.name)
      );

      if (!coverArtFile) {
        console.log('❌ No cover art file detected.');
        if (previewContainer) previewContainer.innerHTML = `<p>No cover art detected.</p>`;
        return;
      }

      // Preview the cover art
      const reader = new FileReader();
      reader.onload = function(e) {
        if (previewContainer) {
          previewContainer.innerHTML = `<img src="${e.target.result}" alt="Cover Art Preview" style="max-width: 300px;">`;
        }
      };
      reader.readAsDataURL(coverArtFile);

      console.log(`✅ Cover art detected: ${coverArtFile.name}`);
    });
  }

});

  // <!-- end section 1 Cover Art Preview -->
  
  /*---------------------------------
    START 2. PROGRESS BAR CONTROL
    Show progress percentage in the progress bar as a file is processed
---------------------------------*/

// Initializes the progress bar to zero when starting
function initializeProgressBar() {
  const bar = document.getElementById('progress-bar');
  const label = document.getElementById('progress-label');

  if (bar && label) {
    bar.style.width = '0%';
    bar.classList.remove('progress-complete', 'progress-error');
    label.textContent = '0%';
  }

  console.log('✅ Progress bar initialized.');
}

// Updates progress bar as percent (0-100)
function updateProgressBar(percent) {
  const bar = document.getElementById('progress-bar');
  const label = document.getElementById('progress-label');

  if (bar && label) {
    const clampedPercent = Math.max(0, Math.min(percent, 100));
    bar.style.width = `${clampedPercent}%`;
    label.textContent = `${clampedPercent}%`;
  }

  console.log(`🔄 Progress bar updated: ${percent}%`);
}

// Completes the progress bar when processing is finished
function completeProgressBar() {
  const bar = document.getElementById('progress-bar');
  const label = document.getElementById('progress-label');

  if (bar && label) {
    bar.style.width = '100%';
    bar.classList.add('progress-complete');
    label.textContent = '100%';
  }

  console.log('✅ Progress complete!');
}

// Sets progress bar to an error state (optional helper)
function errorProgressBar() {
  const bar = document.getElementById('progress-bar');
  const label = document.getElementById('progress-label');

  if (bar && label) {
    bar.style.width = '100%';
    bar.classList.add('progress-error');
    label.textContent = 'Error';
  }

  console.error('❌ Progress error!');
}

/*---------------------------------
  START 2.1 CIRCULAR PROGRESS INDICATOR
  Modern circular progress indicator that replaces the gear icon during processing
---------------------------------*/

// Circular progress functions
function initializeCircularProgress() {
  updateCircularProgress(0);
}

function updateCircularProgress(percent) {
  const circle = document.querySelector('.circle-progress');
  const label = document.getElementById('progress-circle-label');
  const circumference = 2 * Math.PI * 30;
  const offset = circumference - (percent / 100) * circumference;
  
  circle.style.strokeDashoffset = offset;
  
  if (percent >= 100) {
    label.textContent = '✓';
  } else if (percent < 0) {
    label.textContent = '✗';
  } else {
    label.textContent = `${Math.round(percent)}%`;
  }
}

function completeCircularProgress() {
  updateCircularProgress(100);
}

function errorCircularProgress() {
  updateCircularProgress(-1);
}

/* <!-- end section 2.1 Circular Progress Indicator --> */
/* <!-- end section 2 Progress Bar Control --> */

  
//   /*---------------------------------
//   START 3. PROCESS DA1 PACKAGE
//   Collects inputs and sends files + meta to backend /api/embed
// ---------------------------------*/

// async function processDA1() {

//   const inputFiles = document.getElementById('raw-source-files').files;

//   if (!inputFiles || inputFiles.length === 0) {
//     alert('Please select at least one file to process.');
//     return;
//   }

//   const progressDiv = document.getElementById('progress');
//   const downloadContainer = document.getElementById('download-links');

//   // UI Feedback
//   if (progressDiv) {
//     progressDiv.innerHTML = '<i class="bi bi-gear spin"></i> Processing your files...';
//   }
//   initializeProgressBar();
//   updateProgressBar(10);

//   const formData = new FormData();

//   // Append ALL user-selected files
//   for (let file of inputFiles) {
//     formData.append('files', file);
//   }

//   // Extract metadata inputs
//   const title = document.getElementById('title')?.value || '';
//   const artist = document.getElementById('artist')?.value || '';
//   const album = document.getElementById('album')?.value || '';
//   const genre = document.getElementById('genre')?.value || '';

//   formData.append('title', title);
//   formData.append('artist', artist);
//   formData.append('album', album);
//   formData.append('genre', genre);

//   // Collect output format selections
//   const formatCheckboxes = document.querySelectorAll('input[name="outputFormats"]:checked');
//   const selectedFormats = Array.from(formatCheckboxes).map(cb => cb.value);
//   if (selectedFormats.length === 0) selectedFormats.push('mp3'); // Default fallback

  
// // Add each format individually to match backend expectations
// selectedFormats.forEach(format => {
//   formData.append('outputFormats', format);
// });

//   // Add other DA1 options (can be expanded later)
//   formData.append('excludeNeverBlank', false); // Placeholder
//   formData.append('createNewXML', false); // Placeholder

//   // Send POST Request to /api/compile
//   try {
//     console.log('🚀 Sending request to /api/compile');
//     const response = await fetch('/api/compile', {
//       method: 'POST',
//       body: formData
//     });

//     if (!response.ok) {
//       throw new Error(`Server error: ${response.status}`);
//     }

//     updateProgressBar(70);

//     const result = await response.json();

//     if (result.success) {
//       updateProgressBar(90);
//       if (progressDiv) progressDiv.innerHTML = '<i class="bi bi-check-circle"></i> Processing complete!';

//       // Show download links
//       if (downloadContainer) {
//         downloadContainer.innerHTML = '';
//         result.downloadLinks.forEach(link => {
//           const downloadLink = document.createElement('a');
//           downloadLink.href = link.path;
//           downloadLink.download = link.filename;
//           downloadLink.className = 'download-link';
//           downloadLink.innerHTML = `<i class="bi bi-download"></i> ${link.filename}`;
//           downloadContainer.appendChild(downloadLink);
//           downloadContainer.appendChild(document.createElement('br'));
//         });
//       }

//       completeProgressBar();

//     } else {
//       if (progressDiv) progressDiv.innerHTML = `❌ Error: ${result.message || 'Unknown error'}`;
//       console.error('❌ Server processing error:', result.message);
//       updateProgressBar(0);
//     }

//   } catch (error) {
//     console.error('❌ Processing error:', error);
//     if (progressDiv) progressDiv.innerHTML = `❌ Processing failed: ${error.message}`;
//     updateProgressBar(0);
//   }
// }

/*---------------------------------
  START 3. PROCESS DA1 PACKAGE
  Collects inputs and sends files + meta to backend /api/compile
---------------------------------*/

async function processDA1() {
  const inputFiles = document.getElementById('raw-source-files').files;

  if (!inputFiles || inputFiles.length === 0) {
    alert('Please select at least one file to process.');
    return;
  }

  // Get both old and new UI elements to ensure compatibility
  const buttonContent = document.querySelector('.button-content');
  const progressCircle = document.getElementById('progress-circle-container');
  const processingStatus = document.getElementById('processing-status');
  const progressDiv = document.getElementById('progress');
  const downloadContainer = document.getElementById('download-links');
  
  // Initialize both progress indicators for compatibility
  if (progressDiv) {
    progressDiv.innerHTML = '<i class="bi bi-gear spin"></i> Processing your files...';
    initializeProgressBar();
    updateProgressBar(10);
  }
  
  // Show the circular progress if those elements exist
  if (buttonContent && progressCircle) {
    buttonContent.style.display = 'none';
    progressCircle.style.display = 'block';
    initializeCircularProgress();
    updateCircularProgress(10);
  }

  const formData = new FormData();
  
  // Append files - keeping original code
  for (let file of inputFiles) {
    formData.append('files', file);
  }
  
  // Extract metadata inputs - keeping original code
  const title = document.getElementById('title')?.value || '';
  const artist = document.getElementById('artist')?.value || '';
  const album = document.getElementById('album')?.value || '';
  const genre = document.getElementById('genre')?.value || '';

  formData.append('title', title);
  formData.append('artist', artist);
  formData.append('album', album);
  formData.append('genre', genre);

  // Collect output format selections - keeping original code
  const formatCheckboxes = document.querySelectorAll('input[name="outputFormats"]:checked');
  const selectedFormats = Array.from(formatCheckboxes).map(cb => cb.value);
  if (selectedFormats.length === 0) selectedFormats.push('mp3'); // Default fallback

  // Add each format individually to match backend expectations - keeping original code
  selectedFormats.forEach(format => {
    formData.append('outputFormats', format);
  });

  // Add other DA1 options - keeping original code
  formData.append('excludeNeverBlank', false);
  formData.append('createNewXML', false);
  
  try {
    // Update both progress indicators
    if (processingStatus) {
      processingStatus.innerHTML = '<i class="bi bi-hourglass-split"></i> Processing your files...';
    }
    if (progressCircle) {
      updateCircularProgress(30);
    }
    if (progressDiv) {
      updateProgressBar(30);
    }
    
    // Keep the original fetch code
    console.log('🚀 Sending request to /api/compile');
    const response = await fetch('/api/compile', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    // Update both progress indicators at 70%
    if (progressCircle) {
      updateCircularProgress(70);
    }
    if (progressDiv) {
      updateProgressBar(70);
    }

    const result = await response.json();

    if (result.success) {
      // Update both progress indicators for completion
      if (progressCircle) {
        updateCircularProgress(90);
      }
      if (progressDiv) {
        updateProgressBar(90);
      }
      
      // Update status message in both places
      if (processingStatus) {
        processingStatus.innerHTML = '<i class="bi bi-check-circle"></i> Processing complete!';
      }
      if (progressDiv) {
        progressDiv.innerHTML = '<i class="bi bi-check-circle"></i> Processing complete!';
      }
      
      // Show download links - keeping original code
      if (downloadContainer) {
        downloadContainer.innerHTML = '';
        result.downloadLinks.forEach(link => {
          const downloadLink = document.createElement('a');
          downloadLink.href = link.path;
          downloadLink.download = link.filename;
          downloadLink.className = 'download-link';
          downloadLink.innerHTML = `<i class="bi bi-download"></i> ${link.filename}`;
          downloadContainer.appendChild(downloadLink);
          downloadContainer.appendChild(document.createElement('br'));
        });
      }
      
      // Complete both progress indicators
      if (progressCircle) {
        completeCircularProgress();
      }
      if (progressDiv) {
        completeProgressBar();
      }
    } else {
      // Error handling for both progress indicators
      if (processingStatus) {
        processingStatus.innerHTML = `<i class="bi bi-x-circle"></i> Error: ${result.message || 'Unknown error'}`;
      }
      if (progressDiv) {
        progressDiv.innerHTML = `<i class="bi bi-x-circle"></i> Error: ${result.message || 'Unknown error'}`;
      }
      console.error('❌ Server processing error:', result.message);
      
      if (progressCircle) {
        errorCircularProgress();
      }
      if (progressDiv) {
        updateProgressBar(0);
      }
    }
  } catch (error) {
    // Error handling
    console.error('❌ Processing error:', error);
    
    if (processingStatus) {
      processingStatus.innerHTML = `<i class="bi bi-x-circle"></i> Processing failed: ${error.message}`;
    }
    if (progressDiv) {
      progressDiv.innerHTML = `<i class="bi bi-x-circle"></i> Processing failed: ${error.message}`;
    }
    
    if (progressCircle) {
      errorCircularProgress();
    }
    if (progressDiv) {
      updateProgressBar(0);
    }
  }
}

// <!-- end section 3 Process DA1 Package -->



  // <!-- end section 3 Process DA1 Package -->
  
  /*---------------------------------
    START 4. TOGGLE ALL SUBFILETYPES
    Checks/Unchecks all subfiletype format checkboxes
  ---------------------------------*/
  function toggleAllSubFileTypes(checkbox) {
    const subfiletypeCheckboxes = document.querySelectorAll('.subfiletype-checkbox');
  
    subfiletypeCheckboxes.forEach((cb) => {
      cb.checked = checkbox.checked;
    });
  }
  // <!-- end section 4 Toggle All SubFileTypes -->

  // <!-- silencing chrome bugs -->

function switchFBversion() {
  // intentionally empty to actually silence chrome warnings
}
