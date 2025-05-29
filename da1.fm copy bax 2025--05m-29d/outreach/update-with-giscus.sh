#!/bin/bash
# Script to add Giscus commenting system to all outreach post files

# Change to the script's directory
cd "$(dirname "$0")"

# Giscus script to add to all files
GISCUS_SCRIPT='
    <!-- Giscus Comments -->
    <script src="https://giscus.app/client.js"
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
        async>
    </script>'

# Process each HTML file in posts directory
for file in posts/*.html; do
    echo "Processing $file..."
    
    # 1. First, ensure there's no duplicate Giscus script
    grep -q "giscus.app/client.js" "$file"
    if [ $? -eq 0 ]; then
        echo "  - Already has Giscus script, removing..."
        sed -i '' '/<script src="https:\/\/giscus.app\/client.js"/,/<\/script>/d' "$file"
    fi
    
    # 2. Check if it already has a comments section
    grep -q "comments-section" "$file"
    if [ $? -eq 0 ]; then
        echo "  - Already has comments section, skipping..."
        continue
    fi
    
    # 3. Add the comments section before the closing main content div
    sed -i '' '/<\/div>.*<!-- Main Content -->/i\
        <!-- Comments Section -->\
        <div class="comments-section">\
            <h2>Interactions & Comments</h2>\
            <div class="giscus"></div>\
        </div>' "$file"
    
    # 4. Add the Giscus script before the closing body tag
    sed -i '' "s/<\/body>/$GISCUS_SCRIPT\n<\/body>/" "$file"
    
    echo "  - Updated successfully!"
done

echo "All outreach posts have been updated with Giscus comments."