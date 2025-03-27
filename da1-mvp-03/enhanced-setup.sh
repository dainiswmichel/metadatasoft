#!/bin/bash
# Deploy script for Chemicloud

echo "Starting deployment process..."

# Install dependencies
echo "Installing dependencies..."
npm install --production

# Set permissions
echo "Setting permissions..."
chmod -R 755 .

# Create logs directory
mkdir -p logs

# Restart application
echo "Restarting application..."
if [ -f "./node_modules/.bin/pm2" ]; then
  ./node_modules/.bin/pm2 restart server.js || ./node_modules/.bin/pm2 start server.js
else
  echo "PM2 not found, installing..."
  npm install pm2 --save
  ./node_modules/.bin/pm2 start server.js
fi

echo "Deployment complete!"
EOL
  
  # Make deploy script executable
  chmod +x "$DEPLOY_DIR/deploy.sh"
  
  # Create zip file for easy upload
  echo -e "${YELLOW}Creating deployment archive...${NC}"
  mkdir -p "$DAINISNE_DIR/deploy"
  cd "$DAINISNE_DIR/deploy" && zip -r "${PROJECT}.zip" "$PROJECT"
  
  echo -e "${GREEN}✓ Deployment package created: $DAINISNE_DIR/deploy/${PROJECT}.zip${NC}"
  echo -e "${GREEN}✓ Ready to upload to Chemicloud!${NC}"
  echo ""
  echo -e "${YELLOW}Upload instructions:${NC}"
  echo "1. Log in to Chemicloud control panel"
  echo "2. Navigate to File Manager"
  echo "3. Upload and extract ${PROJECT}.zip to your website directory"
  echo "4. SSH into your server and run: cd /path/to/site && ./deploy.sh"
  echo "5. Set up Node.js app in Chemicloud panel pointing to server.js"
}

# Show logs
show_logs() {
  print_header
  
  if [ ! -f "$DAINISNE_DIR/logs/server.log" ]; then
    echo -e "${RED}No logs found!${NC}"
    return 1
  }
  
  echo -e "${YELLOW}Showing server logs:${NC}"
  echo ""
  
  if [ "$1" = "--tail" ] || [ "$1" = "-t" ]; then
    tail -f "$DAINISNE_DIR/logs/server.log"
  elif [ "$1" = "--last" ] || [ "$1" = "-l" ]; then
    tail -n 50 "$DAINISNE_DIR/logs/server.log"
  else
    less "$DAINISNE_DIR/logs/server.log"
  }
}

# Test audio processing
test_audio() {
  print_header
  
  if [ -z "$1" ]; then
    echo -e "${RED}Error: No audio file specified!${NC}"
    echo -e "Usage: ./dev.sh test-audio <path-to-audio-file>"
    return 1
  fi
  
  AUDIO_FILE="$1"
  
  if [ ! -f "$AUDIO_FILE" ]; then
    echo -e "${RED}Error: Audio file '$AUDIO_FILE' not found!${NC}"
    return 1
  }
  
  echo -e "${YELLOW}Testing audio processing for file: $AUDIO_FILE${NC}"
  
  # Run the test script
  cd "$DAINISNE_DIR" && node test-audio.js "$AUDIO_FILE"
}

# Show help
show_help() {
  print_header
  
  echo "Usage: ./dev.sh [command] [options]"
  echo ""
  echo "Commands:"
  echo "  start [project]      Start the development environment"
  echo "                       Optionally start a specific project"
  echo "  stop [--stop-redis]  Stop the development environment"
  echo "                       Use --stop-redis to also stop Redis server"
  echo "  deploy <project>     Create deployment package for Chemicloud"
  echo "  logs [-t|-l]         Show server logs"
  echo "                       -t, --tail: Continuously show new logs"
  echo "                       -l, --last: Show last 50 lines"
  echo "  test-audio <file>    Test audio processing on a file"
  echo "  help                 Show this help message"
  echo ""
  echo "Examples:"
  echo "  ./dev.sh start da1-mvp    Start the environment with da1-mvp"
  echo "  ./dev.sh stop             Stop the environment"
  echo "  ./dev.sh logs -t          Show and follow logs"
  echo "  ./dev.sh deploy da1.fm    Prepare da1.fm for deployment"
  echo "  ./dev.sh test-audio ~/Music/test.mp3  Test audio processing"
}

# Main script execution
case "$1" in
  start)
    start_env "$2"
    ;;
  stop)
    stop_env "$2"
    ;;
  deploy)
    deploy_to_chemicloud "$2"
    ;;
  logs)
    show_logs "$2"
    ;;
  test-audio)
    test_audio "$2"
    ;;
  help|*)
    show_help
    ;;
esac
EOL

    # Make script executable
    chmod +x "$UTILS_DIR/dev.sh"
    
    echo -e "${GREEN}✓ Enhanced management script created${NC}"
else
    echo -e "${GREEN}✓ Management script already exists${NC}"
fi

# Create test-audio script
echo -e "${YELLOW}Creating audio test script...${NC}"
if [ ! -f "$DA1_DIR/test-audio.js" ] || [ "$FORCE" = true ]; then
    echo -e "Creating audio test script..."
    
    cat > "$DA1_DIR/test-audio.js" << 'EOL'
// test-audio.js - Quick test script for audio processing functionality
const path = require('path');
const os = require('os');
const audioProcessor = require('./lib/audioProcessor');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

/**
 * Test audio processing with a given file
 * @param {string} inputFile - Path to audio file for testing
 */
async function testAudioProcessing(inputFile) {
  console.log(`${colors.blue}Testing audio processing for: ${colors.cyan}${inputFile}${colors.reset}`);
  
  try {
    // Create output path in temp directory
    const outputFile = path.join(
      os.tmpdir(), 
      `test-output-${Date.now()}${path.extname(inputFile)}`
    );
    
    console.log(`${colors.blue}Output will be saved to: ${colors.cyan}${outputFile}${colors.reset}`);
    
    // Define test metadata
    const metadata = {
      title: 'DA1 Test Title',
      artist: 'DA1 Test Artist',
      album: 'DA1 Test Album',
      year: '2025',
      comment: 'This metadata was added by DA1 test script'
    };
    
    console.log(`${colors.blue}Adding metadata:${colors.reset}`);
    console.log(metadata);
    
    // Process the file
    console.log(`${colors.yellow}Processing file...${colors.reset}`);
    const start = Date.now();
    
    const result = await audioProcessor.processAudio(inputFile, outputFile, metadata);
    
    const end = Date.now();
    console.log(`${colors.green}✓ Processing complete in ${end - start}ms${colors.reset}`);
    console.log(`${colors.green}✓ Output saved to: ${colors.cyan}${result}${colors.reset}`);
    
    // Verify metadata was written correctly
    console.log(`${colors.blue}Verifying metadata...${colors.reset}`);
    const writtenMetadata = await audioProcessor.extractMetadata(outputFile);
    console.log(`${colors.blue}Extracted metadata:${colors.reset}`);
    console.log(writtenMetadata);
    
    // Check if metadata fields were written
    const verificationResults = Object.entries(metadata).map(([key, value]) => {
      // Find corresponding key in written metadata (case insensitive)
      const matchedKey = Object.keys(writtenMetadata).find(
        k => k.toLowerCase() === key.toLowerCase() || 
             k.includes(key.toLowerCase()) || 
             key.toLowerCase().includes(k.toLowerCase())
      );
      
      if (matchedKey) {
        const writtenValue = writtenMetadata[matchedKey];
        return {
          field: key,
          expected: value,
          actual: writtenValue,
          mapped_to: matchedKey,
          success: writtenValue.includes(value)
        };
      }
      
      return {
        field: key,
        expected: value,
        actual: null,
        mapped_to: null,
        success: false
      };
    });
    
    // Display verification results
    console.log(`${colors.blue}Metadata verification results:${colors.reset}`);
    verificationResults.forEach(result => {
      if (result.success) {
        console.log(`${colors.green}✓ ${result.field}: ${result.expected}${colors.reset}`);
      } else {
        console.log(`${colors.red}✗ ${result.field}: Expected "${result.expected}" but got ${result.actual ? `"${result.actual}"` : 'nothing'} ${result.mapped_to ? `(mapped to ${result.mapped_to})` : ''}${colors.reset}`);
      }
    });
    
    // Overall result
    const successCount = verificationResults.filter(r => r.success).length;
    if (successCount === verificationResults.length) {
      console.log(`${colors.green}✓ All metadata fields were written correctly!${colors.reset}`);
    } else {
      console.log(`${colors.yellow}⚠ ${successCount}/${verificationResults.length} metadata fields were written correctly${colors.reset}`);
    }
    
  } catch (error) {
    console.error(`${colors.red}✗ Error: ${error.message}${colors.reset}`);
    console.error(error);
  }
}

