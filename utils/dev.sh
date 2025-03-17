#!/bin/bash
# utils/dev.sh - Enhanced development environment management script

DAINISNE_DIR="/Users/dainismichel/dainisne"
ACTIVE_PROJECT=""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
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
  
  # Create tmp directories if they don't exist
  mkdir -p "$DAINISNE_DIR/tmp/audio" "$DAINISNE_DIR/tmp/uploads"
  
  # Start master server
  echo -e "${YELLOW}Starting master server...${NC}"
  cd "$DAINISNE_DIR" && NODE_ENV=development node server.js > "$DAINISNE_DIR/logs/server.log" 2>&1 &
  SERVER_PID=$!
  
  # Wait for server to start
  echo -e "${YELLOW}Waiting for server to start...${NC}"
  sleep 3
  
  # Check if server started successfully
  if ps -p $SERVER_PID > /dev/null; then
    echo -e "${GREEN}✓ Master server started successfully (PID: $SERVER_PID)${NC}"
    echo -e "${GREEN}✓ Dashboard available at: http://localhost:8000${NC}"
    
    # Check if API docs are available
    if [ -f "$DAINISNE_DIR/config/swagger.json" ]; then
      echo -e "${GREEN}✓ API Documentation: http://localhost:8000/api-docs${NC}"
    fi
    
    # Start default project if specified
    if [ -n "$1" ]; then
      echo -e "${YELLOW}Starting default project: $1${NC}"
      if curl -s -X POST "http://localhost:8000/api/projects/$1/start" > /dev/null; then
        ACTIVE_PROJECT="$1"
        echo -e "${GREEN}✓ Project $1 started!${NC}"
      else
        echo -e "${RED}Failed to start project $1${NC}"
      fi
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
    echo -e "${GREEN}✓ Development environment stopped successfully${NC}"
    
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
    
    if ! pgrep -f "node $DAINISNE_DIR/server.js" > /dev/null; then
      echo -e "${GREEN}✓ Force killed master server.${NC}"
    else
      echo -e "${RED}Could not kill master server. Please check processes manually.${NC}"
      return 1
    fi
  }
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
  cp -R "$PROJECT_DIR/build/"* "$DEPLOY_DIR/" 2>/dev/null || cp -R "$PROJECT_DIR/dist/"* "$DEPLOY_DIR/" 2>/dev/null || cp -R "$PROJECT_DIR/public/"* "$DEPLOY_DIR/" 2>/dev/null
  cp "$PROJECT_DIR/package.json" "$DEPLOY_DIR/"
  
  # Create server.js for Chemicloud
  cat > "$DEPLOY_DIR/server.js" << EOL
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API routes (if they exist)
try {
  const apiRoutes = require('./api');
  app.use('/api', apiRoutes);
  console.log('API routes loaded successfully');
} catch (error) {
  console.log('No API routes found or error loading them:', error.message);
}

// All other GET requests not handled before will return the app
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
  fi
  
  echo -e "${YELLOW}Showing server logs:${NC}"
  echo ""
  
  if [ "$1" = "--tail" ] || [ "$1" = "-t" ]; then
    tail -f "$DAINISNE_DIR/logs/server.log"
  elif [ "$1" = "--last" ] || [ "$1" = "-l" ]; then
    tail -n 50 "$DAINISNE_DIR/logs/server.log"
  else
    less "$DAINISNE_DIR/logs/server.log"
  fi
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
  fi
  
  echo -e "${YELLOW}Testing audio processing for file: $AUDIO_FILE${NC}"
  
  # Check if test-audio.js exists
  if [ ! -f "$DAINISNE_DIR/test-audio.js" ]; then
    echo -e "${RED}Error: test-audio.js not found!${NC}"
    echo -e "Make sure you have the test script in your dainisne directory."
    return 1
  }
  
  # Run the test script
  cd "$DAINISNE_DIR" && node test-audio.js "$AUDIO_FILE"
}

