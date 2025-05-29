#!/bin/bash
# Script to add Giscus commenting system to all outreach posts

cd "$(dirname "$0")"
echo "Adding comments to all outreach posts..."

# Read list of posts from outreach-posts.txt
POSTS=$(cat outreach-posts.txt)

# Process each post
for post in $POSTS; do
  filepath="posts/$post"
  
  if [ ! -f "$filepath" ]; then
    echo "File $filepath does not exist, skipping"
    continue
  fi
  
  echo "Processing $filepath..."
  
  # Check if already has comments section
  if grep -q "comments-section" "$filepath"; then
    echo "  - Already has comments section, skipping..."
    continue
  fi
  
  # Add comments section before closing main content div
  sed -i '' 's|</div>.*<!-- Main Content -->|        <!-- Comments Section -->\
        <div class="comments-section">\
            <h2>Interactions & Comments</h2>\
            <div class="giscus"></div>\
        </div>\
    </div>\
\
    <!-- Main Content -->|g' "$filepath"
  
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
</body>|g' "$filepath"
  
  echo "  - Comments added to $filepath"
done

echo "All done! Comments added to all outreach posts."