// Main execution
async function main() {
  try {
    // First check if FFmpeg is installed
    const ffmpegInstalled = await audioProcessor.validateFFmpegInstallation();
    if (!ffmpegInstalled) {
      console.error(`${colors.red}✗ FFmpeg is not installed or not in PATH${colors.reset}`);
      console.error(`${colors.yellow}Please install FFmpeg before running this test${colors.reset}`);
      process.exit(1);
    }
    
    console.log(`${colors.green}✓ FFmpeg is installed${colors.reset}`);
    
    // Get input file from command line argument or use default
    const inputFile = process.argv[2];
    
    if (!inputFile) {
      console.error(`${colors.red}✗ Error: No input file specified${colors.reset}`);
      console.error(`${colors.yellow}Usage: node test-audio.js /path/to/audio-file.mp3${colors.reset}`);
      process.exit(1);
    }
    
    // Run the test
    await testAudioProcessing(inputFile);
    
  } catch (error) {
    console.error(`${colors.red}✗ Unhandled error: ${error.message}${colors.reset}`);
    console.error(error);
    process.exit(1);
  }
}

// Run the main function
main().catch(console.error);
EOL

    echo -e "${GREEN}✓ Audio test script created${NC}"
else
    echo -e "${GREEN}✓ Audio test script already exists${NC}"
fi

# Create tmp directories
echo -e "${YELLOW}Creating tmp directories...${NC}"
mkdir -p "$DA1_DIR/tmp/audio" "$DA1_DIR/tmp/uploads"
echo -e "${GREEN}✓ Temp directories created${NC}"

# Check FFmpeg installation
echo -e "${YELLOW}Checking FFmpeg installation...${NC}"
if command -v ffmpeg >/dev/null 2>&1; then
    echo -e "${GREEN}✓ FFmpeg is installed${NC}"
    ffmpeg -version | head -n 1
else
    echo -e "${RED}✗ FFmpeg is not installed${NC}"
    echo -e "${YELLOW}Please install FFmpeg to enable audio processing:${NC}"
    echo "  macOS:    brew install ffmpeg"
    echo "  Ubuntu:   sudo apt install ffmpeg"
    echo "  CentOS:   sudo yum install ffmpeg"
    echo "  Windows:  choco install ffmpeg"
fi

# Check Redis installation (for queue)
echo -e "${YELLOW}Checking Redis installation...${NC}"
if command -v redis-cli >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Redis is installed${NC}"
    redis-cli --version
    
    # Check if Redis is running
    if redis-cli ping >/dev/null 2>&1; then
        echo -e "${GREEN}✓ Redis server is running${NC}"
    else
        echo -e "${YELLOW}⚠ Redis server is not running${NC}"
        echo -e "${YELLOW}You can start it with: brew services start redis (macOS) or service redis-server start (Ubuntu)${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Redis is not installed${NC}"
    echo -e "${YELLOW}Redis is recommended for queue functionality. Install with:${NC}"
    echo "  macOS:    brew install redis"
    echo "  Ubuntu:   sudo apt install redis-server"
    echo "  CentOS:   sudo yum install redis"
fi

# Final check
echo -e "\n${YELLOW}Checking development environment setup...${NC}"
SETUP_OK=true

# Check required files
if [ ! -f "$DA1_DIR/server.js" ]; then
    echo -e "${RED}✗ Master server file not found${NC}"
    SETUP_OK=false
fi

if [ ! -f "$CONFIG_DIR/index.js" ]; then
    echo -e "${RED}✗ Configuration file not found${NC}"
    SETUP_OK=false
fi

if [ ! -f "$LIB_DIR/audioProcessor.js" ]; then
    echo -e "${RED}✗ Audio processor library not found${NC}"
    SETUP_OK=false
fi

if [ ! -f "$UTILS_DIR/dev.sh" ]; then
    echo -e "${RED}✗ Management script not found${NC}"
    SETUP_OK=false
fi

if [ ! -f "$DASHBOARD_DIR/dashboard.html" ]; then
    echo -e "${RED}✗ Dashboard HTML not found${NC}"
    SETUP_OK=false
fi

# Final message
if [ "$SETUP_OK" = true ]; then
    echo -e "\n${GREEN}✓ Enhanced DA1 Development Environment setup complete!${NC}"
    echo -e "${YELLOW}Next steps:${NC}"
    echo "1. Start the development environment with:"
    echo "   $ cd $DA1_DIR && ./utils/dev.sh start [project]"
    echo ""
    echo "2. Access the development dashboard at:"
    echo "   http://localhost:8000"
    echo ""
    echo "3. Test audio processing with:"
    echo "   $ ./utils/dev.sh test-audio /path/to/audio-file.mp3"
    echo ""
    echo "4. View API documentation at:"
    echo "   http://localhost:8000/api-docs"
else
    echo -e "\n${RED}✗ DA1 Development Environment setup incomplete${NC}"
    echo -e "${YELLOW}Please check the errors above and run the script again.${NC}"
    echo -e "You can use --force option to overwrite existing files:\n  $ ./setup.sh --force"
fi
# Create management scripts
echo -e "${YELLOW}Creating enhanced management scripts...${NC}"
if [ ! -f "$UTILS_DIR/dev.sh" ] || [ "$FORCE" = true ]; then
    echo -e "Creating enhanced management script..."
    mkdir -p "$UTILS_DIR"
    
    cat > "$UTILS_DIR/dev.sh" << 'EOL'
#!/bin/bash
# utils/dev.sh - Enhanced development environment management script

DAINISNE_DIR="/Users/dainismichel/dainisne"
ACTIVE_PROJECT=""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print header
print_header() {
  echo -e "${BLUE}===============================${NC}"
  echo -e "${BLUE}  DA1 Development Environment  ${NC}"
  echo -e "${BLUE}===============================${NC}"
  echo ""
}

# Start the development environment
start_env() {
  print_header
  
  echo -e "${YELLOW}Starting DA1 Development Environment...${NC}"
  
  # Check if Redis is installed
  if ! command -v redis-cli &> /dev/null; then
    echo -e "${YELLOW}Warning: Redis not found. Queue system may not work properly.${NC}"
    echo -e "Install Redis with: brew install redis (macOS) or apt install redis-server (Ubuntu)"
  else
    # Check if Redis is running
    if ! redis-cli ping &> /dev/null; then
      echo -e "${YELLOW}Starting Redis server...${NC}"
      brew services start redis &> /dev/null || redis-server --daemonize yes &> /dev/null
      sleep 2
      
      if redis-cli ping &> /dev/null; then
        echo -e "${GREEN}✓ Redis server started${NC}"
      else
        echo -e "${RED}Failed to start Redis server${NC}"
        echo -e "${YELLOW}You can continue without Redis, but queue features won't work${NC}"
      fi
    else
      echo -e "${GREEN}✓ Redis server is already running${NC}"
    fi
  fi
  
  # Check if master server is already running
  if pgrep -f "node $DAINISNE_DIR/server.js" > /dev/null; then
    echo -e "${RED}Master server is already running!${NC}"
    return 1
  fi
  
  # Create logs directory if it doesn't exist
  mkdir -p "$DAINISNE_DIR/logs"
  
  # Start master server
  echo -e "${YELLOW}Starting master server...${NC}"
  cd "$DAINISNE_DIR" && NODE_ENV=development node server.js > "$DAINISNE_DIR/logs/server.log" 2>&1 &
  
  # Wait for server to start
  sleep 2
  
  # Check if server started successfully
  if pgrep -f "node $DAINISNE_DIR/server.js" > /dev/null; then
    echo -e "${GREEN}✓ Master server started successfully!${NC}"
    echo -e "${GREEN}Dashboard available at: http://localhost:8000${NC}"
    echo -e "${GREEN}API Documentation: http://localhost:8000/api-docs${NC}"
    
    # Start default project if specified
    if [ -n "$1" ]; then
      echo -e "${YELLOW}Starting default project: $1${NC}"
      curl -s -X POST "http://localhost:8000/api/projects/$1/start" > /dev/null
      ACTIVE_PROJECT="$1"
      echo -e "${GREEN}✓ Project $1 started!${NC}"
    fi
  else
    echo -e "${RED}Failed to start master server!${NC}"
    echo -e "${YELLOW}Check logs at $DAINISNE_DIR/logs/server.log${NC}"
    return 1
  fi
}

