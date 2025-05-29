#!/bin/bash
# Script to fix all comment sections in outreach posts

cd "$(dirname "$0")"
echo "Fixing comment sections in all outreach posts..."

# Process each HTML file in posts directory
for file in posts/*.html; do
  if [ ! -f "$file" ]; then
    continue
  fi
  
  echo "Processing $file..."
  
  # Remove any existing Giscus comment sections that might be incorrectly placed
  sed -i '' '/<div class="comments-section">/,/<\/div>.*class="comments-section"/d' "$file"
  
  # Remove existing Giscus script if any
  sed -i '' '/<script src="https:\/\/giscus.app\/client.js"/,/<\/script>/d' "$file"
  
  # Add the comments section properly inside the main content div, right before it closes
  sed -i '' 's|</div>.*<!-- Main Content -->|        <!-- Comments Section -->\
        <div class="comments-section">\
            <h2>Interactions & Comments</h2>\
            <div class="giscus"></div>\
        </div>\
    </div><!-- Main Content -->|g' "$file"
  
  # Add Giscus script right before the closing body tag
  sed -i '' 's|</body>|    <!-- Giscus Comments -->\
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
</body>|g' "$file"
  
  echo "  - Fixed $file"
done

echo "All done! Comment sections fixed in all outreach posts."