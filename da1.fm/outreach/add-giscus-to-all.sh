#!/bin/bash
# Script to add Giscus commenting system to all outreach post files

# Change to the script's directory
cd "$(dirname "$0")"

# Giscus script content
GISCUS_SCRIPT='<script src="https://giscus.app/client.js"
        data-repo="dainiswmichel/da1-discussions"
        data-repo-id="R_kgDOOnycXg"
        data-category="Announcements"
        data-category-id="DIC_kwDOOnycXs4Cp_zL"
        data-mapping="pathname"
        data-strict="0"
        data-reactions-enabled="1"
        data-emit-metadata="1"
        data-input-position="bottom"
        data-theme="light"
        data-lang="en"
        crossorigin="anonymous"
        async></script>'

# Comments section HTML
COMMENTS_SECTION='<!-- Comments Section -->
        <div class="comments-section">
            <h2>Interactions & Comments</h2>
            <div class="giscus"></div>
        </div>'

# Process each HTML file in posts directory
for file in posts/*.html; do
    echo "Processing $file..."
    
    # Check if file already has giscus
    if grep -q "giscus.app/client.js" "$file"; then
        echo "  - Found existing Giscus script, removing it..."
        # Remove existing Giscus script
        grep -v "giscus.app/client.js" "$file" > "${file}.tmp"
        mv "${file}.tmp" "$file"
    fi
    
    # Check if file already has comments section
    if grep -q "comments-section" "$file"; then
        echo "  - Found existing comments section, removing it..."
        # Create a temp file without the comments section
        sed '/<!-- Comments Section -->/,/<\/div>.*class="comments-section"/d' "$file" > "${file}.tmp"
        mv "${file}.tmp" "$file"
    fi
    
    # Add the comments section before the closing main content div
    echo "  - Adding comments section..."
    awk '
    /<\/div>.*<!-- Main Content -->/ { 
        print "        '"$COMMENTS_SECTION"'"
        print $0
        next
    }
    { print }
    ' "$file" > "${file}.tmp"
    mv "${file}.tmp" "$file"
    
    # Add the Giscus script before the closing body tag
    echo "  - Adding Giscus script..."
    awk '
    /<\/body>/ {
        print "    <!-- Giscus Comments -->"
        print "    '"$GISCUS_SCRIPT"'"
        print $0
        next
    }
    { print }
    ' "$file" > "${file}.tmp"
    mv "${file}.tmp" "$file"
    
    echo "  - Update completed!"
done

echo "All outreach posts have been updated with Giscus comments."
echo "Remember to upload all modified files to the live server."