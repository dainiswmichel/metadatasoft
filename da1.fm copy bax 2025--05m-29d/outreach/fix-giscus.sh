#!/bin/bash

# Script to properly implement Giscus comments in all outreach post files
# This script:
# 1. Adds the comments section if missing
# 2. Removes duplicate Giscus script tags
# 3. Ensures one properly formatted Giscus script exists

# Loop through all HTML files in the posts directory
for file in /Users/dainismichel/dainisne/da1.fm/outreach/posts/*.html; do
  echo "Processing $file..."
  
  # Make a backup of the original file
  cp "$file" "${file}.bak"
  
  # Check if the file already has a comments section
  if ! grep -q '<div class="comments-section">' "$file"; then
    # Comments section doesn't exist, add it
    # We'll use sed to insert it before the closing div of main-content
    sed -i.tmp '/<\/div>.*<!-- Right Sidebar Container -->/i\
        <!-- Comments Section -->\
        <div class="comments-section">\
            <h2>Interactions & Comments</h2>\
            <div class="giscus"></div>\
        </div>\
' "$file"
  fi
  
  # Clean up the temporary file created by sed
  rm -f "${file}.tmp"
  
  # Remove duplicate Giscus script tag comments
  sed -i.tmp 's/<!-- Giscus Comments -->\s*<!-- Giscus Comments -->\s*<!-- Giscus Comments -->/<!-- Giscus Comments -->/g' "$file"
  sed -i.tmp 's/<!-- Giscus Comments -->\s*<!-- Giscus Comments -->/<!-- Giscus Comments -->/g' "$file"
  
  # Ensure there's only one Giscus script
  # We'll first count how many script tags with giscus.app URL exist
  GISCUS_COUNT=$(grep -c "giscus.app/client.js" "$file")
  
  if [ "$GISCUS_COUNT" -gt 1 ]; then
    # Remove all giscus script tags first
    sed -i.tmp '/<script src="https:\/\/giscus.app\/client.js"/,/<\/script>/d' "$file"
    
    # Add the proper giscus script tag right before </body>
    sed -i.tmp '/<\/body>/i\
    <!-- Giscus Comments -->\
    <script src="https://giscus.app/client.js"\
        data-repo="dainiswmichel/da1-discussions"\
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
    </script>\
' "$file"
  elif [ "$GISCUS_COUNT" -eq 0 ]; then
    # No giscus script tag found, add one
    sed -i.tmp '/<\/body>/i\
    <!-- Giscus Comments -->\
    <script src="https://giscus.app/client.js"\
        data-repo="dainiswmichel/da1-discussions"\
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
    </script>\
' "$file"
  fi
  
  # Clean up temporary files
  rm -f "${file}.tmp"
  
  echo "Completed processing $file"
done

echo "All files have been updated!"