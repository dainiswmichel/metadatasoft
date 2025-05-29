#!/bin/bash

# Final script to fix all remaining outreach post files that need comments section
# This script:
# 1. Creates a complete HTML file with proper structure for each remaining file
# 2. Preserves all the original content
# 3. Ensures proper placement of the comments section
# 4. Cleans up duplicate script tags

# Array of files that still need to be fixed
FILES=(
  "/Users/dainismichel/dainisne/da1.fm/outreach/posts/imogen-heap.html"
  "/Users/dainismichel/dainisne/da1.fm/outreach/posts/justin-blau-3lau.html"
  "/Users/dainismichel/dainisne/da1.fm/outreach/posts/rac-andr-allen-anjos.html"
  "/Users/dainismichel/dainisne/da1.fm/outreach/posts/richie-hawtin.html"
  "/Users/dainismichel/dainisne/da1.fm/outreach/posts/zo-keating.html"
)

for file in "${FILES[@]}"; do
  echo "Processing $file..."
  
  # Make a backup of the original file
  cp "$file" "${file}.original"
  
  # Extract the HTML head and body opening
  head_section=$(sed -n '/<html/,/<body>/p' "$file")
  
  # Extract main content (everything between main-content div)
  main_content=$(sed -n '/<div class="main-content">/,/<\/div>.*<!-- Right Sidebar Container -->/p' "$file" | 
                  grep -v '</div>.*<!-- Right Sidebar Container -->')
  
  # Extract everything after main content div
  footer_section=$(sed -n '/<div id="right-sidebar-container">/,/<\/html>/p' "$file" | 
                    grep -v '<!-- Giscus Comments -->' | 
                    grep -v '<script src="https:\/\/giscus.app\/client.js"' | 
                    grep -v '^[[:space:]]*data-' | 
                    grep -v '^[[:space:]]*async>' | 
                    grep -v '^[[:space:]]*crossorigin="anonymous">')
  
  # Create a new file with proper structure
  cat > "${file}.new" << EOF
$head_section

    <!-- Main Content -->
$main_content
        
        <!-- Comments Section -->
        <div class="comments-section">
            <h2>Interactions & Comments</h2>
            <div class="giscus"></div>
        </div>
    </div>

$footer_section

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
    </script>
</body>
</html>
EOF

  # Replace the original file with the new one
  mv "${file}.new" "$file"
  
  echo "Completed processing $file"
done

echo "All files have been successfully fixed!"