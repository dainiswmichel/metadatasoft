#!/bin/bash
# Script to add Giscus commenting system to all outreach post files

# Change to the script's directory
cd "$(dirname "$0")"

echo "Starting to update all outreach posts with Giscus comments..."

# Process each HTML file in posts directory
for file in posts/*.html; do
    echo "Processing $file..."
    
    # Check if the file already has a comments section
    if grep -q "comments-section" "$file"; then
        echo "  - Already has comments section, skipping this file..."
        continue
    fi
    
    # Add comments section before the closing main-content div
    sed -i '' '/<\/div>.*<!-- Main Content -->/i\
        <!-- Comments Section -->\
        <div class="comments-section">\
            <h2>Interactions & Comments</h2>\
            <div class="giscus"></div>\
        </div>' "$file"
    
    # Add Giscus script before the closing body tag
    sed -i '' 's/<\/body>/    <!-- Giscus Comments -->\
    <script src="https:\/\/giscus.app\/client.js"\
        data-repo="dainiswmichel\/da1-discussions"\
        data-repo-id="R_kgDOOnycXg"\
        data-category="Announcements"\
        data-category-id="DIC_kwDOOnycXs4Cp_zL"\
        data-mapping="pathname"\
        data-strict="0"\
        data-reactions-enabled="1"\
        data-emit-metadata="1"\
        data-input-position="bottom"\
        data-theme="light"\
        data-lang="en"\
        crossorigin="anonymous"\
        async>\
    <\/script>\
<\/body>/' "$file"
    
    echo "  - Successfully updated!"
done

echo "All outreach posts have been updated with Giscus comments."
echo ""
echo "Deployment Instructions:"
echo "------------------------"
echo "1. Upload all modified HTML files from the outreach/posts/ directory to your server"
echo "2. Make sure the CSS file (outreach/css/outreach.css) is also uploaded to include the comment styling"
echo ""
echo "Note: Comments will use your GitHub repository: dainiswmichel/da1-discussions"
echo "You can moderate all comments directly on GitHub in the Discussions section of that repository."