# Stop the development environment
stop_env() {
  print_header
  
  echo -e "${YELLOW}Stopping DA1 Development Environment...${NC}"
  
  # Check if master server is running
  if ! pgrep -f "node $DAINISNE_DIR/server.js" > /dev/null; then
    echo -e "${RED}Master server is not running!${NC}"
    return 1
  fi
  
  # Kill master server (it will clean up project servers)
  pkill -f "node $DAINISNE_DIR/server.js"
  
  # Wait for server to stop
  sleep 2
  
  # Check if server stopped successfully
  if ! pgrep -f "node $DAINISNE_DIR/server.js" > /dev/null; then
    echo -e "${GREEN}✓ Development environment stopped successfully!${NC}"
    
    # Stop Redis if option provided
    if [ "$1" = "--stop-redis" ]; then
      echo -e "${YELLOW}Stopping Redis server...${NC}"
      brew services stop redis &> /dev/null || redis-cli shutdown &> /dev/null
      echo -e "${GREEN}✓ Redis server stopped${NC}"
    fi
  else
    echo -e "${RED}Failed to stop master server!${NC}"
    echo -e "${YELLOW}Trying force kill...${NC}"
    pkill -9 -f "node $DAINISNE_DIR/server.js"
    echo -e "${GREEN}✓ Force killed master server.${NC}"
  fi
}

# Deploy to Chemicloud
deploy_to_chemicloud() {
  print_header
  
  if [ -z "$1" ]; then
    echo -e "${RED}Error: No project specified for deployment!${NC}"
    echo -e "Usage: ./dev.sh deploy <project-name>"
    return 1
  fi
  
  PROJECT="$1"
  PROJECT_DIR="$DAINISNE_DIR/projects/$PROJECT"
  
  if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}Error: Project '$PROJECT' not found!${NC}"
    return 1
  }
  
  echo -e "${YELLOW}Preparing $PROJECT for deployment to Chemicloud...${NC}"
  
  # Create deployment directory
  DEPLOY_DIR="$DAINISNE_DIR/deploy/$PROJECT"
  mkdir -p "$DEPLOY_DIR"
  
  # Build the project
  echo -e "${YELLOW}Building project...${NC}"
  cd "$PROJECT_DIR" && npm run build
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}Build failed! Aborting deployment.${NC}"
    return 1
  fi
  
  # Copy files to deployment directory
  echo -e "${YELLOW}Copying files to deployment directory...${NC}"
  cp -R "$PROJECT_DIR/build/"* "$DEPLOY_DIR/"
  cp "$PROJECT_DIR/package.json" "$DEPLOY_DIR/"
  
  # Create server.js for Chemicloud
  cat > "$DEPLOY_DIR/server.js" << EOL
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api', require('./api'));

// All other GET requests not handled before will return the React app
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
EOL
  
  # Create .env file for Chemicloud
  cat > "$DEPLOY_DIR/.env" << EOL
NODE_ENV=production
PORT=3000
API_URL=https://${PROJECT}.da1.fm/api
EOL
  
  # Create deploy script
  cat > "$DEPLOY_DIR/deploy.sh" << EOL
