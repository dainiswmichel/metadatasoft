#!/bin/bash
# Update the outreach-posts.txt file with a list of all HTML files in the posts directory

# Change to the script's directory
cd "$(dirname "$0")"

# Get a list of all HTML files in the posts directory
find ./posts -type f -name "*.html" | sed 's|./posts/||' > outreach-posts.txt

echo "Updated outreach-posts.txt with $(wc -l < outreach-posts.txt) HTML files"