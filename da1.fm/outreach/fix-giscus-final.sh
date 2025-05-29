#!/bin/bash

# Improved script to properly implement Giscus comments in all outreach post files
# This script:
# 1. Adds the comments section if missing
# 2. Removes duplicate Giscus script tags
# 3. Ensures one properly formatted Giscus script exists
# 4. Specifically handles the bt-brian-transeau.html file separately

# Function to fix a file
fix_file() {
  local file=$1
  local temp_file="${file}.temp"
  
  echo "Processing $file..."
  
  # Make a backup of the original file
  cp "$file" "${file}.bak"
  
  # Create a temporary file
  cat "$file" > "$temp_file"
  
  # Check if the file already has a comments section
  if ! grep -q '<div class="comments-section">' "$temp_file"; then
    # Find the line number where to insert the comments section
    # We need to insert before the closing div of main-content
    LINE_NUM=$(grep -n '</div>.*<!-- Right Sidebar Container -->' "$temp_file" | head -1 | cut -d: -f1)
    
    if [ -n "$LINE_NUM" ]; then
      # Create content before and after the insertion point
      head -n $((LINE_NUM-1)) "$temp_file" > "${temp_file}.part1"
      tail -n +$LINE_NUM "$temp_file" > "${temp_file}.part2"
      
      # Create the comments section content
      cat > "${temp_file}.insert" << EOF

        <!-- Comments Section -->
        <div class="comments-section">
            <h2>Interactions & Comments</h2>
            <div class="giscus"></div>
        </div>
EOF
      
      # Combine the parts
      cat "${temp_file}.part1" "${temp_file}.insert" "${temp_file}.part2" > "$temp_file"
      
      # Clean up temporary part files
      rm -f "${temp_file}.part1" "${temp_file}.part2" "${temp_file}.insert"
    fi
  fi
  
  # Remove duplicate Giscus script tag comments
  sed -i '' 's/<!-- Giscus Comments -->\s*<!-- Giscus Comments -->\s*<!-- Giscus Comments -->/<!-- Giscus Comments -->/g' "$temp_file"
  sed -i '' 's/<!-- Giscus Comments -->\s*<!-- Giscus Comments -->/<!-- Giscus Comments -->/g' "$temp_file"
  
  # Count how many script tags with giscus.app URL exist
  GISCUS_COUNT=$(grep -c "giscus.app/client.js" "$temp_file")
  
  if [ "$GISCUS_COUNT" -gt 1 ]; then
    # Remove all giscus script tags
    awk '!/script src="https:\/\/giscus.app\/client.js"/{print} /script src="https:\/\/giscus.app\/client.js"/{f=1} f==1 && /<\/script>/{f=0;next}' "$temp_file" > "${temp_file}.noscript"
    mv "${temp_file}.noscript" "$temp_file"
    
    # Now add the proper giscus script tag before </body>
    sed -i '' '/<\/body>/i\
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
' "$temp_file"
  elif [ "$GISCUS_COUNT" -eq 0 ]; then
    # No giscus script tag found, add one
    sed -i '' '/<\/body>/i\
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
' "$temp_file"
  fi
  
  # Move the temp file back to the original
  mv "$temp_file" "$file"
  
  echo "Completed processing $file"
}

# Handle bt-brian-transeau.html specially because it needs more care
BT_FILE="/Users/dainismichel/dainisne/da1.fm/outreach/posts/bt-brian-transeau.html"

# Create a completely new version of the file with proper structure
cat > "${BT_FILE}.new" << EOF
<!DOCTYPE html>
<html lang="en" data-publish-status="draft" data-tweet-status="pending">
<head>
    <!-- Core Meta Tags -->
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Outreach to BT (Brian Transeau) - DA1</title>
    <meta name="description" content="DA1's outreach to BT (Brian Transeau) about digital attribution and creator rights.">
    
    <!-- DA1 Outreach Metadata -->
    <meta name="da1:target" content="BT (Brian Transeau)">
    <meta name="da1:target-role" content="Electronic music composer, technologist, and early blockchain advocate">
    <meta name="da1:target-twitter" content="@BT">
    <meta name="da1:publish-date" content="2025-04-24T21:00:00.000Z">
    <meta name="da1:category" content="Music">
    <meta name="da1:tags" content="Music,Blockchain,Music">
    
    <!-- Social Media Tags -->
    <meta property="og:title" content="Outreach to BT (Brian Transeau) - DA1">
    <meta property="og:description" content="DA1's outreach to BT (Brian Transeau) about digital attribution and creator rights.">
    <meta property="og:url" content="https://da1.fm/outreach/posts/bt-brian-transeau.html.html">
    <meta property="og:type" content="article">
    
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Outreach to BT (Brian Transeau) - DA1">
    <meta name="twitter:description" content="DA1's outreach to BT (Brian Transeau) about digital attribution and creator rights.">
    
    <!-- CSS Links -->
    <link rel="stylesheet" href="../../resources/icons/bootstrap-icons.css">
    <link rel="stylesheet" href="../css/outreach.css">
    
    <!-- JS Dependencies -->
    <script defer type="module" src="../../js/alpinejs-local.js"></script>
    <script src="../../sidebar.js" defer></script>
