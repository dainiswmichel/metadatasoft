#!/bin/bash

HOSTS_FILE="/etc/hosts"
BLOCK_COMMENT="# GOOGLE BLOCK START"
END_COMMENT="# GOOGLE BLOCK END"
GOOGLE_DOMAINS=("google.com" "www.google.com" "accounts.google.com")

block_google() {
  echo "🔒 Blocking Google domains..."
  
  # Check if already blocked
  if grep -q "$BLOCK_COMMENT" "$HOSTS_FILE"; then
    echo "🚫 Google domains are already blocked!"
    return
  fi

  {
    echo "$BLOCK_COMMENT"
    for domain in "${GOOGLE_DOMAINS[@]}"; do
      echo "127.0.0.1 $domain"
    done
    echo "$END_COMMENT"
  } | sudo tee -a "$HOSTS_FILE" > /dev/null

  sudo dscacheutil -flushcache
  sudo killall -HUP mDNSResponder
  echo "✅ Google domains blocked!"
}

unblock_google() {
  echo "🔓 Unblocking Google domains..."
  
  # Remove block section
  sudo sed -i.bak "/$BLOCK_COMMENT/,/$END_COMMENT/d" "$HOSTS_FILE"

  sudo dscacheutil -flushcache
  sudo killall -HUP mDNSResponder
  echo "✅ Google domains unblocked!"
}

case "$1" in
  block)
    block_google
    ;;
  unblock)
    unblock_google
    ;;
  *)
    echo "Usage: $0 {block|unblock}"
    exit 1
    ;;
esac