# Check status
check_status() {
  print_header
  
  echo -e "${YELLOW}Checking DA1 Development Environment status...${NC}"
  
  # Check master server
  if pgrep -f "node $DAINISNE_DIR/server.js" > /dev/null; then
    SERVER_PID=$(pgrep -f "node $DAINISNE_DIR/server.js")
    echo -e "${GREEN}✓ Master server is running (PID: $SERVER_PID)${NC}"
    echo -e "${CYAN}  Dashboard URL: http://localhost:8000${NC}"
    
    # Get uptime
    if [ -d "/proc/$SERVER_PID" ]; then
      # Linux
      START_TIME=$(stat -c %Y /proc/$SERVER_PID)
      CURRENT_TIME=$(date +%s)
      UPTIME=$((CURRENT_TIME - START_TIME))
      
      # Format uptime
      UPTIME_HOURS=$((UPTIME / 3600))
      UPTIME_MINUTES=$(( (UPTIME % 3600) / 60 ))
      UPTIME_SECONDS=$((UPTIME % 60))
      
      echo -e "${CYAN}  Uptime: ${UPTIME_HOURS}h ${UPTIME_MINUTES}m ${UPTIME_SECONDS}s${NC}"
    elif command -v ps &> /dev/null; then
      # macOS/BSD
      START_TIME=$(ps -o lstart= -p $SERVER_PID)
      echo -e "${CYAN}  Started: $START_TIME${NC}"
    fi
    
    # Check active projects
    echo -e "${YELLOW}Checking active projects...${NC}"
    ACTIVE_PROJECTS=$(curl -s http://localhost:8000/api/projects | grep -o '"active":true' | wc -l)
    if [ "$ACTIVE_PROJECTS" -gt 0 ]; then
      echo -e "${GREEN}✓ $ACTIVE_PROJECTS projects running${NC}"
      
      # Get project details
      PROJECTS=$(curl -s http://localhost:8000/api/projects)
      echo "$PROJECTS" | grep -o '"name":"[^"]*","active":true' | while read -r line; do
        PROJECT_NAME=$(echo "$line" | cut -d'"' -f4)
        PROJECT_PORT=$(echo "$PROJECTS" | grep -o "\"name\":\"$PROJECT_NAME\"[^}]*\"port\":[0-9]*" | grep -o "\"port\":[0-9]*" | cut -d':' -f2)
        echo -e "${CYAN}  • $PROJECT_NAME (http://localhost:$PROJECT_PORT)${NC}"
      done
    else
      echo -e "${YELLOW}⚠ No active projects${NC}"
    fi
  else
    echo -e "${RED}✗ Master server is not running${NC}"
  fi
  
  # Check Redis
  if command -v redis-cli &> /dev/null; then
    if redis-cli ping &> /dev/null; then
      echo -e "${GREEN}✓ Redis server is running${NC}"
      
      # Get Redis info
      if [ "$1" = "--verbose" ] || [ "$1" = "-v" ]; then
        REDIS_VERSION=$(redis-cli info server | grep redis_version | cut -d':' -f2 | tr -d '\r')
        REDIS_UPTIME=$(redis-cli info server | grep uptime_in_seconds | cut -d':' -f2 | tr -d '\r')
        REDIS_UPTIME_DAYS=$((REDIS_UPTIME / 86400))
        REDIS_UPTIME_HOURS=$(( (REDIS_UPTIME % 86400) / 3600 ))
        REDIS_UPTIME_MINUTES=$(( (REDIS_UPTIME % 3600) / 60 ))
        
        echo -e "${CYAN}  Version: $REDIS_VERSION${NC}"
        echo -e "${CYAN}  Uptime: ${REDIS_UPTIME_DAYS}d ${REDIS_UPTIME_HOURS}h ${REDIS_UPTIME_MINUTES}m${NC}"
        
        # Get queue info if possible
        if redis-cli keys "bull:audioProcessing:*" &> /dev/null; then
          WAITING_JOBS=$(redis-cli llen bull:audioProcessing:wait)
          ACTIVE_JOBS=$(redis-cli llen bull:audioProcessing:active)
          echo -e "${CYAN}  Queue status: $ACTIVE_JOBS active, $WAITING_JOBS waiting${NC}"
        fi
      fi
    else
      echo -e "${RED}✗ Redis server is not running${NC}"
    fi
  else
    echo -e "${YELLOW}⚠ Redis is not installed${NC}"
  fi
  
  # Check FFmpeg
  if command -v ffmpeg &> /dev/null; then
    FFMPEG_VERSION=$(ffmpeg -version | head -n1 | cut -d' ' -f3)
    echo -e "${GREEN}✓ FFmpeg is installed (version: $FFMPEG_VERSION)${NC}"
  else
    echo -e "${RED}✗ FFmpeg is not installed${NC}"
  fi
}

# Create a new project
create_project() {
  print_header
  
  if [ -z "$1" ]; then
    echo -e "${RED}Error: No project name specified!${NC}"
    echo -e "Usage: ./dev.sh create <project-name>"
    return 1
  fi
  
  PROJECT="$1"
  PROJECT_DIR="$DAINISNE_DIR/projects/$PROJECT"
  
  if [ -d "$PROJECT_DIR" ]; then
    echo -e "${RED}Error: Project '$PROJECT' already exists!${NC}"
    return 1
  }
  
  echo -e "${YELLOW}Creating new project: $PROJECT${NC}"
  
  # Create project directory
  mkdir -p "$PROJECT_DIR"
  
  # Create package.json
  cat > "$PROJECT_DIR/package.json" << EOL
{
  "name": "${PROJECT}",
  "version": "1.0.0",
  "description": "DA1 project",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "Dainis Michel",
  "license": "UNLICENSED",
  "private": true,
  "dependencies": {
    "express": "^4.18.2"
  }
}
EOL
  
  # Create index.js
  cat > "$PROJECT_DIR/index.js" << EOL
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Parse command line arguments
const args = process.argv.slice(2);
const portArg = args.find(arg => arg.startsWith('--port='));
if (portArg) {
  const customPort = parseInt(portArg.split('=')[1], 10);
  if (!isNaN(customPort)) {
    process.env.PORT = customPort;
  }
}

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', projectName: '${PROJECT}' });
});

