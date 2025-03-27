#!/bin/bash

# Start Dainisne Development Environment

# Configuration
DAINISNE_DIR="/Users/dainismichel/dainisne"
LOG_DIR="${DAINISNE_DIR}/logs"
GOOGLE_BLOCK_SCRIPT="${DAINISNE_DIR}/dev-scripts/toggle-google-block.sh"

# Create logs directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Block Google domains for development
if [ -f "$GOOGLE_BLOCK_SCRIPT" ]; then
  echo "Activating Google protection..."
  "$GOOGLE_BLOCK_SCRIPT"
else
  echo "Google protection script not found at $GOOGLE_BLOCK_SCRIPT"
fi

# Start the master server
echo "Starting Dainisne Master Server..."
cd "$DAINISNE_DIR"
node server.js > "${LOG_DIR}/master-server.log" 2>&1 &
MASTER_PID=$!
echo "Master Server started with PID: $MASTER_PID"

# Start DA1-MVP backend
echo "Starting DA1-MVP backend..."
cd "${DAINISNE_DIR}/da1-mvp/backend"
PORT=3001 node server.js > "${LOG_DIR}/da1-mvp-backend.log" 2>&1 &
DA1_MVP_PID=$!
echo "DA1-MVP backend started with PID: $DA1_MVP_PID"

# Start DA1.FM backend if it exists
if [ -d "${DAINISNE_DIR}/da1.fm" ]; then
  echo "Starting DA1.FM backend..."
  cd "${DAINISNE_DIR}/da1.fm/backend"
  PORT=3002 node server.js > "${LOG_DIR}/da1-fm-backend.log" 2>&1 &
  DA1_FM_PID=$!
  echo "DA1.FM backend started with PID: $DA1_FM_PID"
fi

# Store PIDs for cleanup
echo "$MASTER_PID" > "${DAINISNE_DIR}/.master-pid"
echo "$DA1_MVP_PID" > "${DAINISNE_DIR}/.da1-mvp-pid"
[ -n "$DA1_FM_PID" ] && echo "$DA1_FM_PID" > "${DAINISNE_DIR}/.da1-fm-pid"

echo "All servers started successfully. Access the dashboard at http://localhost:3000"
echo "Check logs in ${LOG_DIR} directory"