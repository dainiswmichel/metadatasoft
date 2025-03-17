#!/bin/bash

# Configuration
VSCODE_PROCESS="Visual Studio Code"
SERVER_PORT=3000
HOSTS_FILE="/etc/hosts"
BLOCK_MARKER="# BEGIN GOOGLE BLOCK FOR DA1 DEVELOPMENT"

# Check if VS Code is running
vscode_running=$(ps aux | grep "$VSCODE_PROCESS" | grep -v grep)

# Check if server is running on port 3000
server_running=$(lsof -i:$SERVER_PORT | grep LISTEN)

# Path to toggle script
TOGGLE_SCRIPT="/Users/dainismichel/dainisne/dev-scripts/toggle-google-block.sh"

# Check current block status
block_active=$(grep -c "$BLOCK_MARKER" "$HOSTS_FILE")

if [[ -n "$vscode_running" || -n "$server_running" ]]; then
    # Development environment is active
    if [[ "$block_active" -eq 0 ]]; then
        echo "Development environment detected. Activating Google protection..."
        "$TOGGLE_SCRIPT"
    else
        echo "Google protection already active."
    fi
else
    # Development environment is not active
    if [[ "$block_active" -gt 0 ]]; then
        echo "Development environment not detected. Deactivating Google protection..."
        "$TOGGLE_SCRIPT"
    else
        echo "Google protection already inactive."
    fi
fi