// Default route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(\`${PROJECT} server running at http://localhost:\${PORT}\`);
});
EOL
  
  # Create public directory
  mkdir -p "$PROJECT_DIR/public"
  
  # Create index.html
  cat > "$PROJECT_DIR/public/index.html" << EOL
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${PROJECT}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background-color: #f9f9f9;
      color: #333;
    }
    .container {
      text-align: center;
      max-width: 800px;
      padding: 20px;
    }
    h1 {
      color: #2c5364;
    }
    .logo {
      font-size: 72px;
      margin-bottom: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">🚀</div>
    <h1>${PROJECT}</h1>
    <p>Your new DA1 project is running successfully!</p>
    <p>Edit files in <code>${PROJECT_DIR}</code> to get started.</p>
  </div>
</body>
</html>
EOL
  
  # Install dependencies
  echo -e "${YELLOW}Installing dependencies...${NC}"
  cd "$PROJECT_DIR" && npm install
  
  echo -e "${GREEN}✓ Project '$PROJECT' created successfully!${NC}"
  echo -e "${YELLOW}To start the project, run:${NC}"
  echo -e "  ./dev.sh start $PROJECT"
}

# Show help
show_help() {
  print_header
  
  echo "Usage: ./dev.sh [command] [options]"
  echo ""
  echo "Commands:"
  echo "  start [project]        Start the development environment"
  echo "                         Optionally start a specific project"
  echo "  stop [--stop-redis]    Stop the development environment"
  echo "                         Use --stop-redis to also stop Redis server"
  echo "  status [-v|--verbose]  Check status of the development environment"
  echo "  deploy <project>       Create deployment package for Chemicloud"
  echo "  logs [-t|-l]           Show server logs"
  echo "                         -t, --tail: Continuously show new logs"
  echo "                         -l, --last: Show last 50 lines"
  echo "  test-audio <file>      Test audio processing on a file"
  echo "  create <project-name>  Create a new project"
  echo "  help                   Show this help message"
  echo ""
  echo "Examples:"
  echo "  ./dev.sh start da1-mvp     Start the environment with da1-mvp"
  echo "  ./dev.sh stop              Stop the environment"
  echo "  ./dev.sh logs -t           Show and follow logs"
  echo "  ./dev.sh deploy da1.fm     Prepare da1.fm for deployment"
  echo "  ./dev.sh test-audio ~/Music/test.mp3   Test audio processing"
  echo "  ./dev.sh create new-project  Create a new project"
  echo "  ./dev.sh status -v         Show detailed status information"
}

# Main script execution
case "$1" in
  start)
    start_env "$2"
    ;;
  stop)
    stop_env "$2"
    ;;
  status)
    check_status "$2"
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
  create)
    create_project "$2"
    ;;
  help|*)
    show_help
    ;;
esac
