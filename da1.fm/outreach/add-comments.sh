#!/bin/bash
# Script to add Giscus commenting system to all outreach posts

cd "$(dirname "$0")"
echo "Adding comments to all outreach posts..."

# First, restore the template files
echo "Regenerating outreach posts from template..."
node generate-outreach-posts.js

# Add the comments section to all files
for file in posts/*.html; do
  # Add comments section before closing main content div
  sed -i '' 's|</div>.*<!-- Main Content -->|        <!-- Comments Section -->\
        <div class="comments-section">\
            <h2>Interactions & Comments</h2>\
            <div class="giscus"></div>\
        </div>\
    </div>\
\
    <!-- Main Content -->|g' "$file"
  
  # Add Giscus script before closing body tag
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
  
  echo "Added comments to $file"
done

echo "All done! Comments added to all outreach posts."