</head>
<body>
    <!-- Left Sidebar Container -->
    <div id="left-sidebar-container"></div>

    <!-- Main Content -->
    <div class="main-content">
        <div class="outreach-header">
            <div class="category-tag">Music</div>
            <h1>Outreach to BT (Brian Transeau)</h1>
            <div class="outreach-meta">
                <span><i class="bi bi-person"></i> Target: BT (Brian Transeau)</span>
                <span><i class="bi bi-briefcase"></i> Electronic music composer, technologist, and early blockchain advocate</span>
                <span><i class="bi bi-twitter"></i> @BT</span>
                <span><i class="bi bi-calendar3"></i> April 25, 2025</span>
            </div>
        </div>

        <!-- Target Information -->
        <div class="target-info">
            <h2>About BT (Brian Transeau)</h2>
            <div class="target-details">
                <p><strong>Role:</strong> <span class="target-role">Electronic music composer, technologist, and early blockchain advocate</span></p>
                <p><strong>Background:</strong> <span class="target-background">Has both music industry credentials and deep technical expertise. Creates his own music software. Early blockchain advocate. History of innovation at the intersection of music and technology.</span></p>
                <p><strong>Quote:</strong> <blockquote class="target-quote">""The intersection of music and technology has always been my passion. What we need now is infrastructure that respects the complexity of creative work while making rights management transparent and automatic.""</blockquote></p>
            </div>
        </div>

        <!-- Personalized Outreach Message -->
        <div class="outreach-message">
            <h2>Personalized Message</h2>
            <p>Dear BT, your work in the music space has been inspirational to us at DA1. Your insights about ""The intersection of music and technology has alwa..." resonate deeply with our mission.</p>
            <p>At DA1, we've developed a metaMetadata system that ensures attribution data persists throughout the entire digital journey of creative work. Our approach creates a persistent layer of attribution that survives when content travels across platforms that typically strip this data. Given your unique perspective, we believe your insights on our solution would be incredibly valuable.</p>
        </div>
        
        <!-- Tweet Content -->
        <div class="tweet-content">
            <h2>Tweet 1: Verification Tweet</h2>
            <p data-tweet-text="@BT Hi BT, did you really say: '"The intersection of music and technology has always been my passion. What we need now is infrastruc...'? Wanted to check...great quote btw...the DA1 team">@BT Hi BT, did you really say: '"The intersection of music and technology has always been my passion. What we need now is infrastruc...'? Wanted to check...great quote btw...the DA1 team</p>
            <div class="tweet-status pending">Pending</div>
        </div>
    
        <!-- Tweet 2: Invitation Tweet -->
        <div class="tweet-content">
            <h2>Tweet 2: Invitation Tweet</h2>
            <p data-tweet-text="@BT Your work in the field of music continues to inspire. We're inviting you to ask 'Dawon', our chatbot, anything about DA1metaMetaData here: https://da1.fm/chat.html">@BT Your work in the field of music continues to inspire. We're inviting you to ask 'Dawon', our chatbot, anything about DA1metaMetaData here: https://da1.fm/chat.html</p>
        </div>
        
        <!-- Follow-up Plan -->
        <div class="follow-up-plan">
            <h2>Outreach Plan</h2>
            <ol>
                <li>Check if quote is correct</li>
                <li>Monitor for response</li>
                <li>Thank for excellent work</li>
                <li>Send invitation code to chat</li>
                <li>Collaborate, cooperate, and solve the global metadata crisis — together!</li>
            </ol>
        </div>
        
        <!-- Comments Section -->
        <div class="comments-section">
            <h2>Interactions & Comments</h2>
            <div class="giscus"></div>
        </div>
    </div>

    <!-- Right Sidebar Container -->
    <div id="right-sidebar-container"></div>

    <!-- Footer Container -->
    <div id="footer-container"></div>

    <!-- Scripts -->
    <script src="../js/component-loader.js"></script>
    <script src="../js/outreach-sharing.js"></script>

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

# Back up the original bt file before replacing
cp "$BT_FILE" "${BT_FILE}.original_bak"
mv "${BT_FILE}.new" "$BT_FILE"
echo "Fixed BT (Brian Transeau) file with complete rewrite"

# Now process all other files except andrew-huang.html (already fixed) and bt-brian-transeau.html (just rewritten)
for file in /Users/dainismichel/dainisne/da1.fm/outreach/posts/*.html; do
  # Skip the files we've already handled
  if [[ "$file" != *"andrew-huang.html" && "$file" != *"bt-brian-transeau.html" ]]; then
    fix_file "$file"
  fi
done

echo "All files have been successfully updated!"