#!/bin/bash
# Script to manually fix all HTML files with the correct Giscus implementation

cd "$(dirname "$0")"
echo "Applying manual fixes to all outreach posts..."

# List of files to process (excluding andrew-huang.html which is already fixed)
FILES=(
  "posts/bt-brian-transeau.html"
  "posts/imogen-heap.html"
  "posts/justin-blau-3lau.html"
  "posts/rac-andr-allen-anjos.html"
  "posts/richie-hawtin.html"
  "posts/zo-keating.html"
)

# Process each file
for file in "${FILES[@]}"; do
  if [ ! -f "$file" ]; then
    echo "File $file does not exist, skipping"
    continue
  fi
  
  echo "Processing $file..."
  
  # 1. Insert the comments section in the correct location (before the closing main-content div)
  # Use sed to add the comments section after the follow-up plan
  sed -i '' '/<!-- Follow-up Plan -->/,/<\/div>/{/<\/div>$/s/<\/div>/\
        <\/div>\
\
        <!-- Comments Section -->\
        <div class="comments-section">\
            <h2>Interactions \& Comments<\/h2>\
            <div class="giscus"><\/div>\
        <\/div>/}' "$file"
  
  # 2. Fix duplicate Giscus script tags
  # Remove all Giscus script tags first
  sed -i '' '/<script src="https:\/\/giscus.app\/client.js"/,/<\/script>/d' "$file"
  
  # Then add the correct one right before the closing body tag
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
  
  echo "  - Fixed $file"
done

echo "All outreach posts have been fixed!"