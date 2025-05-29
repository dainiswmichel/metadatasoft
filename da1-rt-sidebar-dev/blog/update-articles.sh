#!/bin/bash
# Update the articles.txt file with a list of all HTML files in the articles directory

# Change to the script's directory
cd "$(dirname "$0")"

# Get a list of all HTML files in the articles directory
find ./articles -type f -name "*.html" | sed 's|./articles/||' > articles.txt

echo "Updated articles.txt with $(wc -l < articles.txt) HTML files"