#!/bin/bash
# Deploy      // Tab switching
      document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
          // Remove active class from all tabs
          document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
          document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
          
          // Add active class to clicked tab
          tab.classList.add('active');
          document.getElementById(tab.dataset.tab).classList.add('active');
        });
      });
      
      // Collapsible sections
      document.querySelectorAll('.collapsible').forEach(collapsible => {
        collapsible.addEventListener('click', () => {
          collapsible.classList.toggle('collapsed');
          document.getElementById(collapsible.dataset.target).classList.toggle('collapsed');
        });
      });
      
      // Event listeners
      if (refreshProjectsBtn) refreshProjectsBtn.addEventListener('click', loadProjects);
      if (testAudioBtn) testAudioBtn.addEventListener('click', testAudioProcessing);
      if (detectMetadataBtn) detectMetadataBtn.addEventListener('click', detectMetadata);
      if (extractMetadataBtn) extractMetadataBtn.addEventListener('click', extractMetadata);
      if (refreshQueueBtn) refreshQueueBtn.addEventListener('click', loadQueueJobs);
      if (refreshSystemBtn) refreshSystemBtn.addEventListener('click', loadSystemInfo);
      if (submitFeedbackBtn) submitFeedbackBtn.addEventListener('click', submitFeedback);
      
      // Check server status
      function checkServerStatus() {
        fetch('/api/health')
          .then(response => {
            if (response.ok) {
              return response.json();
            }
            throw new Error('Server not responding');
          })
          .then(data => {
            masterServerStatus.innerHTML = '<span style="color: var(--success);">ONLINE</span>';
            document.getElementById('envBadge').textContent = data.environment.toUpperCase();
          })
          .catch(error => {
            masterServerStatus.innerHTML = '<span style="color: var(--danger);">OFFLINE</span>';
          });
      }
      
      // Check FFmpeg status
      function checkFFmpegStatus() {
        fetch('/api/ffmpeg-status')
          .then(response => {
            if (response.ok) {
              return response.json();
            }
            throw new Error('Could not check FFmpeg status');
          })
          .then(data => {
            if (data.installed) {
              ffmpegStatus.innerHTML = '<span style="color: var(--success);">INSTALLED</span>';
              if (data.version) {
                ffmpegStatus.innerHTML += ` <small>(v${data.version})</small>`;
              }
            } else {
              ffmpegStatus.innerHTML = '<span style="color: var(--danger);">NOT FOUND</span>';
            }
          })
          .catch(error => {
            ffmpegStatus.innerHTML = '<span style="color: var(--warning);">UNKNOWN</span>';
          });
      }
      
      // Load projects
      function loadProjects() {
        if (refreshProjectsBtn) refreshProjectsBtn.disabled = true;
        
        fetch('/api/projects')
          .then(response => {
            if (response.ok) {
              return response.json();
            }
            throw new Error('Could not load projects');
          })
          .then(projects => {
            // Update active count
            const active = projects.filter(p => p.active).length;
            activeProjectsCount.textContent = active;
            
            // Clear list
            projectList.innerHTML = '';
            
            // If no projects found
            if (projects.length === 0) {
              projectList.innerHTML = `
                <li class="project-item">
                  <span class="project-name">No projects found</span>
                </li>
              `;
              return;
            }
            
            // Add each project
            projects.forEach(project => {
              const projectItem = document.createElement('li');
              projectItem.className = 'project-item';
              
              const statusClass = project.active ? 'status-active' : 'status-inactive';
              const statusText = project.active ? 'Running' : 'Stopped';
              
              let uptimeText = '';
              if (project.active && project.uptime) {
                const hours = Math.floor(project.uptime / 3600);
                const minutes = Math.floor((project.uptime % 3600) / 60);
                const seconds = project.uptime % 60;
                uptimeText = `<small>Uptime: ${hours}h ${minutes}m ${seconds}s</small>`;
              }
              
              projectItem.innerHTML = `
                <span class="project-name">${project.name} ${uptimeText}</span>
                <div class="project-status">
                  <span class="status-badge ${statusClass}">${statusText}</span>
                  ${project.port ? `<span class="port-badge">Port ${project.port}</span>` : ''}
                  <button class="btn ${project.active ? 'btn-danger' : 'btn-success'}" 
                          data-project="${project.name}" 
                          data-action="${project.active ? 'stop' : 'start'}">
                    ${project.active ? 'Stop' : 'Start'}
                  </button>
                  ${project.active ? `<a href="http://localhost:${project.port}" target="_blank" class="btn btn-primary">Open</a>` : ''}
                </div>
              `;
              
              projectList.appendChild(projectItem);
              
              // Add event listener to button
              const button = projectItem.querySelector('button');
              button.addEventListener('click', handleProjectAction);
            });
          })
          .catch(error => {
            projectList.innerHTML = `
              <li class="project-item">
                <span class="project-name">Error loading projects: ${error.message}</span>
              </li>
            `;
          })
          .finally(() => {
            if (refreshProjectsBtn) refreshProjectsBtn.disabled = false;
          });
      }
      
      // Handle project start/stop
      function handleProjectAction(event) {
        const button = event.target;
        const project = button.dataset.project;
        const action = button.dataset.action;
        
        // Disable button
        button.disabled = true;
        button.textContent = action === 'start' ? 'Starting...' : 'Stopping...';
        
        // Send request
        fetch(`/api/projects/${project}/${action}`, { method: 'POST' })
          .then(response => {
            if (response.ok) {
              return response.json();
            }
            throw new Error(`Could not ${action} project`);
          })
          .then(data => {
            // Refresh projects
            loadProjects();
          })
          .catch(error => {
            alert(`Error: ${error.message}`);
            button.disabled = false;
            button.textContent = action === 'start' ? 'Start' : 'Stop';
          });
      }
      
      // Test audio processing
      function testAudioProcessing() {
        // Get input values
        const inputFile = inputFileField.value.trim();
        const outputFile = outputFileField.value.trim();
        const title = titleMetadataField.value.trim();
        const artist = artistMetadataField.value.trim();
        const album = albumMetadataField.value.trim();
        const genre = genreMetadataField.value.trim();
        
        // Validate input
        if (!inputFile) {
          showError('Please enter an input file path');
          return;
        }
        
        // Show loader
        audioProcessingLoader.classList.remove('hidden');
        testAudioBtn.disabled = true;
        detectMetadataBtn.disabled = true;
        hideAlerts();
        
        // Prepare data
        const data = {
          inputPath: inputFile,
          outputPath: outputFile || null,
          metadata: {
            title: title || 'Test Title',
            artist: artist || 'Test Artist',
            album: album || null,
            genre: genre || null
          }
        };
        
        // Send request
        fetch('/api/process-audio', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        })
          .then(response => {
            if (response.ok) {
              return response.json();
            }
            return response.json().then(data => {
              throw new Error(data.message || 'Unknown error');
            });
          })
          .then(data => {
            showSuccess(`Audio processing job added to queue! Job ID: ${data.jobId}`);
            // Refresh queue
            loadQueueJobs();
          })
          .catch(error => {
            showError(`Error: ${error.message}`);
          })
          .finally(() => {
            // Hide loader
            audioProcessingLoader.classList.add('hidden');
            testAudioBtn.disabled = false;
            detectMetadataBtn.disabled = false;
          });
      }
      
      // Detect metadata from file
      function detectMetadata() {
        // Get input value
        const inputFile = inputFileField.value.trim();
        
        // Validate input
        if (!inputFile) {
          showError('Please enter an input file path');
          return;
        }
        
        // Show loader
        audioProcessingLoader.classList.remove('hidden');
        testAudioBtn.disabled = true;
        detectMetadataBtn.disabled = true;
        hideAlerts();
        
        // Send request to extract metadata
        fetch('/api/extract-metadata', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ filePath: inputFile })
        })
          .then(response => {
            if (response.ok) {
              return response.json();
            }
            return response.json().then(data => {
              throw new Error(data.message || 'Unknown error');
            });
          })
          .then(data => {
            if (data.success && data.metadata) {
              // Fill in form fields with extracted metadata
              titleMetadataField.value = data.metadata.title || '';
              artistMetadataField.value = data.metadata.artist || '';
              albumMetadataField.value = data.metadata.album || '';
              genreMetadataField.value = data.metadata.genre || '';
              
              showSuccess('Metadata detected and form updated');
            } else {
              showError('No metadata found in the file');
            }
          })
          .catch(error => {
            showError(`Error: ${error.message}`);
          })
          .finally(() => {
            // Hide loader
            audioProcessingLoader.classList.add('hidden');
            testAudioBtn.disabled = false;
            detectMetadataBtn.disabled = false;
          });
      }
      
      // Extract metadata
      function extractMetadata() {
        // Get input value
        const filePath = metadataFilePath.value.trim();
        
        // Validate input
        if (!filePath) {
          showMetadataError('Please enter a file path');
          return;
        }
        
        // Show loader
        metadataLoader.classList.remove('hidden');
        extractMetadataBtn.disabled = true;
        hideMetadataAlerts();
        
        // Send request
        fetch('/api/extract-metadata', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ filePath })
        })
          .then(response => {
            if (response.ok) {
              return response.json();
            }
            return response.json().then(data => {
              throw new Error(data.message || 'Unknown error');
            });
          })
          .then(data => {
            if (data.success && data.metadata) {
              // Show metadata
              metadataResult.textContent = JSON.stringify(data.metadata, null, 2);
              metadataResult.classList.remove('hidden');
              showMetadataSuccess('Metadata extracted successfully');
              
              // Update input field in audio processing tab if it's empty
              if (inputFileField.value.trim() === '') {
                inputFileField.value = filePath;
              }
            } else {
              showMetadataError('No metadata found in the file');
            }
          })
          .catch(error => {
            showMetadataError(`Error: ${error.message}`);
          })
          .finally(() => {
            // Hide loader
            metadataLoader.classList.add('hidden');
            extractMetadataBtn.disabled = false;
          });
      }
      
      // Load queue jobs
      function loadQueueJobs() {
        if (refreshQueueBtn) refreshQueueBtn.disabled = true;
        if (queueLoader) queueLoader.classList.remove('hidden');
        
        fetch('/api/process-audio')
          .then(response => {
            if (response.ok) {
              return response.json();
            }
            throw new Error('Could not load queue jobs');
          })
          .then(data => {
            // Update counts
            queueJobsCount.textContent = data.counts.total;
            activeJobCount.textContent = data.counts.active;
            waitingJobCount.textContent = data.counts.waiting;
            completedJobCount.textContent = data.counts.completed;
            failedJobCount.textContent = data.counts.failed;
            
            // Active jobs
            activeJobList.innerHTML = '';
            if (data.active.length === 0) {
              activeJobList.innerHTML = '<li class="job-item">No active jobs</li>';
            } else {
              data.active.forEach(job => {
                const progress = job.progress || 0;
                const jobItem = document.createElement('li');
                jobItem.className = 'job-item';
                jobItem.innerHTML = `
                  <div>
                    <span class="job-id">${job.id}</span>
                    <p>Input: ${job.data.inputPath}</p>
                    <div class="job-progress">
                      <div class="job-progress-bar" style="width: ${progress}%"></div>
                    </div>
                    <p>${progress}% complete</p>
                  </div>
                `;
                activeJobList.appendChild(jobItem);
              });
            }
            
            // Waiting jobs
            waitingJobList.innerHTML = '';
            if (data.waiting.length === 0) {
              waitingJobList.innerHTML = '<li class="job-item">No waiting jobs</li>';
            } else {
              data.waiting.forEach(job => {
                const jobItem = document.createElement('li');
                jobItem.className = 'job-item';
                jobItem.innerHTML = `
                  <div>
                    <span class="job-id">${job.id}</span>
                    <p>Input: ${job.data.inputPath}</p>
                    <p>Added: ${new Date(job.timestamp).toLocaleString()}</p>
                  </div>
                `;
                waitingJobList.appendChild(jobItem);
              });
            }
            
            // Completed jobs
            completedJobList.innerHTML = '';
            if (data.completed.length === 0) {
              completedJobList.innerHTML = '<li class="job-item">No completed jobs</li>';
            } else {
              data.completed.forEach(job => {
                const jobItem = document.createElement('li');
                jobItem.className = 'job-item';
                jobItem.innerHTML = `
                  <div>
                    <span class="job-id">${job.id}</span>
                    <p>Input: ${job.data.inputPath}</p>
                    <p>Output: ${job.returnvalue?.outputPath || 'Unknown'}</p>
                    <p>Completed: ${job.finishedOn ? new Date(job.finishedOn).toLocaleString() : 'Unknown'}</p>
                  </div>
                `;
                completedJobList.appendChild(jobItem);
              });
            }
            
            // Failed jobs
            failedJobList.innerHTML = '';
            if (data.failed.length === 0) {
              failedJobList.innerHTML = '<li class="job-item">No failed jobs</li>';
            } else {
              data.failed.forEach(job => {
                const jobItem = document.createElement('li');
                jobItem.className = 'job-item';
                jobItem.innerHTML = `
                  <div>
                    <span class="job-id">${job.id}</span>
                    <p>Input: ${job.data.inputPath}</p>
                    <p>Error: ${job.failedReason || 'Unknown error'}</p>
                    <p>Failed: ${job.finishedOn ? new Date(job.finishedOn).toLocaleString() : 'Unknown'}</p>
                    <p>Attempts: ${job.attemptsMade || 1}/${job.opts?.attempts || 1}</p>
                  </div>
                `;
                failedJobList.appendChild(jobItem);
              });
            }
          })
          .catch(error => {
            queueJobsCount.textContent = '?';
            activeJobList.innerHTML = `<li class="job-item">Error loading jobs: ${error.message}</li>`;
          })
          .finally(() => {
            if (refreshQueueBtn) refreshQueueBtn.disabled = false;
            if (queueLoader) queueLoader.classList.add('hidden');
          });
      }
      
      // Load system info
      function loadSystemInfo() {
        if (refreshSystemBtn) refreshSystemBtn.disabled = true;
        if (systemLoader) systemLoader.classList.remove('hidden');
        
        fetch('/api/system')
          .then(response => {
            if (response.ok) {
              return response.json();
            }
            throw new Error('Could not load system info');
          })
          .then(data => {
            // Format the data nicely
            const formattedData = {
              'Hostname': data.hostname,
              'Platform': data.platform,
              'Architecture': data.arch,
              'CPUs': data.cpus,
              'Total Memory': formatBytes(data.totalMemory),
              'Free Memory': formatBytes(data.freeMemory),
              'Memory Usage': `${Math.round((data.totalMemory - data.freeMemory) / data.totalMemory * 100)}%`,
              'Uptime': formatUptime(data.uptime),
              'Load Average': data.loadAvg.map(load => load.toFixed(2)).join(', '),
              'Node.js Version': data.nodeVersion,
              'Environment': data.nodeEnv
            };
            
            // Display the data
            systemInfoResult.textContent = Object.entries(formattedData)
              .map(([key, value]) => `${key}: ${value}`)
              .join('\n');
            
            systemInfoResult.classList.remove('hidden');
          })
          .catch(error => {
            systemInfoResult.textContent = `Error loading system info: ${error.message}`;
            systemInfoResult.classList.remove('hidden');
          })
          .finally(() => {
            if (refreshSystemBtn) refreshSystemBtn.disabled = false;
            if (systemLoader) systemLoader.classList.add('hidden');
          });
      }
      
      // Submit feedback
      function submitFeedback() {
        // Get feedback text
        const feedback = feedbackText.value.trim();
        
        // Validate input
        if (!feedback) {
          showFeedbackError('Please enter your feedback');
          return;
        }
        
        // Show loader
        feedbackLoader.classList.remove('hidden');
        submitFeedbackBtn.disabled = true;
        hideFeedbackAlerts();
        
        // Just pretend to submit for this demo (would normally send to server)
        setTimeout(() => {
          showFeedbackSuccess('Thank you for your feedback!');
          feedbackText.value = '';
          
          // Hide loader
          feedbackLoader.classList.add('hidden');
          submitFeedbackBtn.disabled = false;
        }, 1000);
      }
      
      // Show success message
      function showSuccess(message) {
        hideAlerts();
        successAlert.textContent = message;
        successAlert.classList.remove('hidden');
      }
      
      // Show error message
      function showError(message) {
        hideAlerts();
        errorAlert.textContent = message;
        errorAlert.classList.remove('hidden');
      }
      
      // Hide alerts
      function hideAlerts() {
        successAlert.classList.add('hidden');
        errorAlert.classList.add('hidden');
      }
      
      // Show metadata success message
      function showMetadataSuccess(message) {
        hideMetadataAlerts();
        metadataSuccessAlert.textContent = message;
        metadataSuccessAlert.classList.remove('hidden');
      }
      
      // Show metadata error message
      function showMetadataError(message) {
        hideMetadataAlerts();
        metadataErrorAlert.textContent = message;
        metadataErrorAlert.classList.remove('hidden');
      }
      
      // Hide metadata alerts
      function hideMetadataAlerts() {
        metadataSuccessAlert.classList.add('hidden');
        metadataErrorAlert.classList.add('hidden');
      }
      
      // Show feedback success message
      function showFeedbackSuccess(message) {
        hideFeedbackAlerts();
        feedbackSuccessAlert.textContent = message;
        feedbackSuccessAlert.classList.remove('hidden');
      }
      
      // Show feedback error message
      function showFeedbackError(message) {
        hideFeedbackAlerts();
        feedbackErrorAlert.textContent = message;
        feedbackErrorAlert.classList.remove('hidden');
      }
      
      // Hide feedback alerts
      function hideFeedbackAlerts() {
        feedbackSuccessAlert.classList.add('hidden');
        feedbackErrorAlert.classList.add('hidden');
      }
      
      // Format bytes
      function formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
      }
      
      // Format uptime
      function formatUptime(seconds) {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        return `${days}d ${hours}h ${minutes}m`;
      }
      
      // Refresh data periodically
      setInterval(() => {
        checkServerStatus();
        loadProjects();
        loadQueueJobs();
      }, 30000); // every 30 seconds
    });
  </script>
