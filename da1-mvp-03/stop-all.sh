#!/bin/bash

# Stop Dainisne Development Environment

# Configuration
DAINISNE_DIR="/Users/dainismichel/dainisne"
GOOGLE_BLOCK_SCRIPT="${DAINISNE_DIR}/dev-scripts/toggle-google-block.sh"

# Function to stop a server by PID file
stop_server() {
  local pid_file="$1"
  local name="$2"
  
  if [ -f "$pid_file" ]; then
    local pid=$(cat "$pid_file")
    echo "Stopping $name (PID: $pid)..."
    kill "$pid" 2>/dev/null || echo "$name was not running"
    rm "$pid_file"
  else
    echo "$name was not running (no PID file)"
  fi
}

# Stop all servers
stop_server "${DAINISNE_DIR}/.da1-fm-pid" "DA1.FM backend"
stop_server "${DAINISNE_DIR}/.da1-mvp-pid" "DA1-MVP backend"
stop_server "${DAINISNE_DIR}/.master-pid" "Master server"

# Unblock Google domains
if [ -f "$GOOGLE_BLOCK_SCRIPT" ]; then
  echo "Deactivating Google protection..."
  "$GOOGLE_BLOCK_SCRIPT"
else
  echo "Google protection script not found at $GOOGLE_BLOCK_SCRIPT"
fi

echo "All servers stopped. Development environment is now inactive."