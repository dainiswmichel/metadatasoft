#!/bin/bash

# Absolute paths to projects
DA1_MVP="/Users/dainismichel/dainisne/da1-mvp"
DA1_FM="/Users/dainismichel/dainisne/da1.fm"

# This script's directory (dev-scripts)
DEV_SCRIPTS="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

####################
# BLOCK GOOGLE
####################
echo "🔒 Blocking Google domains for dev..."
bash "$DEV_SCRIPTS/toggle-google-block.sh" block

####################
# START PROJECTS
####################
echo "🚀 Starting DA1-MVP backend..."
cd "$DA1_MVP/backend" || exit
npm run dev &  # OR nodemon, pm2, etc.

echo "🚀 Starting DA1.FM frontend..."
cd "$DA1_FM/frontend" || exit
npm run dev &  # OR live-server, vite, etc.

####################
# WAIT AND CLEANUP
####################
trap cleanup EXIT

function cleanup {
  echo "🛑 Stopping all dev servers..."
  
  # Customize to kill only your processes
  pkill -f "node"

  echo "🔓 Unblocking Google domains..."
  bash "$DEV_SCRIPTS/toggle-google-block.sh" unblock

  echo "✅ Dev environment shut down cleanly."
}

wait
