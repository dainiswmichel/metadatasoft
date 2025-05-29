#!/bin/bash
# Script to add the comments section to each file

cd "$(dirname "$0")"
echo "Adding comments section to all files that need it..."

FILES=(
  "posts/bt-brian-transeau.html"
  "posts/imogen-heap.html"
  "posts/justin-blau-3lau.html"
  "posts/rac-andr-allen-anjos.html"
  "posts/richie-hawtin.html"
  "posts/zo-keating.html"
)

for file in "${FILES[@]}"; do
  echo "Processing $file..."
  
  # Check if the file already has the comments section
  if grep -q "comments-section" "$file"; then
    echo "  - Already has comments section"
  else
    # Add the comments section before the closing main-content div
    sed -i '' 's|</div>.*<!-- Follow-up Plan -->|        </div>\n\n        <!-- Comments Section -->\n        <div class="comments-section">\n            <h2>Interactions \& Comments</h2>\n            <div class="giscus"></div>\n        </div>\n    </div>\n\n    <!-- Follow-up Plan -->|g' "$file"
    echo "  - Added comments section"
  fi
done

echo "All done!"