</body>
</html>
EOL

    echo -e "${GREEN}✓ Enhanced dashboard created${NC}"
else
    echo -e "${GREEN}✓ Dashboard already exists${NC}"
fi                }
              }
            }
          },
          "404": {
            "description": "Job not found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          }
        }
      }
    },
    "/ffmpeg-status": {
      "get": {
        "summary": "Check FFmpeg status",
        "description": "Checks if FFmpeg is installed and returns its version.",
        "responses": {
          "200": {
            "description": "FFmpeg status",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "installed": {
                      "type": "boolean"
                    },
                    "version": {
                      "type": "string"
                    }
                  }
                }
              }
            }
          },
          "500": {
            "description": "Server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          }
        }
      }
    },
    "/extract-metadata": {
      "post": {
        "summary": "Extract metadata from file",
        "description": "Extracts metadata from an audio file.",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "filePath": {
                    "type": "string",
                    "description": "Path to the audio file"
                  }
                },
                "required": ["filePath"]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Extracted metadata",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": {
                      "type": "boolean"
                    },
                    "metadata": {
                      "type": "object"
                    }
                  }
                }
              }
            }
          },
          "400": {
            "description": "Invalid request",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          },
          "500": {
            "description": "Server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          }
        }
      }
    },
    "/health": {
      "get": {
        "summary": "Health check",
        "description": "Returns the health status of the server.",
        "responses": {
          "200": {
            "description": "Health status",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "status": {
                      "type": "string"
                    },
                    "environment": {
                      "type": "string"
                    },
                    "uptime": {
                      "type": "number"
                    },
                    "timestamp": {
                      "type": "number"
                    },
                    "memory": {
                      "type": "object"
                    },
                    "activeProjects": {
                      "type": "integer"
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/system": {
      "get": {
        "summary": "System information",
        "description": "Returns information about the system running the server.",
        "responses": {
          "200": {
            "description": "System information",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "hostname": {
                      "type": "string"
                    },
                    "platform": {
                      "type": "string"
                    },
                    "arch": {
                      "type": "string"
                    },
                    "cpus": {
                      "type": "integer"
                    },
                    "totalMemory": {
                      "type": "integer"
                    },
                    "freeMemory": {
                      "type": "integer"
                    },
                    "uptime": {
                      "type": "number"
                    },
                    "loadAvg": {
                      "type": "array",
                      "items": {
                        "type": "number"
                      }
                    },
                    "nodeVersion": {
                      "type": "string"
                    },
                    "nodeEnv": {
                      "type": "string"
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "Project": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string"
          },
          "active": {
            "type": "boolean"
          },
          "port": {
            "type": "integer",
            "nullable": true
          },
          "pid": {
            "type": "integer",
            "nullable": true
          },
          "uptime": {
            "type": "integer",
            "nullable": true
          }
        }
      },
      "ProjectDetail": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string"
          },
          "active": {
            "type": "boolean"
          },
          "port": {
            "type": "integer",
            "nullable": true
          },
          "uptime": {
            "type": "integer",
            "nullable": true
          },
          "details": {
            "type": "object",
            "properties": {
              "version": {
                "type": "string"
              },
              "description": {
                "type": "string"
              },
              "author": {
                "type": "string"
              },
              "path": {
                "type": "string"
              },
              "dependencies": {
                "type": "integer"
              },
              "devDependencies": {
                "type": "integer"
              }
            }
          }
        }
      },
      "Job": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "data": {
            "type": "object"
          },
          "progress": {
            "type": "integer"
          },
          "timestamp": {
            "type": "number"
          },
          "attemptsMade": {
            "type": "integer"
          }
        }
      },
      "JobStatus": {
        "type": "object",
        "properties": {
          "jobId": {
            "type": "string"
          },
          "state": {
            "type": "string",
            "enum": ["waiting", "active", "completed", "failed", "delayed"]
          },
          "progress": {
            "type": "integer"
          },
          "data": {
            "type": "object"
          },
          "result": {
            "type": "object"
          },
          "error": {
            "type": "string",
            "nullable": true
          },
          "attempts": {
            "type": "integer"
          },
          "createdAt": {
            "type": "number"
          },
          "processedAt": {
            "type": "number",
            "nullable": true
          }
        }
      },
      "Error": {
        "type": "object",
        "properties": {
          "error": {
            "type": "boolean"
          },
          "code": {
            "type": "integer"
          },
          "message": {
            "type": "string"
          },
          "errorCode": {
            "type": "string"
          }
        }
      }
    }
  }
}
EOL

    echo -e "${GREEN}✓ Swagger documentation created${NC}"
else
    echo -e "${GREEN}✓ Swagger documentation already exists${NC}"
fi

# Create enhanced dashboard HTML with feedback form
echo -e "${YELLOW}Creating enhanced dashboard with feedback form...${NC}"
if [ ! -f "$DASHBOARD_DIR/dashboard.html" ] || [ "$FORCE" = true ]; then
    echo -e "Creating enhanced dashboard HTML file..."
    mkdir -p "$DASHBOARD_DIR"
    
    cat > "$DASHBOARD_DIR/dashboard.html" << 'EOL'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DA1 Development Dashboard</title>
  <style>
    :root {
      --primary: #3498db;
      --success: #2ecc71;
      --danger: #e74c3c;
      --warning: #f39c12;
      --dark: #34495e;
      --light: #ecf0f1;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      margin: 0;
      padding: 0;
      background-color: var(--light);
      color: #333;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    
    header {
      background-color: var(--dark);
      color: white;
      padding: 20px;
      margin-bottom: 30px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    h1 {
      margin: 0;
      font-size: 24px;
    }
    
    .header-flex {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .env-badge {
      background-color: var(--warning);
      color: white;
      padding: 5px 10px;
      border-radius: 4px;
      font-size: 14px;
      font-weight: bold;
    }
    
    .card {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      padding: 20px;
      margin-bottom: 20px;
    }
    
    .card-title {
      margin-top: 0;
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
      font-size: 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .card-title .actions {
      display: flex;
      gap: 10px;
    }
    
    .project-list {
      list-style: none;
      padding: 0;
    }
    
    .project-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px;
      border-bottom: 1px solid #eee;
    }
    
    .project-item:last-child {
      border-bottom: none;
    }
    
    .project-name {
      font-weight: bold;
      font-size: 16px;
    }
    
    .project-status {
      display: flex;
      align-items: center;
    }
    
    .status-badge {
      padding: 5px 10px;
      border-radius: 4px;
      font-size: 12px;
      margin-right: 10px;
    }
    
    .status-active {
      background-color: var(--success);
      color: white;
    }
    
    .status-inactive {
      background-color: #ddd;
      color: #666;
    }
    
    .btn {
      padding: 8px 16px;
      border-radius: 4px;
      border: none;
      font-size: 14px;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .btn-primary {
      background-color: var(--primary);
      color: white;
    }
    
    .btn-primary:hover {
      background-color: #2980b9;
    }
    
    .btn-success {
      background-color: var(--success);
      color: white;
    }
    
    .btn-success:hover {
      background-color: #27ae60;
    }
    
    .btn-danger {
      background-color: var(--danger);
      color: white;
    }
    
    .btn-danger:hover {
      background-color: #c0392b;
    }
    
    .btn-disabled {
      background-color: #ddd;
      color: #666;
      cursor: not-allowed;
    }
    
    .port-badge {
      background-color: var(--dark);
      color: white;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 12px;
      margin-right: 10px;
    }
    
    .flex-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .stat-card {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      padding: 20px;
      text-align: center;
      transition: transform 0.3s ease;
    }
    
    .stat-card:hover {
      transform: translateY(-5px);
    }
    
    .stat-value {
      font-size: 28px;
      font-weight: bold;
      margin: 10px 0;
      color: var(--primary);
    }
    
    .stat-label {
      font-size: 14px;
      color: #666;
    }
    
    /* Audio Test Section */
    #audioTestSection {
      margin-top: 30px;
    }
    
    .form-group {
      margin-bottom: 15px;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }
    
    .form-group input {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    
    .form-actions {
      margin-top: 20px;
    }
    
    .alerts {
      margin-top: 20px;
    }
    
    .alert {
      padding: 10px 15px;
      border-radius: 4px;
      margin-bottom: 10px;
    }
    
    .alert-success {
      background-color: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }
    
    .alert-danger {
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }
    
    .alert-warning {
      background-color: #fff3cd;
      color: #856404;
      border: 1px solid #ffeeba;
    }
    
    .hidden {
      display: none;
    }
    
    .loader {
      border: 3px solid #f3f3f3;
      border-radius: 50%;
      border-top: 3px solid var(--primary);
      width: 20px;
      height: 20px;
      animation: spin 1s linear infinite;
      display: inline-block;
      margin-left: 10px;
      vertical-align: middle;
    }
    
    /* Tabs */
    .tabs {
      display: flex;
      border-bottom: 1px solid #ddd;
      margin-bottom: 20px;
    }
    
    .tab {
      padding: 10px 20px;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: border-color 0.3s;
    }
    
    .tab.active {
      border-bottom-color: var(--primary);
      font-weight: bold;
    }
    
    .tab-content {
      display: none;
    }
    
    .tab-content.active {
      display: block;
    }
    
    /* Job Queue Section */
    .job-list {
      list-style: none;
      padding: 0;
    }
    
    .job-item {
      padding: 15px;
      border-bottom: 1px solid #eee;
    }
    
    .job-item:last-child {
      border-bottom: none;
    }
    
    .job-id {
      font-weight: bold;
      color: var(--primary);
    }
    
    .job-progress {
      margin-top: 10px;
      height: 8px;
      background-color: #eee;
      border-radius: 4px;
      overflow: hidden;
    }
    
    .job-progress-bar {
      height: 100%;
      background-color: var(--primary);
    }
    
    /* Metadata Extractor Section */
    .metadata-result {
      background-color: #f9f9f9;
      padding: 15px;
      border-radius: 4px;
      font-family: monospace;
      white-space: pre-wrap;
      max-height: 300px;
      overflow-y: auto;
    }
    
    /* Feedback Form */
    .feedback-form {
      margin-top: 30px;
    }
    
    .feedback-form textarea {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      resize: vertical;
      min-height: 100px;
    }
    
    /* Collapsible sections */
    .collapsible {
      cursor: pointer;
    }
    
    .collapsible:after {
      content: "▼";
      font-size: 12px;
      margin-left: 5px;
    }
    
    .collapsible.collapsed:after {
      content: "▶";
    }
    
    .collapsible-content {
      max-height: 1000px;
      overflow: hidden;
      transition: max-height 0.3s ease;
    }
    
    .collapsible-content.collapsed {
      max-height: 0;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="header-flex">
        <h1>DA1 Development Dashboard</h1>
        <span class="env-badge" id="envBadge">DEVELOPMENT</span>
      </div>
    </header>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Active Projects</div>
        <div class="stat-value" id="activeProjectsCount">-</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Master Server</div>
        <div class="stat-value" id="masterServerStatus">-</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">FFmpeg Status</div>
        <div class="stat-value" id="ffmpegStatus">-</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Queue Jobs</div>
        <div class="stat-value" id="queueJobsCount">-</div>
      </div>
    </div>
    
    <div class="card">
      <h2 class="card-title">
        Projects
        <div class="actions">
          <button id="refreshProjectsBtn" class="btn btn-primary">Refresh</button>
        </div>
      </h2>
      <ul class="project-list" id="projectList">
        <li class="project-item">
          <span class="project-name">Loading projects...</span>
        </li>
      </ul>
    </div>
    
    <div class="card">
      <h2 class="card-title">Tools</h2>
      
      <div class="tabs">
        <div class="tab active" data-tab="audioProcessing">Audio Processing</div>
        <div class="tab" data-tab="metadataExtraction">Metadata Extraction</div>
        <div class="tab" data-tab="jobQueue">Job Queue</div>
        <div class="tab" data-tab="systemInfo">System Info</div>
      </div>
      
      <div class="tab-content active" id="audioProcessing">
        <div id="audioTestSection">
          <h3>Test Audio Processing</h3>
          <div class="form-group">
            <label for="inputFile">Audio File Path:</label>
            <input type="text" id="inputFile" placeholder="/path/to/input.mp3">
          </div>
          <div class="form-group">
            <label for="outputFile">Output File Path (optional):</label>
            <input type="text" id="outputFile" placeholder="/path/to/output.mp3">
          </div>
          <div class="form-group">
            <label for="titleMetadata">Title:</label>
            <input type="text" id="titleMetadata" placeholder="Track Title">
          </div>
          <div class="form-group">
            <label for="artistMetadata">Artist:</label>
            <input type="text" id="artistMetadata" placeholder="Artist Name">
          </div>
          <div class="form-group">
            <label for="albumMetadata">Album:</label>
            <input type="text" id="albumMetadata" placeholder="Album Name">
          </div>
          <div class="form-group">
            <label for="genreMetadata">Genre:</label>
            <input type="text" id="genreMetadata" placeholder="Genre">
          </div>
          <div class="form-actions">
            <button class="btn btn-primary" id="testAudioBtn">Process Audio</button>
            <button class="btn btn-primary" id="detectMetadataBtn">Auto-Detect Metadata</button>
            <span id="audioProcessingLoader" class="loader hidden"></span>
          </div>
          <div class="alerts">
            <div id="successAlert" class="alert alert-success hidden">
              Audio processed successfully!
            </div>
            <div id="errorAlert" class="alert alert-danger hidden">
              Error processing audio.
            </div>
          </div>
        </div>
      </div>
      
      <div class="tab-content" id="metadataExtraction">
        <h3>Extract Metadata from Audio File</h3>
        <div class="form-group">
          <label for="metadataFilePath">Audio File Path:</label>
          <input type="text" id="metadataFilePath" placeholder="/path/to/audio.mp3">
        </div>
        <div class="form-actions">
          <button class="btn btn-primary" id="extractMetadataBtn">Extract Metadata</button>
          <span id="metadataLoader" class="loader hidden"></span>
        </div>
        <div class="alerts">
          <div id="metadataSuccessAlert" class="alert alert-success hidden">
            Metadata extracted successfully!
          </div>
          <div id="metadataErrorAlert" class="alert alert-danger hidden">
            Error extracting metadata.
          </div>
        </div>
        <div id="metadataResult" class="metadata-result hidden"></div>
      </div>
      
      <div class="tab-content" id="jobQueue">
        <h3>Audio Processing Job Queue</h3>
        <div class="form-actions">
          <button class="btn btn-primary" id="refreshQueueBtn">Refresh Queue</button>
          <span id="queueLoader" class="loader hidden"></span>
        </div>
        <div class="job-status-summary">
          <p>Active: <span id="activeJobCount">0</span> | Waiting: <span id="waitingJobCount">0</span> | Completed: <span id="completedJobCount">0</span> | Failed: <span id="failedJobCount">0</span></p>
        </div>
        
        <h4 class="collapsible" data-target="activeJobs">Active Jobs</h4>
        <div id="activeJobs" class="collapsible-content">
          <ul class="job-list" id="activeJobList">
            <li class="job-item">No active jobs</li>
          </ul>
        </div>
        
        <h4 class="collapsible" data-target="waitingJobs">Waiting Jobs</h4>
        <div id="waitingJobs" class="collapsible-content">
          <ul class="job-list" id="waitingJobList">
            <li class="job-item">No waiting jobs</li>
          </ul>
        </div>
        
        <h4 class="collapsible collapsed" data-target="completedJobs">Completed Jobs</h4>
        <div id="completedJobs" class="collapsible-content collapsed">
          <ul class="job-list" id="completedJobList">
            <li class="job-item">No completed jobs</li>
          </ul>
        </div>
        
        <h4 class="collapsible collapsed" data-target="failedJobs">Failed Jobs</h4>
        <div id="failedJobs" class="collapsible-content collapsed">
          <ul class="job-list" id="failedJobList">
            <li class="job-item">No failed jobs</li>
          </ul>
        </div>
      </div>
      
      <div class="tab-content" id="systemInfo">
        <h3>System Information</h3>
        <div class="form-actions">
          <button class="btn btn-primary" id="refreshSystemBtn">Refresh System Info</button>
          <span id="systemLoader" class="loader hidden"></span>
        </div>
        <div id="systemInfoResult" class="metadata-result hidden"></div>
      </div>
    </div>
    
    <div class="card feedback-form">
      <h2 class="card-title">Feedback</h2>
      <p>Help us improve by providing your feedback on the development environment.</p>
      <div class="form-group">
        <label for="feedbackText">Your Feedback:</label>
        <textarea id="feedbackText" placeholder="What's working well? What could be improved?"></textarea>
      </div>
      <div class="form-actions">
        <button class="btn btn-primary" id="submitFeedbackBtn">Submit Feedback</button>
        <span id="feedbackLoader" class="loader hidden"></span>
      </div>
      <div class="alerts">
        <div id="feedbackSuccessAlert" class="alert alert-success hidden">
          Thank you for your feedback!
        </div>
        <div id="feedbackErrorAlert" class="alert alert-danger hidden">
          Error submitting feedback.
        </div>
      </div>
    </div>
  </div>
  
  <script>
    // Dashboard functionality
    document.addEventListener('DOMContentLoaded', function() {
      // References to DOM elements
      const projectList = document.getElementById('projectList');
      const activeProjectsCount = document.getElementById('activeProjectsCount');
      const masterServerStatus = document.getElementById('masterServerStatus');
      const ffmpegStatus = document.getElementById('ffmpegStatus');
      const queueJobsCount = document.getElementById('queueJobsCount');
      const refreshProjectsBtn = document.getElementById('refreshProjectsBtn');
      
      // Audio processing elements
      const testAudioBtn = document.getElementById('testAudioBtn');
      const detectMetadataBtn = document.getElementById('detectMetadataBtn');
      const inputFileField = document.getElementById('inputFile');
      const outputFileField = document.getElementById('outputFile');
      const titleMetadataField = document.getElementById('titleMetadata');
      const artistMetadataField = document.getElementById('artistMetadata');
      const albumMetadataField = document.getElementById('albumMetadata');
      const genreMetadataField = document.getElementById('genreMetadata');
      const successAlert = document.getElementById('successAlert');
      const errorAlert = document.getElementById('errorAlert');
      const audioProcessingLoader = document.getElementById('audioProcessingLoader');
      
      // Metadata extraction elements
      const extractMetadataBtn = document.getElementById('extractMetadataBtn');
      const metadataFilePath = document.getElementById('metadataFilePath');
      const metadataResult = document.getElementById('metadataResult');
      const metadataSuccessAlert = document.getElementById('metadataSuccessAlert');
      const metadataErrorAlert = document.getElementById('metadataErrorAlert');
      const metadataLoader = document.getElementById('metadataLoader');
      
      // Job queue elements
      const refreshQueueBtn = document.getElementById('refreshQueueBtn');
      const activeJobList = document.getElementById('activeJobList');
      const waitingJobList = document.getElementById('waitingJobList');
      const completedJobList = document.getElementById('completedJobList');
      const failedJobList = document.getElementById('failedJobList');
      const activeJobCount = document.getElementById('activeJobCount');
      const waitingJobCount = document.getElementById('waitingJobCount');
      const completedJobCount = document.getElementById('completedJobCount');
      const failedJobCount = document.getElementById('failedJobCount');
      const queueLoader = document.getElementById('queueLoader');
      
      // System info elements
      const refreshSystemBtn = document.getElementById('refreshSystemBtn');
      const systemInfoResult = document.getElementById('systemInfoResult');
      const systemLoader = document.getElementById('systemLoader');
      
      // Feedback elements
      const submitFeedbackBtn = document.getElementById('submitFeedbackBtn');
      const feedbackText = document.getElementById('feedbackText');
      const feedbackSuccessAlert = document.getElementById('feedbackSuccessAlert');
      const feedbackErrorAlert = document.getElementById('feedbackErrorAlert');
      const feedbackLoader = document.getElementById('feedbackLoader');
      
      // Initialize
      checkServerStatus();
      loadProjects();
      checkFFmpegStatus();
      loadQueueJobs();
      #!/bin/bash
# enhanced-setup.sh - Creates an enhanced DA1 development environment with all improvements

# ====================================
# CONFIGURATION
# ====================================
DA1_DIR="/Users/dainismichel/dainisne"
CONFIG_DIR="$DA1_DIR/config"
LIB_DIR="$DA1_DIR/lib"
UTILS_DIR="$DA1_DIR/utils"
PROJECTS_DIR="$DA1_DIR/projects"
DASHBOARD_DIR="$DA1_DIR/public"
LOGS_DIR="$DA1_DIR/logs"
TMP_DIR="$DA1_DIR/tmp"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check for force flag
FORCE=false
if [ "$1" == "--force" ]; then
    FORCE=true
    echo -e "${YELLOW}Force mode enabled - will overwrite existing files${NC}"
fi

# ====================================
# HELPER FUNCTIONS
# ====================================

# Print header
print_header() {
  echo -e "${BLUE}=======================================${NC}"
  echo -e "${BLUE}  Enhanced DA1 Development Environment ${NC}"
  echo -e "${BLUE}=======================================${NC}"
  echo ""
}

# ====================================
# MAIN SCRIPT
# ====================================

print_header

# Create directory structure
echo -e "${YELLOW}Creating enhanced directory structure...${NC}"
mkdir -p "$CONFIG_DIR" "$LIB_DIR" "$UTILS_DIR" "$PROJECTS_DIR" "$DASHBOARD_DIR" "$LOGS_DIR" "$TMP_DIR/audio"
echo -e "${GREEN}✓ Directory structure created${NC}"

# Install required npm packages
echo -e "${YELLOW}Installing enhanced dependencies...${NC}"
cd "$DA1_DIR"

# Create or update package.json
if [ ! -f "$DA1_DIR/package.json" ] || [ "$FORCE" = true ]; then
    echo -e "Creating package.json..."
    cat > "$DA1_DIR/package.json" << EOL
{
  "name": "da1-development-server",
  "version": "1.0.0",
  "description": "Enhanced centralized development environment for DA1 projects",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest"
  },
  "author": "Dainis Michel",
  "license": "UNLICENSED",
  "private": true,
  "dependencies": {
    "bcrypt": "^5.1.0",
    "body-parser": "^1.20.2",
    "bull": "^4.10.4",
    "cors": "^2.8.5",
    "crypto": "^1.0.1",
    "express": "^4.18.2",
    "http-proxy-middleware": "^2.0.6",
    "i18next": "^22.4.14",
    "joi": "^17.9.1",
    "music-metadata": "^8.1.4",
    "redis": "^4.6.5",
    "swagger-ui-express": "^4.6.2",
    "winston": "^3.8.2"
  },
  "devDependencies": {
    "jest": "^29.5.0",
    "nodemon": "^2.0.22",
    "supertest": "^6.3.3"
  }
}
EOL
fi

# Install dependencies
echo -e "${YELLOW}Installing new dependencies...${NC}"
npm install
echo -e "${GREEN}✓ Enhanced dependencies installed${NC}"

# Create configuration file
echo -e "${YELLOW}Creating enhanced configuration...${NC}"
if [ ! -f "$CONFIG_DIR/index.js" ] || [ "$FORCE" = true ]; then
    echo -e "Creating enhanced config file..."
    mkdir -p "$CONFIG_DIR"
    
    cat > "$CONFIG_DIR/index.js" << EOL
// config/index.js - Enhanced configuration for DA1 development environment
module.exports = {
  development: {
    masterPort: 8000,
    audioProcessor: {
      outputDir: '/Users/dainismichel/dainisne/tmp/audio',
      ffmpegPath: 'ffmpeg', // Uses system ffmpeg
      concurrency: 2, // Number of concurrent audio processing jobs
      cleanupInterval: 86400000 // 24 hours in milliseconds
    },
    queue: {
      redisUrl: 'redis://127.0.0.1:6379', // Redis connection for Bull queue
      concurrency: 2, // Default concurrent jobs
      jobTTL: 3600000 // 1 hour job TTL
    },
    googleProtection: true,
    security: {
      secretKey: 'da1-dev-secret-key', // For development only
      tokenExpiry: '1d',
      maxLoginAttempts: 5,
      lockoutTime: 15 * 60 * 1000 // 15 minutes in milliseconds
    },
    projects: {
      'da1-mvp': {
        port: 3000,
        apiBase: 'http://localhost:3000/api'
      },
      'da1.fm': {
        port: 3001,
        apiBase: 'http://localhost:3001/api'
      }
    },
    upload: {
      maxFileSize: 500 * 1024 * 1024, // 500MB max file size
      allowedFileTypes: [
        'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav',
        'audio/flac', 'audio/x-flac', 'audio/aac', 'audio/m4a',
        'audio/ogg', 'video/mp4', 'video/webm', 'video/quicktime',
        'application/pdf', 'image/jpeg', 'image/png', 'image/gif'
      ],
      tempDir: '/Users/dainismichel/dainisne/tmp/uploads'
    },
    logging: {
      level: 'debug', // debug, info, warn, error
      directory: '/Users/dainismichel/dainisne/logs',
      maxSize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5
    }
  },
  
  staging: {
    masterPort: 8000,
    audioProcessor: {
      outputDir: '/Users/dainismichel/dainisne/tmp/audio',
      ffmpegPath: 'ffmpeg',
      concurrency: 4
    },
    queue: {
      redisUrl: 'redis://127.0.0.1:6379',
      concurrency: 4
    },
    googleProtection: true,
    security: {
      secretKey: process.env.DA1_SECRET_KEY || 'da1-staging-secret-key',
      tokenExpiry: '1d'
    },
    projects: {
      'da1-mvp': {
        port: 3000,
        apiBase: 'https://staging.da1.fm/api'
      },
      'da1.fm': {
        port: 3001,
        apiBase: 'https://staging.da1.fm/api'
      }
    },
    upload: {
      maxFileSize: 1024 * 1024 * 1024, // 1GB max file size
      allowedFileTypes: [
        'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav',
        'audio/flac', 'audio/x-flac', 'audio/aac', 'audio/m4a',
        'audio/ogg', 'video/mp4', 'video/webm', 'video/quicktime',
        'application/pdf', 'image/jpeg', 'image/png', 'image/gif'
      ],
      tempDir: '/var/www/staging.da1.fm/tmp/uploads'
    },
    logging: {
      level: 'info',
      directory: '/var/www/staging.da1.fm/logs',
      maxSize: 50 * 1024 * 1024, // 50MB
      maxFiles: 10
    }
  },
  
  production: {
    audioProcessor: {
      outputDir: '/var/www/da1.fm/audio',
      ffmpegPath: '/usr/bin/ffmpeg',
      concurrency: 8
    },
    queue: {
      redisUrl: process.env.REDIS_URL || 'redis://redis:6379',
      concurrency: 8
    },
    googleProtection: false,
    security: {
      secretKey: process.env.DA1_SECRET_KEY,
      tokenExpiry: '7d'
    },
    projects: {
      'da1-mvp': {
        apiBase: 'https://da1-mvp.da1.fm/api'
      },
      'da1.fm': {
        apiBase: 'https://da1.fm/api'
      }
    },
    upload: {
      maxFileSize: 2 * 1024 * 1024 * 1024, // 2GB max file size
      allowedFileTypes: [
        'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav',
        'audio/flac', 'audio/x-flac', 'audio/aac', 'audio/m4a',
        'audio/ogg', 'video/mp4', 'video/webm', 'video/quicktime',
        'application/pdf', 'image/jpeg', 'image/png', 'image/gif'
      ],
      tempDir: '/var/www/da1.fm/tmp/uploads'
    },
    logging: {
      level: 'warn',
      directory: '/var/www/da1.fm/logs',
      maxSize: 100 * 1024 * 1024, // 100MB
      maxFiles: 20
    }
  }
};